function createStoryParticles() {
  for (let i = 0; i < 40; i++) {
    const particle = document.createElement("span");

    particle.classList.add("story-particle");

    particle.style.left = Math.random() * 100 + "vw";
    particle.style.top = Math.random() * 100 + "vh";
    particle.style.animationDuration = 9 + Math.random() * 12 + "s";
    particle.style.animationDelay = Math.random() * 6 + "s";
    particle.style.width = 2 + Math.random() * 6 + "px";
    particle.style.height = particle.style.width;
    particle.style.opacity = 0.2 + Math.random() * 0.6;

    document.body.appendChild(particle);
  }
}

createStoryParticles();

// Afsnittene folder sig blidt ind, som naar man laeser et brev,
// i stedet for bare at staa der fra start.
const paragraphs = document.querySelectorAll(".story-page p");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
);

paragraphs.forEach((p) => revealObserver.observe(p));

// "Til toppen"-knappen dukker op naar man har laest et stykke nede
const toTopBtn = document.getElementById("toTopBtn");

if (toTopBtn) {
  toTopBtn.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 400) {
        toTopBtn.classList.add("is-visible");
      } else {
        toTopBtn.classList.remove("is-visible");
      }
    },
    { passive: true }
  );
}
