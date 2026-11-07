(() => {
  "use strict";

  const form = document.getElementById("lockForm");
  const fields = document.getElementById("lockFields");
  const button = document.getElementById("lockButton");
  const message = document.getElementById("lockMessage");
  const loading = document.getElementById("lockLoading");

  const RELOAD_KEY = "lockReloads";
  const hasServiceWorker = "serviceWorker" in navigator;

  let config = null;

  function track(eventName, extra) {
    try {
      window.trackWebsiteEvent?.(eventName, extra);
    } catch {
      // Tracking må aldrig stoppe siden
    }
  }

  function fromBase64(text) {
    return Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
  }

  let inputs = [];

  function answers() {
    return inputs.map((input) => input.value);
  }

  async function deriveRawKey() {
    const material = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(
        window.GaveAnswers.combine(answers(), config.questions),
      ),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    return crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        salt: fromBase64(config.salt),
        iterations: config.iterations,
      },
      material,
      256,
    );
  }

  async function checkKey(raw) {
    const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, [
      "decrypt",
    ]);
    const response = await fetch("vault/manifest.bin", { cache: "no-cache" });
    const bytes = new Uint8Array(await response.arrayBuffer());
    try {
      await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: bytes.slice(0, 12) },
        key,
        bytes.slice(12),
      );
      return true;
    } catch {
      return false;
    }
  }

  function ask(worker, data, transfer) {
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => resolve(event.data);
      worker.postMessage(data, [channel.port2, ...(transfer || [])]);
    });
  }

  async function readyWorker() {
    const registration = await navigator.serviceWorker.ready;
    return registration.active;
  }

  function reload() {
    let count = 0;
    try {
      count = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
      sessionStorage.setItem(RELOAD_KEY, String(count + 1));
    } catch {
      // ignoreres
    }
    if (count >= 3) return false;
    location.reload();
    return true;
  }

  function showForm() {
    loading.hidden = true;
    form.hidden = false;
    inputs = config.questions.map((q, i) => {
      const label = document.createElement("label");
      label.className = "lock-question";
      label.htmlFor = `lockAnswer${i}`;
      label.textContent = q.text;

      const input = document.createElement("input");
      input.id = `lockAnswer${i}`;
      input.className = "lock-input";
      input.type = "text";
      input.required = true;
      input.autocomplete = "off";
      input.setAttribute("autocapitalize", "off");
      input.setAttribute("autocorrect", "off");
      input.spellcheck = false;
      input.enterKeyHint = i === config.questions.length - 1 ? "go" : "next";
      if (q.placeholder) input.placeholder = q.placeholder;

      fields.append(label, input);
      return input;
    });
    inputs[0].focus({ preventScroll: true });
  }

  async function start() {
    config = await (await fetch("lock/config.json", { cache: "no-cache" })).json();

    if (hasServiceWorker) {
      try {
        await navigator.serviceWorker.register("sw.js");
        const worker = await readyWorker();
        const status = await ask(worker, { type: "status" });
        if (status.unlocked && reload()) return;
      } catch {
        // Fortsætter til formularen
      }
    }

    showForm();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (inputs.some((input) => !input.value.trim())) return;

    button.disabled = true;
    message.textContent = "Et øjeblik…";

    try {
      const raw = await deriveRawKey();

      if (!(await checkKey(raw))) {
        message.textContent = "Det er ikke helt rigtigt. Prøv igen.";
        track("🔒 FORKERT SVAR");
        return;
      }

      track("🔓 GAVEN BLEV LÅST OP");

      if (!hasServiceWorker) {
        message.textContent =
          "Åbn linket i Safari eller Chrome for at se det.";
        return;
      }

      const worker = await readyWorker();
      const result = await ask(worker, { type: "unlock", key: raw }, []);

      if (!result.ok) throw new Error(result.error);

      try {
        sessionStorage.removeItem(RELOAD_KEY);
      } catch {
        // ignoreres
      }

      message.textContent = "";
      location.reload();
    } catch {
      message.textContent =
        "Noget gik galt. Prøv igen, eller åbn linket i Safari eller Chrome.";
    } finally {
      button.disabled = false;
    }
  });

  start().catch(() => {
    loading.textContent = "Siden kunne ikke indlæses. Prøv igen om lidt.";
  });
})();
