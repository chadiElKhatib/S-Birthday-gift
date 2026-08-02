function createStoryParticles() {
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement("span");

    particle.classList.add("story-particle");

    particle.style.left =
      Math.random() * 100 + "vw";

    particle.style.top =
      Math.random() * 100 + "vh";

    particle.style.animationDuration =
      8 + Math.random() * 10 + "s";

    particle.style.animationDelay =
      Math.random() * 6 + "s";

    particle.style.width =
      2 + Math.random() * 8 + "px";

    particle.style.height =
      particle.style.width;

    particle.style.opacity =
      0.2 + Math.random() * 0.7;

    document.body.appendChild(particle);
  }
}

createStoryParticles();