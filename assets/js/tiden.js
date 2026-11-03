const isSmallScreen = window.innerWidth <= 480;

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const rand = (min, max) => min + Math.random() * (max - min);

// ---------------- BYENS LYS BAG RUDEN ----------------
/*
 * Bløde, slørede lyspletter (gadelamper, vinduer, baglygter),
 * som man ser dem gennem en våd rude om natten.
 * Tegnet med gradienter i stedet for filter: blur, så det er let for iPhone.
 */
const CITY_COLORS = [
  "255, 196, 120", // gadelampe
  "255, 214, 160", // varmt vindue
  "255, 238, 205", // hvidt lys
  "255, 110, 90", // baglygte
  "120, 170, 255", // koldt neonlys
  "220, 140, 220", // svag rosa
];

function createCityLights() {
  const container = document.querySelector(".city-lights");
  if (!container) return;

  const count = isSmallScreen ? 20 : 30;

  for (let i = 0; i < count; i++) {
    const light = document.createElement("span");
    const size = rand(40, isSmallScreen ? 130 : 190);
    const color = CITY_COLORS[Math.floor(Math.random() * CITY_COLORS.length)];

    light.className = "city-light";
    light.style.width = size + "px";
    light.style.height = size + "px";
    light.style.left = rand(-5, 95) + "%";
    light.style.top = rand(8, 96) + "%";
    light.style.setProperty("--color", color);
    light.style.setProperty("--peak", rand(0.4, 0.9).toFixed(2));
    light.style.setProperty("--dx", rand(-14, 14).toFixed(1) + "px");
    light.style.animationDuration = rand(7, 15).toFixed(1) + "s";
    light.style.animationDelay = -rand(0, 15).toFixed(1) + "s";

    container.appendChild(light);
  }

  // Af og til glider et par lygter forbi nede på gaden
  const passCar = () => {
    if (document.visibilityState === "visible" && !reducedMotion) {
      const car = document.createElement("span");
      const towardsRight = Math.random() < 0.5;

      car.className = "car-lights";
      car.style.top = rand(70, 90) + "%";
      car.style.setProperty("--from", towardsRight ? "-30vw" : "120vw");
      car.style.setProperty("--to", towardsRight ? "120vw" : "-30vw");
      car.style.setProperty("--color", towardsRight ? "255, 236, 205" : "255, 110, 90");
      car.style.animationDuration = rand(7, 11).toFixed(1) + "s";

      container.appendChild(car);
      car.addEventListener("animationend", () => car.remove());
    }

    setTimeout(passCar, rand(9000, 17000));
  };

  setTimeout(passCar, 3500);
}

createCityLights();

// ---------------- REGN PÅ RUDEN ----------------
/*
 * Små dråber sætter sig på glasset. Større dråber løber ned,
 * tager de små med sig og bliver større – og efterlader et spor
 * af små dråber, som rigtig regn på en rude.
 */
function createRainOnGlass() {
  const canvas = document.getElementById("rainGlass");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const ratio = Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1.5 : 2);

  const MAX_STATIC = isSmallScreen ? 320 : 560;
  const MAX_SLIDERS = isSmallScreen ? 14 : 22;

  let width = 0;
  let height = 0;
  let statics = [];
  let sliders = [];

  // Én dråbe tegnes på forhånd og genbruges (meget hurtigere end gradienter pr. dråbe)
  const sprite = document.createElement("canvas");
  sprite.width = 64;
  sprite.height = 64;

  const s = sprite.getContext("2d");
  const body = s.createRadialGradient(28, 26, 2, 32, 34, 31);
  body.addColorStop(0, "rgba(255, 255, 255, 0.8)");
  body.addColorStop(0.25, "rgba(215, 228, 255, 0.34)");
  body.addColorStop(0.75, "rgba(160, 185, 240, 0.2)");
  body.addColorStop(0.92, "rgba(6, 10, 24, 0.6)");
  body.addColorStop(1, "rgba(10, 16, 34, 0)");
  s.fillStyle = body;
  s.beginPath();
  s.arc(32, 32, 31, 0, Math.PI * 2);
  s.fill();

  // Lille lysrefleks øverst til venstre
  s.fillStyle = "rgba(255, 255, 255, 0.95)";
  s.beginPath();
  s.ellipse(24, 21, 5, 3.5, -0.5, 0, Math.PI * 2);
  s.fill();

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    statics = statics.filter((d) => d.x < width && d.y < height);
  }

  function addStatic(x = rand(0, width), y = rand(0, height), r = rand(1.1, 3.8)) {
    if (statics.length >= MAX_STATIC) statics.shift();
    statics.push({ x, y, r });
  }

  function addSlider() {
    sliders.push({
      x: rand(0, width),
      y: rand(-20, height * 0.5),
      r: rand(4.5, 8.5),
      speed: 0,
      wobble: rand(0, Math.PI * 2),
      pause: rand(0, 1.5),
      trailGap: rand(10, 26),
      lastTrail: 0,
    });
  }

  function drawDrop(x, y, r) {
    // Dråber er lidt aflange, når de hænger på glas
    ctx.drawImage(sprite, x - r, y - r * 1.1, r * 2, r * 2.2);
  }

  resize();

  for (let i = 0; i < MAX_STATIC * 0.7; i++) addStatic();
  for (let i = 0; i < MAX_SLIDERS * 0.5; i++) addSlider();

  if (reducedMotion) {
    statics.forEach((d) => drawDrop(d.x, d.y, d.r));
    return;
  }

  let last = performance.now();
  let spawnStatic = 0;
  let spawnSlider = 0;

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // Nye små dråber og nye løbende dråber
    spawnStatic += dt * 26;
    while (spawnStatic > 1) {
      addStatic();
      spawnStatic--;
    }

    spawnSlider += dt;
    if (spawnSlider > rand(0.35, 0.9) && sliders.length < MAX_SLIDERS) {
      addSlider();
      spawnSlider = 0;
    }

    ctx.clearRect(0, 0, width, height);

    for (const d of statics) drawDrop(d.x, d.y, d.r);

    for (let i = sliders.length - 1; i >= 0; i--) {
      const drop = sliders[i];

      // Dråben hænger lidt, sætter så i gang – tungere dråber løber hurtigere
      if (drop.pause > 0) {
        drop.pause -= dt;
      } else {
        const target = 30 + drop.r * 22;
        drop.speed += (target - drop.speed) * dt * 2.5;
        drop.y += drop.speed * dt;
        drop.wobble += dt * 3;
        drop.x += Math.sin(drop.wobble) * dt * 6;

        if (Math.random() < dt * 0.4) drop.pause = rand(0.2, 0.9);
      }

      // Den løbende dråbe samler de små dråber op, den rammer
      for (let j = statics.length - 1; j >= 0; j--) {
        const d = statics[j];
        const dx = d.x - drop.x;
        const dy = d.y - drop.y;

        if (dx * dx + dy * dy < (drop.r + d.r) * (drop.r + d.r)) {
          drop.r = Math.min(12, Math.sqrt(drop.r * drop.r + d.r * d.r * 0.6));
          statics.splice(j, 1);
        }
      }

      // Efterlader et spor af små dråber
      if (drop.y - drop.lastTrail > drop.trailGap && drop.speed > 20) {
        drop.lastTrail = drop.y;
        addStatic(drop.x + rand(-1.5, 1.5), drop.y - drop.r * 1.4, rand(0.7, 1.8));
        drop.r = Math.max(3, drop.r - 0.05);
      }

      drawDrop(drop.x, drop.y, drop.r);

      if (drop.y - drop.r > height) sliders.splice(i, 1);
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });
}

createRainOnGlass();

// ---------------- REGNLYD (Web Audio, ingen fil) ----------------
/*
 * Blød regn: lyserød støj gennem filtre, der langsomt ændrer sig,
 * plus små dråbe-lyde mod ruden en gang imellem.
 */
function buildRainSound(ctx, out) {
  const seconds = 4;
  const buffer = ctx.createBuffer(2, ctx.sampleRate * seconds, ctx.sampleRate);

  // Lyserød støj (Paul Kellets metode) – blødere end hvid støj
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 280;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 1700;

  // Regnen bliver langsomt lidt kraftigere og svagere
  const swell = ctx.createOscillator();
  const swellDepth = ctx.createGain();
  swell.frequency.value = 0.06;
  swellDepth.gain.value = 450;
  swell.connect(swellDepth).connect(lowpass.frequency);

  const rainLevel = ctx.createGain();
  rainLevel.gain.value = 0.9;

  noise.connect(highpass).connect(lowpass).connect(rainLevel).connect(out);

  // En dyb, rolig rumlen under det hele
  const rumble = ctx.createBufferSource();
  rumble.buffer = buffer;
  rumble.loop = true;
  rumble.playbackRate.value = 0.5;

  const rumbleFilter = ctx.createBiquadFilter();
  rumbleFilter.type = "lowpass";
  rumbleFilter.frequency.value = 320;

  const rumbleLevel = ctx.createGain();
  rumbleLevel.gain.value = 0.5;

  rumble.connect(rumbleFilter).connect(rumbleLevel).connect(out);

  noise.start();
  rumble.start(0, 1.3);
  swell.start();

  // Enkelte dråber, der rammer ruden
  const tickBuffer = ctx.createBuffer(1, Math.round(ctx.sampleRate * 0.03), ctx.sampleRate);
  const tickData = tickBuffer.getChannelData(0);
  for (let i = 0; i < tickData.length; i++) {
    tickData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / tickData.length, 3);
  }

  function tick() {
    if (ctx.state === "running") {
      const source = ctx.createBufferSource();
      const band = ctx.createBiquadFilter();
      const level = ctx.createGain();

      source.buffer = tickBuffer;
      source.playbackRate.value = rand(0.7, 1.3);
      band.type = "bandpass";
      band.frequency.value = rand(2200, 5200);
      band.Q.value = 6;
      level.gain.value = rand(0.15, 0.5);

      source.connect(band).connect(level).connect(out);
      source.start();
    }

    setTimeout(tick, rand(70, 320));
  }

  tick();
}

createAmbientSound({
  button: document.getElementById("soundButton"),
  hint: document.getElementById("soundHint"),
  volume: 0.09,
  fadeSeconds: 5,
  build: buildRainSound,
});

// ---------------- TÆLLEREN ----------------
const breakupDate = new Date("2025-12-17T02:17:00");

const monthsElement = document.getElementById("months");
const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");

/*
 * Hvert ciffer ruller blødt: det gamle glider ned og toner ud,
 * det nye glider ned ovenfra og lander – som et stille ur.
 */
function setValue(element, value) {
  const text = String(value);
  const previous = element.dataset.value;

  if (previous === text) {
    return;
  }

  element.dataset.value = text;
  element.setAttribute("aria-label", text);

  const oldChars = (previous ?? text).padStart(text.length, " ").slice(-text.length);

  element.textContent = "";

  [...text].forEach((char, i) => {
    const column = document.createElement("span");
    column.className = "digit";
    column.setAttribute("aria-hidden", "true");

    const current = document.createElement("span");
    current.className = "d-cur";
    current.textContent = char;

    const changed = previous !== undefined && oldChars[i] !== char && !reducedMotion;

    if (changed) {
      const old = document.createElement("span");
      old.className = "d-out";
      old.textContent = oldChars[i];

      current.classList.add("d-in");
      column.appendChild(old);
      old.addEventListener("animationend", () => old.remove());
    }

    column.appendChild(current);
    element.appendChild(column);
  });

  if (previous !== undefined && element !== secondsElement) {
    const box = element.closest(".time-box");
    box?.classList.remove("changed");
    void box?.offsetWidth;
    box?.classList.add("changed");
  }
}

function updateCounter() {
  const now = new Date();

  if (now < breakupDate) {
    return;
  }

  let years = now.getFullYear() - breakupDate.getFullYear();
  let months = now.getMonth() - breakupDate.getMonth();
  let days = now.getDate() - breakupDate.getDate();
  let hours = now.getHours() - breakupDate.getHours();
  let minutes = now.getMinutes() - breakupDate.getMinutes();
  let seconds = now.getSeconds() - breakupDate.getSeconds();

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
    const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    days += previousMonth.getDate();
    months--;
  }

  if (months < 0) {
    months += 12;
    years--;
  }

  const totalMonths = years * 12 + months;

  setValue(monthsElement, totalMonths);
  setValue(daysElement, days);
  setValue(hoursElement, String(hours).padStart(2, "0"));
  setValue(minutesElement, String(minutes).padStart(2, "0"));
  setValue(secondsElement, String(seconds).padStart(2, "0"));
}

updateCounter();

setInterval(updateCounter, 1000);
