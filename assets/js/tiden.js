function createTimeParticles() {
  const container = document.querySelector(".time-particles");
  if (!container) return;

  for (let i = 0; i < 26; i++) {
    const grain = document.createElement("span");

    grain.classList.add("time-particle");

    const size = 2 + Math.random() * 3;
    grain.style.width = size + "px";
    grain.style.height = size + "px";
    grain.style.left = Math.random() * 100 + "vw";
    grain.style.setProperty("--drift", Math.random() * 60 - 30 + "px");
    grain.style.animationDuration = 10 + Math.random() * 14 + "s";
    grain.style.animationDelay = Math.random() * 12 + "s";

    container.appendChild(grain);
  }
}

createTimeParticles();

const breakupDate = new Date("2025-12-17T02:17:00");

const monthsElement =
  document.getElementById("months");

const daysElement =
  document.getElementById("days");

const hoursElement =
  document.getElementById("hours");

const minutesElement =
  document.getElementById("minutes");

const secondsElement =
  document.getElementById("seconds");

function updateCounter() {
  const now = new Date();

  if (now < breakupDate) {
    return;
  }

  let years =
    now.getFullYear() -
    breakupDate.getFullYear();

  let months =
    now.getMonth() -
    breakupDate.getMonth();

  let days =
    now.getDate() -
    breakupDate.getDate();

  let hours =
    now.getHours() -
    breakupDate.getHours();

  let minutes =
    now.getMinutes() -
    breakupDate.getMinutes();

  let seconds =
    now.getSeconds() -
    breakupDate.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes--;
  }

  if (minutes < 0) {
    minutes += 60;
    hours--;
  }

  if (hours < 0) {
    hours += 24;
    days--;
  }

  if (days < 0) {
    const previousMonth =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        0
      );

    days += previousMonth.getDate();
    months--;
  }

  if (months < 0) {
    months += 12;
    years--;
  }

  const totalMonths =
    years * 12 + months;

  monthsElement.textContent =
    totalMonths;

  daysElement.textContent =
    days;

  hoursElement.textContent =
    String(hours).padStart(2, "0");

  minutesElement.textContent =
    String(minutes).padStart(2, "0");

  secondsElement.textContent =
    String(seconds).padStart(2, "0");
}

updateCounter();

setInterval(
  updateCounter,
  1000
);