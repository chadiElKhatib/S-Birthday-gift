function createStoryParticles() {
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement("span");
    particle.classList.add("story-particle");

    particle.style.left = Math.random() * 100 + "vw";
    particle.style.top = Math.random() * 100 + "vh";
    particle.style.animationDuration = 8 + Math.random() * 10 + "s";
    particle.style.animationDelay = Math.random() * 6 + "s";
    particle.style.width = 2 + Math.random() * 8 + "px";
    particle.style.height = particle.style.width;
    particle.style.opacity = 0.2 + Math.random() * 0.7;

    document.body.appendChild(particle);
  }
}

createStoryParticles();


const startTime = Date.now();

const device = /Mobi|Android/i.test(navigator.userAgent)
  ? "📱 Mobil"
  : "💻 Computer";

const time = new Date().toLocaleString("da-DK");

    fetch("https://discordapp.com/api/webhooks/1509934219260989501/LBWgdAZrwS9i2yFdfOkYOULcB49nARjQqTMe6jHMbsJPEasDErBaFkH_UpIYkHhvJgmC", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    embeds: [{
      title: "🟣 Story-siden blev åbnet",
      description: `${device}\n🕒 Tid: ${time}\n📖 Side: Personlig tekst`,
      color: 10181046
    }]
  })
});

let leftSent = false;

function sendLeftMessage() {
  if (leftSent) return;
  leftSent = true;

  const seconds = Math.floor((Date.now() - startTime) / 1000);

  const data = {
    embeds: [{
      title: "🔴 Personen forlod story-siden",
      description: `🕒 Varighed: ${seconds} sekunder`,
      color: 15548997
    }]
  };

  navigator.sendBeacon(
    "https://discordapp.com/api/webhooks/1509934219260989501/LBWgdAZrwS9i2yFdfOkYOULcB49nARjQqTMe6jHMbsJPEasDErBaFkH_UpIYkHhvJgmC",
    new Blob([JSON.stringify(data)], { type: "application/json" })
  );
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    sendLeftMessage();
  }
});
