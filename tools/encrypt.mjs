#!/usr/bin/env node
/*
 * Krypterer fødselsdagsgaven.
 *
 *   GAVE_SPOERGSMAAL_1="..." GAVE_SVAR_1="..." \\
 *   GAVE_SPOERGSMAAL_2="..." GAVE_SVAR_2="..." \\
 *   node tools/encrypt.mjs <original-mappe> <output-mappe>
 *
 * <original-mappe> er den ukrypterede side (index.html, story.html, assets/...).
 * Den må ALDRIG lægges på GitHub. Output-mappen er det, der pushes.
 * Svarene gemmes ingen steder – de bruges kun til at lave nøglen.
 * Svar 2 er en dato, så "3 marts 2001", "3/3/2001" osv. giver samme nøgle.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ITERATIONS = 600000;

// Filer der ligger ukrypteret, fordi låsesiden selv bruger dem
const PUBLIC_FILES = new Set(["assets/js/tracker.js"]);
const SKIP = new Set([".git", ".gitattributes", ".DS_Store", "tools"]);

const TYPES = {
  html: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  json: "application/json; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  woff2: "font/woff2",
};

function walk(dir, base = dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walk(full, base));
    else result.push(path.relative(base, full).split(path.sep).join("/"));
  }
  return result;
}

function encrypt(key, data) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(data), cipher.final()]);
  return Buffer.concat([iv, body, cipher.getAuthTag()]);
}

function copyDir(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      copyDir(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

const [srcDir, outDir] = process.argv.slice(2);
const templateDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

await import(pathToFileURL(path.join(templateDir, "lock", "answers.js")).href);
const { combine } = globalThis.GaveAnswers;

// Spørgsmålene står i klartekst på låsesiden. Svarene gemmes ingen steder.
const questions = [
  { text: process.env.GAVE_SPOERGSMAAL_1, kind: "text" },
  {
    text: process.env.GAVE_SPOERGSMAAL_2,
    kind: "date",
    placeholder: "fx 1. januar 2000",
  },
];
const answers = [process.env.GAVE_SVAR_1, process.env.GAVE_SVAR_2];

if (!srcDir || !outDir || questions.some((q) => !q.text) || answers.some((a) => !a?.trim())) {
  console.error(
    'Brug: GAVE_SPOERGSMAAL_1=".." GAVE_SVAR_1=".." GAVE_SPOERGSMAAL_2=".." GAVE_SVAR_2=".." node tools/encrypt.mjs <original-mappe> <output-mappe>',
  );
  process.exit(1);
}

fs.rmSync(path.join(outDir, "vault"), { recursive: true, force: true });
fs.mkdirSync(path.join(outDir, "vault"), { recursive: true });

// Låseside, service worker og værktøjet selv
for (const name of ["index.html", "sw.js", ".nojekyll", ".gitattributes"]) {
  const file = path.join(templateDir, name);
  if (fs.existsSync(file)) fs.copyFileSync(file, path.join(outDir, name));
}
for (const dir of ["lock", "tools"]) {
  fs.mkdirSync(path.join(outDir, dir), { recursive: true });
  copyDir(path.join(templateDir, dir), path.join(outDir, dir));
}

const salt = crypto.randomBytes(16);
const key = crypto.pbkdf2Sync(
  Buffer.from(combine(answers, questions), "utf8"),
  salt,
  ITERATIONS,
  32,
  "sha256",
);

const manifest = { files: {} };
let total = 0;

for (const file of walk(srcDir)) {
  const data = fs.readFileSync(path.join(srcDir, file));

  if (PUBLIC_FILES.has(file)) {
    fs.mkdirSync(path.dirname(path.join(outDir, file)), { recursive: true });
    fs.writeFileSync(path.join(outDir, file), data);
    continue;
  }

  const ext = path.extname(file).slice(1).toLowerCase();
  const id = crypto.randomBytes(12).toString("hex");
  manifest.files[file] = { id, type: TYPES[ext] || "application/octet-stream" };
  fs.writeFileSync(path.join(outDir, "vault", `${id}.bin`), encrypt(key, data));
  total += data.length;
}

fs.writeFileSync(
  path.join(outDir, "vault", "manifest.bin"),
  encrypt(key, Buffer.from(JSON.stringify(manifest))),
);

fs.writeFileSync(
  path.join(outDir, "lock", "config.json"),
  JSON.stringify(
    { questions, salt: salt.toString("base64"), iterations: ITERATIONS },
    null,
    2,
  ) + "\n",
);

console.log(
  `Krypterede ${Object.keys(manifest.files).length} filer (${(total / 1048576).toFixed(1)} MB) til ${outDir}`,
);
