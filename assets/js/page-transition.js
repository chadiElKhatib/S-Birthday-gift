/*
 * Bløde overgange mellem siderne.
 * Når man trykker på et link til en anden side, toner skærmen ud i
 * den nye sides farve – og den nye side toner frem fra samme farve.
 *
 * Filen indlæses i <head>, så overgangen er klar, før siden tegnes
 * (ellers ville man se et kort blink).
 */
(() => {
  "use strict";

  const LEAVE_MS = 560;
  const KEY = "pageTransitionColor";

  // Hver side har sin egen farve – samme univers som slideshowet
  const COLORS = {
    "index.html": "#0a0410",
    "story.html": "#0b0705",
    "tiden.html": "#050916",
  };

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const style = document.createElement("style");
  // Sløret ligger på selve <html>, så det dækker siden, før <body> findes
  style.textContent = `
    html::after {
      content: "";
      position: fixed;
      inset: 0;
      z-index: 9999;
      pointer-events: none;
      background: var(--page-fade-color, #000);
      opacity: 0;
      transition: opacity var(--page-fade-ms, ${LEAVE_MS}ms) ease;
    }
    html.page-arriving::after,
    html.page-leaving::after {
      opacity: 1;
    }
    html.page-arriving::after {
      transition: none;
    }
    html.page-leaving::after {
      pointer-events: auto;
    }
  `;
  document.head.appendChild(style);

  const root = document.documentElement;

  let arrivalColor = null;
  try {
    arrivalColor = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
  } catch {
    // Privat fane: så springer vi bare overgangen over
  }

  if (arrivalColor && !reducedMotion) {
    root.classList.add("page-arriving");
    root.style.setProperty("--page-fade-color", arrivalColor);
  }

  function pageName(url) {
    return url.pathname.split("/").pop() || "index.html";
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Den nye side toner frem
    if (root.classList.contains("page-arriving")) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          root.style.setProperty("--page-fade-ms", "900ms");
          root.classList.remove("page-arriving");
        }),
      );
    }

    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");

      if (
        !link ||
        link.target ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        reducedMotion
      ) {
        return;
      }

      const url = new URL(link.href, location.href);
      const page = pageName(url);

      if (url.origin !== location.origin || !COLORS[page]) return;
      if (page === pageName(location) && url.hash) return;

      event.preventDefault();

      const color = COLORS[page];

      try {
        sessionStorage.setItem(KEY, color);
      } catch {
        // ignoreres
      }

      root.style.removeProperty("--page-fade-ms");
      root.style.setProperty("--page-fade-color", color);
      root.classList.add("page-leaving");

      setTimeout(() => {
        location.href = link.href;
      }, LEAVE_MS);
    });
  });

  // Kommer man tilbage med browserens tilbage-knap, skal skærmen ikke stå mørk
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) root.classList.remove("page-leaving", "page-arriving");
  });
})();
