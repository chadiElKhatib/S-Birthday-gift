const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

function createStoryParticles() {
  const count = window.innerWidth <= 480 ? 24 : 40;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("span");

    particle.classList.add("story-particle");

    const size = 2 + Math.random() * 6;

    particle.style.left = Math.random() * 100 + "vw";
    particle.style.top = Math.random() * 100 + "vh";
    particle.style.animationDuration = 9 + Math.random() * 12 + "s";
    particle.style.animationDelay = Math.random() * 6 + "s";
    particle.style.width = size + "px";
    particle.style.height = size + "px";
    particle.style.setProperty("--particle-opacity", 0.2 + Math.random() * 0.6);
    particle.style.setProperty("--drift", Math.random() * 30 - 15 + "px");

    document.body.appendChild(particle);
  }
}

createStoryParticles();

// Afsnittene folder sig blidt ind, som naar man laeser et brev,
// i stedet for bare at staa der fra start.
const paragraphs = document.querySelectorAll(".story-page p");

const revealObserver = new IntersectionObserver(
  (entries) => {
    // Afsnit der dukker op samtidig, kommer frem lidt forskudt
    let delay = 0;

    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${delay}ms`;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);

        delay += reducedMotion ? 0 : 140;
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
);

paragraphs.forEach((p) => revealObserver.observe(p));

// Et støvkorn eller en lille glød falder af og til gennem lysets skær
const motes = document.getElementById("motes");

function dropMote() {
  if (motes && document.visibilityState === "visible" && motes.childElementCount < 7) {
    const mote = document.createElement("span");
    const isEmber = Math.random() < 0.35;
    const size = isEmber ? 2.5 + Math.random() * 2.5 : 1.5 + Math.random() * 2;

    mote.className = isEmber ? "mote ember" : "mote";
    // Mest i lyskeglen under stearinlyset, midt på siden
    mote.style.left = 50 + (Math.random() - 0.5) * 60 + "vw";
    mote.style.width = size + "px";
    mote.style.height = size + "px";
    mote.style.setProperty("--sway", (Math.random() * 40 - 20).toFixed(1) + "px");
    mote.style.animationDuration = 9 + Math.random() * 7 + "s";

    motes.appendChild(mote);
    mote.addEventListener("animationend", () => mote.remove());
  }

  setTimeout(dropMote, 1800 + Math.random() * 3200);
}

if (!reducedMotion) {
  setTimeout(dropMote, 2500);
}

// Blødt piano, der starter ved første tryk (iPhone kræver et tryk)
createAmbientSound({
  button: document.getElementById("soundButton"),
  hint: document.getElementById("soundHint"),
  element: document.getElementById("pianoMusic"),
  volume: 0.16,
  fadeSeconds: 6,
});

// "Til toppen"-knappen og laese-linjen foelger hvor langt man er naaet
const toTopBtn = document.getElementById("toTopBtn");
const readingProgress = document.querySelector(".reading-progress");

let scrollFrame = null;

function updateScrollUi() {
  scrollFrame = null;

  const scrollableHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  const progress =
    scrollableHeight > 0 ? Math.min(1, window.scrollY / scrollableHeight) : 0;

  readingProgress?.style.setProperty("--read-progress", progress.toFixed(4));
  toTopBtn?.classList.toggle("is-visible", window.scrollY > 400);
}

window.addEventListener(
  "scroll",
  () => {
    if (scrollFrame === null) {
      scrollFrame = requestAnimationFrame(updateScrollUi);
    }
  },
  { passive: true }
);

updateScrollUi();

if (toTopBtn) {
  toTopBtn.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });
}
