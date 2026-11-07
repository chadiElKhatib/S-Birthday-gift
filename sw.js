/*
 * Låser fødselsdagsgaven op.
 *
 * Alle sider, billeder, videoer og lyd ligger krypteret i vault/.
 * Når det rigtige svar er skrevet på forsiden, får denne service worker
 * nøglen. Derefter dekrypterer den filerne i browseren, så siden virker
 * præcis som før – med de samme stier (index.html, assets/...).
 * Uden nøglen findes der kun krypteret data på serveren.
 */
"use strict";

const DB_NAME = "gave-vault";
const STORE = "keys";
const MEDIA_CACHE_LIMIT = 80 * 1024 * 1024;

let cryptoKey = null;
let manifest = null;
let loading = null;
const mediaCache = new Map();
let mediaCacheSize = 0;

const scopeUrl = new URL(self.registration.scope);

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbGet(name) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(name);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbSet(name, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    if (value === undefined) tx.objectStore(STORE).delete(name);
    else tx.objectStore(STORE).put(value, name);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function fetchVault(id) {
  const response = await fetch(new URL(`vault/${id}.bin`, scopeUrl), {
    cache: "no-cache",
  });
  if (!response.ok) throw new Error(`vault ${id}: ${response.status}`);
  return response.arrayBuffer();
}

async function decrypt(buffer, key = cryptoKey) {
  const bytes = new Uint8Array(buffer);
  return crypto.subtle.decrypt(
    { name: "AES-GCM", iv: bytes.slice(0, 12) },
    key,
    bytes.slice(12),
  );
}

async function useRawKey(raw) {
  const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, [
    "decrypt",
  ]);
  const plain = await decrypt(await fetchVault("manifest"), key);
  manifest = JSON.parse(new TextDecoder().decode(plain));
  cryptoKey = key;
}

async function forget() {
  cryptoKey = null;
  manifest = null;
  mediaCache.clear();
  mediaCacheSize = 0;
  await dbSet("key", undefined);
}

// Henter nøglen fra IndexedDB, når service workeren er blevet genstartet.
function ensureKey() {
  if (cryptoKey) return Promise.resolve(true);
  if (!loading) {
    loading = (async () => {
      try {
        const raw = await dbGet("key");
        if (!raw) return false;
        await useRawKey(raw);
        return true;
      } catch {
        // Nøglen passer ikke længere (gaven er krypteret på ny)
        await forget().catch(() => {});
        return false;
      } finally {
        loading = null;
      }
    })();
  }
  return loading;
}

self.addEventListener("message", (event) => {
  const data = event.data || {};
  const port = event.ports[0];

  if (data.type === "unlock") {
    event.waitUntil(
      (async () => {
        try {
          await useRawKey(data.key);
          await dbSet("key", data.key);
          port?.postMessage({ ok: true });
        } catch (error) {
          port?.postMessage({ ok: false, error: String(error) });
        }
      })(),
    );
  } else if (data.type === "status") {
    event.waitUntil(
      ensureKey().then((ok) => port?.postMessage({ unlocked: ok })),
    );
  } else if (data.type === "lock") {
    event.waitUntil(forget().then(() => port?.postMessage({ ok: true })));
  }
});

function relativePath(url) {
  let path = decodeURIComponent(url.pathname);
  const base = decodeURIComponent(scopeUrl.pathname);
  if (!path.startsWith(base)) return null;
  path = path.slice(base.length);
  if (path === "" || path.endsWith("/")) path += "index.html";
  return path;
}

function remember(path, buffer) {
  if (buffer.byteLength > MEDIA_CACHE_LIMIT) return;
  mediaCache.set(path, buffer);
  mediaCacheSize += buffer.byteLength;
  for (const [oldPath, oldBuffer] of mediaCache) {
    if (mediaCacheSize <= MEDIA_CACHE_LIMIT) break;
    if (oldPath === path) continue;
    mediaCache.delete(oldPath);
    mediaCacheSize -= oldBuffer.byteLength;
  }
}

async function plainFile(path, entry) {
  const cached = mediaCache.get(path);
  if (cached) {
    // Flyt til "senest brugt"
    mediaCache.delete(path);
    mediaCache.set(path, cached);
    return cached;
  }
  const buffer = await decrypt(await fetchVault(entry.id));
  if (/^(video|audio)\//.test(entry.type)) remember(path, buffer);
  return buffer;
}

// Safari kræver "Range"-svar (206) for at kunne afspille video og lyd.
function buildResponse(request, buffer, type) {
  const total = buffer.byteLength;
  const headers = {
    "Content-Type": type,
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-store",
  };
  const range = request.headers.get("range");
  const match = range && /bytes=(\d*)-(\d*)/.exec(range);

  if (match) {
    let start;
    let end;
    if (match[1] === "") {
      const suffix = Number(match[2]);
      start = Math.max(0, total - suffix);
      end = total - 1;
    } else {
      start = Number(match[1]);
      end = match[2] === "" ? total - 1 : Math.min(Number(match[2]), total - 1);
    }

    if (start >= total || start > end) {
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${total}` },
      });
    }

    return new Response(buffer.slice(start, end + 1), {
      status: 206,
      headers: {
        ...headers,
        "Content-Range": `bytes ${start}-${end}/${total}`,
        "Content-Length": String(end - start + 1),
      },
    });
  }

  return new Response(buffer, {
    status: 200,
    headers: { ...headers, "Content-Length": String(total) },
  });
}

async function handle(request, path) {
  const unlocked = await ensureKey();
  const entry = unlocked && manifest.files[path];
  if (!entry) return fetch(request);

  try {
    const buffer = await plainFile(path, entry);
    return buildResponse(request, buffer, entry.type);
  } catch {
    return fetch(request);
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== scopeUrl.origin) return;

  const path = relativePath(url);
  if (!path || path === "sw.js" || path.startsWith("vault/") || path.startsWith("lock/")) {
    return;
  }

  event.respondWith(handle(request, path));
});

