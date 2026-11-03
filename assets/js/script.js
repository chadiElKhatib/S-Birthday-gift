// MUSIC
const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
const musicToggle = document.getElementById("musicToggle");
const slideSubText = document.getElementById("slideSubText");

const MUSIC_VOLUME = 0.18;
const MUSIC_DUCKED = 0.045; // under videoer med lyd
const MUSIC_DUCKED_MUTED = 0.11; // under videoer uden lyd
const MUSIC_FADE_SECONDS = 2.8;

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const isSmallScreen = window.innerWidth <= 480;

/*
 * På iPhone kan audio.volume ikke ændres, så fade og "duck" virker ikke.
 * Web Audio (GainNode) virker overalt – ellers falder vi tilbage til volume.
 */
let audioContext = null;
let musicGain = null;
let volumeFade = null;

function setupMusicGain() {
  // Åbnet direkte fra disken (file://) ville Web Audio give stilhed.
  if (
    musicGain ||
    location.protocol === "file:" ||
    !(window.AudioContext || window.webkitAudioContext)
  ) {
    return;
  }

  try {
    const Context = window.AudioContext || window.webkitAudioContext;
    audioContext = new Context();

    musicGain = audioContext.createGain();
    musicGain.gain.value = 0;

    audioContext.createMediaElementSource(music).connect(musicGain);
    musicGain.connect(audioContext.destination);
  } catch {
    audioContext = null;
    musicGain = null;
  }
}

// Glider blødt fra den nuværende lydstyrke til target.
function rampMusic(target, seconds) {
  if (musicGain) {
    const now = audioContext.currentTime;
    const gain = musicGain.gain;

    music.volume = 1;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(Math.max(gain.value, 0.0001), now);
    gain.linearRampToValueAtTime(target, now + seconds);
    return;
  }

  clearInterval(volumeFade);

  const start = music.volume;
  const steps = Math.max(1, Math.round((seconds * 1000) / 50));
  let step = 0;

  volumeFade = setInterval(() => {
    step++;
    music.volume = start + ((target - start) * step) / steps;

    if (step >= steps) {
      clearInterval(volumeFade);
    }
  }, 50);
}

async function playMusic() {
  setupMusicGain();

  try {
    // play() kaldes straks, så trykket stadig tæller som brugerhandling.
    const playing = music.play();
    audioContext?.resume();
    await playing;

    if (!musicGain) music.volume = 0.01;
    rampMusic(currentMusicLevel(), MUSIC_FADE_SECONDS);
    updateMusicToggle();
    return true;
  } catch {
    updateMusicToggle();
    return false;
  }
}

function pauseMusic() {
  music.pause();
  updateMusicToggle();
}

function updateMusicToggle() {
  if (!musicToggle) return;

  const playing = !music.paused;

  musicToggle.textContent = playing ? "🔊" : "🔇";
  musicToggle.setAttribute(
    "aria-label",
    playing ? "Slå musik fra" : "Slå musik til",
  );
  musicToggle.classList.toggle("is-muted", !playing);
}

// iOS sætter lyd-konteksten på pause, når appen skjules.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && !music.paused) {
    audioContext?.resume();
  }
});

if (musicToggle) {
  musicToggle.addEventListener("click", (event) => {
    event.stopPropagation();

    if (music.paused) {
      playMusic();
    } else {
      pauseMusic();
    }
  });
}

// TITEL
const title = "Tillykke med fødselsdagen";
const birthdayTitle = document.getElementById("birthdayTitle");

const middle = (title.length - 1) / 2;
const scatter = isSmallScreen ? 0.45 : 1;

title.split("").forEach((letter, index) => {
  const span = document.createElement("span");
  span.innerHTML = letter === " " ? "&nbsp;" : letter;
  span.setAttribute("aria-hidden", "true");

  const distance = index - middle;
  const curve = Math.pow(distance, 2) * (isSmallScreen ? 0.22 : 0.35);

  const randomX = (Math.random() - 0.5) * 900 * scatter;
  const randomY = (Math.random() - 0.5) * 500 * scatter;
  const randomRotate = (Math.random() - 0.5) * 180;

  span.style.setProperty(
    "--start-transform",
    `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg) scale(0.3)`,
  );

  span.style.setProperty(
    "--final-transform",
    `translateY(${curve}px) rotate(${distance * 1.8}deg)`,
  );

  span.style.animationDelay = `${1.35 + index * 0.032}s`;
  birthdayTitle.appendChild(span);
});

// SLIDES
const slides = [
  /* ---------- billede 1,2,3 sammen ---------- */

  {
    type: "image",
    src: "assets/images/billede-1.jpg",
    quote: "Nogle minder føles små i øjeblikket, men bliver store senere.",
    className: "slide-0",
  },

  {
    type: "image",
    src: "assets/images/billede-2.jpg",
    quote: "Jeg vidste ikke dengang, hvor meget du ville ændre mig.",
    className: "slide-1",
  },

  {
    type: "image",
    src: "assets/images/billede-3.jpg",
    quote:
      "Nogle mennesker kommer stille ind i ens liv, men efterlader spor for altid.",
    className: "slide-2",
  },

  /* ---------- billede 4,5,6,7 + video 4,5 sammen ---------- */

  {
    type: "image",
    src: "assets/images/billede-4.jpg",
    quote: "Du lærte mig, at ro også kan føles som kærlighed.",
    className: "slide-3",
  },

  {
    type: "image",
    src: "assets/images/billede-5.jpg",
    quote:
      "Jeg tror ikke du selv ved, hvor meget du hjalp mig tættere på min deen.",
    className: "slide-4",
  },

  {
    type: "image",
    src: "assets/images/billede-6.jpg",
    quote:
      "Der var en version af mig, som kun eksisterede fordi du var en del af mit liv.",
    className: "slide-5",
  },

  {
    type: "image",
    src: "assets/images/billede-7.jpg",
    quote:
      "Du fik mig til at tænke mere over livet og hvem jeg gerne ville være.",
    className: "slide-6",
  },

  {
    type: "video",
    src: "assets/videos/video-4.mp4",
    quote: "Selv de mest normale øjeblikke med dig blev til minder.",
    className: "slide-7",
  },

  {
    type: "video",
    src: "assets/videos/video-5.mp4",
    quote:
      "Nogle mennesker ændrer ens liv stille, uden selv at lægge mærke til det.",
    className: "slide-8",
  },

  /* ---------- billede 9 + video 1,2 sammen ---------- */

  {
    type: "image",
    src: "assets/images/billede-9.jpg",
    quote: "Det var små øjeblikke som det her, der betød mest for mig.",
    className: "slide-9",
  },

  {
    type: "video",
    src: "assets/videos/video-1.mp4",
    quote: "Der var en ro i dig, som fik verden til at føles mindre tung.",
    className: "slide-10",
  },

  {
    type: "video",
    src: "assets/videos/video-2.mp4",
    quote: "Jeg tror aldrig helt jeg glemmer den ro du gav mig.",
    className: "slide-11",
  },

  /* ---------- billede 10,11,12,13,14 sammen ---------- */

  {
    type: "image",
    src: "assets/images/billede-10.jpg",
    quote:
      "Sabr er ikke at være stille mens man har ondt. Sabr er at stole på Allah mens man har ondt.",
    className: "slide-12",
  },

  {
    type: "image",
    src: "assets/images/billede-11.jpg",
    quote: "Selv når ting gør ondt, betyder det ikke at de var en fejl.",
    className: "slide-13",
  },

  {
    type: "image",
    src: "assets/images/billede-12.jpg",
    quote: "Du gjorde mig til et bedre menneske på flere måder, end du tror.",
    className: "slide-14",
  },

  {
    type: "image",
    src: "assets/images/billede-13.jpg",
    quote:
      "Nogle mennesker kommer ind i ens liv og ændrer det uden at vide det.",
    className: "slide-15",
  },

  {
    type: "image",
    src: "assets/images/billede-14.jpg",
    quote:
      "Måske fjernede Allah os fra hinandens liv, fordi Han vidste noget vi ikke selv kunne se.",
    className: "slide-16",
  },

  /* ---------- billede 15,16,17,8 sammen ---------- */

  {
    type: "image",
    src: "assets/images/billede-15.jpg",
    quote: "Må Allah beskytte dit hjerte, hvor end livet fører dig hen.",
    className: "slide-17",
  },

  {
    type: "image",
    src: "assets/images/billede-16.jpg",
    quote:
      "Selvom tingene ændrede sig, vil jeg altid være taknemlig for det gode.",
    className: "slide-18",
  },

  {
    type: "image",
    src: "assets/images/billede-17.jpg",
    quote:
      "Ikke alle historier er lavet til at vare evigt. Nogle er lavet til at ændre os.",
    className: "slide-19",
  },

  {
    type: "image",
    src: "assets/images/billede-8.jpg",
    quote: "Jeg vil altid være taknemlig for, at jeg lærte dig at kende.",
    className: "slide-20",
  },

  /* ---------- billede 18 alene ---------- */

  {
    type: "image",
    src: "assets/images/billede-18.jpg",
    quote: "Allah ved hvad hjertet bærer på, selv når man ikke siger det højt.",
    className: "slide-21",
  },

  /* ---------- billede 19,20,21 sammen ---------- */

  {
    type: "image",
    src: "assets/images/billede-19.jpg",
    quote: "Nogle gange er det de mindste øjeblikke man savner mest.",
    className: "slide-22",
  },

  {
    type: "image",
    src: "assets/images/billede-20.jpg",
    quote: "Jeg håber oprigtigt, at livet giver dig den ro du fortjener.",
    className: "slide-23",
  },

  {
    type: "image",
    src: "assets/images/billede-21.jpg",
    quote: "De mest normale øjeblikke blev nogle af de mest værdifulde.",
    className: "slide-24",
  },

  /* ---------- billede 22 alene ---------- */

  {
    type: "image",
    src: "assets/images/billede-22.jpg",
    quote: "Nogle mennesker forlader ens liv, men aldrig ens hjerte.",
    className: "slide-25",
  },

  /* ---------- video 3 alene ---------- */

  {
    type: "video",
    src: "assets/videos/video-3.mp4",
    quote: "",
    className: "slide-26",
  },

  /* ---------- video 6 alene ---------- */

  {
    type: "video",
    src: "assets/videos/video-6.mp4",
    quote: "Må Allah give dig det bedste i både dunya og akhira.",
    className: "slide-27",
  },
];

/*
 * KAPITLER
 * Slideshowet følger teksternes bue: minder → ro → det der gjorde ondt
 * → taknemmelighed og dua. Grupperne fra slides-listen bevares.
 */
const CHAPTERS = [
  {
    start: 0,
    end: 8,
    number: "Kapitel I",
    title: "Hvor det begyndte",
    theme: "gold",
    transitions: ["shards", "zoom", "develop", "mosaic", "strips", "focus", "drift", "iris", "film"],
  },
  {
    start: 9,
    end: 11,
    number: "Kapitel II",
    title: "Den ro du gav mig",
    theme: "violet",
    transitions: ["polaroid", "sweep", "mist"],
  },
  {
    start: 12,
    end: 16,
    number: "Kapitel III",
    title: "Sabr",
    theme: "dusk",
    transitions: ["ink", "fade", "drip", "pageturn", "reflection"],
  },
  {
    start: 17,
    end: 27,
    number: "Kapitel IV",
    title: "Det jeg beder om for dig",
    theme: "dawn",
    transitions: [
      "dots",
      "dawnwipe",
      "sparkle",
      "bloom",
      "brush",
      "split",
      "rise",
      "blinds",
      "pixel",
      "curtain",
      "horizon",
    ],
  },
];

function chapterOf(index) {
  return CHAPTERS.find((c) => index >= c.start && index <= c.end);
}

const IMAGE_DURATION = 8000;
const CHAPTER_CARD_DURATION = reducedMotion ? 2600 : 3800;

// Hvor længe det gamle slide er om at tone ud
const LEAVE_DURATION = 700;

// Hvis en video aldrig kommer i gang (fx strømbesparelse på iPhone)
const VIDEO_START_TIMEOUT = 12000;

const hero = document.querySelector(".hero");
const candleStage = document.getElementById("candleStage");
const candleButton = document.getElementById("candleButton");
const countdown = document.getElementById("countdown");
const slideshowSection = document.querySelector(".slideshow-section");
const slideshow = document.getElementById("slideshow");
const mediaFrame = document.getElementById("mediaFrame");
const endingSection = document.querySelector(".ending-section");
const slideImage = document.getElementById("slideImage");
const slideVideo = document.getElementById("slideVideo");
const slideQuote = document.getElementById("slideQuote");
const quoteBox = document.querySelector(".quote-box");
const blurBackground = document.getElementById("blurBackground");
const progressFill = document.getElementById("progressFill");
const progressMarkers = document.getElementById("progressMarkers");
const chapterCard = document.getElementById("chapterCard");
const chapterNumber = document.getElementById("chapterNumber");
const chapterTitle = document.getElementById("chapterTitle");
const pauseIcon = document.getElementById("pauseIcon");
const videoSoundBtn = document.getElementById("videoSoundBtn");

/*
 * phase: "hero" | "candle" | "chapter" | "slide" | "ending"
 * Hvert slide får et token, så gamle timere og video-events
 * fra et tidligere slide ikke kan springe det nye over.
 */
const state = {
  phase: "hero",
  index: 0,
  paused: false,
  token: 0,
  imageRemaining: IMAGE_DURATION,
  imageStartedAt: 0,
  imageTiming: false,
  videoSound: false,
  plan: [],
};

let imageTimer;
let videoWatchdog;
let sceneTimer;

function clearSlideTimers() {
  clearTimeout(imageTimer);
  clearTimeout(videoWatchdog);
  clearTimeout(sceneTimer);
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------- MUSIK UNDER VIDEOER ----------------
function isVideoPlaying() {
  return (
    state.phase === "slide" &&
    slides[state.index]?.type === "video" &&
    !slideVideo.paused
  );
}

function currentMusicLevel() {
  if (!isVideoPlaying()) return MUSIC_VOLUME;

  return slideVideo.muted ? MUSIC_DUCKED_MUTED : MUSIC_DUCKED;
}

function syncMusicLevel(seconds = 1.4) {
  if (!music.paused) {
    rampMusic(currentMusicLevel(), seconds);
  }
}

/*
 * iPhone tillader kun lyd i en video, hvis afspilningen er startet
 * af et tryk. Vi "låser" video-elementet op i trykket på stearinlyset
 * med et lille stykke stilhed, så de rigtige videoer senere må have lyd.
 */
const SILENCE =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

function unlockVideoSound() {
  try {
    slideVideo.muted = false;
    slideVideo.src = SILENCE;

    const attempt = slideVideo.play();

    state.videoSound = true;

    attempt
      ?.then(() => slideVideo.pause())
      .catch(() => {
        // Fejlen kommer ofte bare af, at "stilheden" ikke kan afspilles.
      });
  } catch {
    state.videoSound = false;
  }
}

function showVideoSoundButton(show) {
  videoSoundBtn?.classList.toggle("is-visible", show);
}

if (videoSoundBtn) {
  videoSoundBtn.addEventListener("click", (event) => {
    event.stopPropagation();

    // Trykket her er en brugerhandling, så nu må videoen gerne få lyd.
    slideVideo.muted = false;
    state.videoSound = true;

    slideVideo
      .play()
      .then(() => {
        showVideoSoundButton(false);
        syncMusicLevel();
      })
      .catch(() => {
        slideVideo.muted = true;
      });
  });
}

// ---------------- STATUSLINJE ----------------
function buildProgressMarkers() {
  if (!progressMarkers) return;

  CHAPTERS.slice(1).forEach((chapter) => {
    const marker = document.createElement("span");
    marker.style.left = (chapter.start / slides.length) * 100 + "%";
    progressMarkers.appendChild(marker);
  });
}

buildProgressMarkers();

function slideFraction() {
  const slide = slides[state.index];

  if (state.phase !== "slide" || !slide) return 0;

  if (slide.type === "video") {
    return slideVideo.duration
      ? Math.min(1, slideVideo.currentTime / slideVideo.duration)
      : 0;
  }

  if (!state.imageTiming) return 0;

  const elapsed = state.paused
    ? IMAGE_DURATION - state.imageRemaining
    : IMAGE_DURATION -
      state.imageRemaining +
      (performance.now() - state.imageStartedAt);

  return Math.min(1, Math.max(0, elapsed / IMAGE_DURATION));
}

function updateProgress() {
  if (progressFill) {
    const progress = (state.index + slideFraction()) / slides.length;
    progressFill.style.transform = `scaleX(${progress.toFixed(4)})`;
  }

  if (state.phase !== "ending") {
    requestAnimationFrame(updateProgress);
  }
}

// ---------------- CITATER ORD FOR ORD ----------------
function renderQuote(text) {
  slideQuote.textContent = "";
  slideQuote.setAttribute("aria-label", text);

  if (!text) return;

  text.split(" ").forEach((word, i, words) => {
    const span = document.createElement("span");

    span.className = "word";
    span.textContent = word;
    span.setAttribute("aria-hidden", "true");
    span.style.setProperty("--i", i);

    slideQuote.appendChild(span);

    if (i < words.length - 1) {
      slideQuote.appendChild(document.createTextNode(" "));
    }
  });
}

// ---------------- STEARINLYS ----------------
function startCandle() {
  state.phase = "candle";

  hero.classList.add("is-leaving");
  document.body.classList.add("is-candle");

  setTimeout(
    () => {
      hero.style.display = "none";
      candleStage.classList.add("show");
      runCountdown();
    },
    reducedMotion ? 0 : 1100,
  );
}

async function runCountdown() {
  await wait(reducedMotion ? 300 : 1400);

  for (const number of ["3", "2", "1"]) {
    countdown.textContent = number;
    countdown.classList.remove("tick");
    void countdown.offsetWidth;
    countdown.classList.add("tick");

    await wait(1200);
  }

  countdown.textContent = "";
  candleStage.classList.add("ready");
  candleButton.disabled = false;
  candleButton.focus({ preventScroll: true });
}

candleButton.addEventListener("click", () => {
  if (state.phase !== "candle" || candleButton.disabled) return;

  candleButton.disabled = true;

  // Begge dele SKAL ske direkte i trykket for at virke på iPhone.
  unlockVideoSound();
  playMusic();

  candleStage.classList.add("blown");

  setTimeout(
    () => {
      candleStage.classList.add("is-leaving");

      setTimeout(enterSlideshow, reducedMotion ? 0 : 1200);
    },
    reducedMotion ? 200 : 1700,
  );
});

// ---------------- KAPITEL-SKÆRM ----------------
function setTheme(chapter) {
  slideshowSection.dataset.theme = chapter.theme;
}

function showChapterCard(chapter, token) {
  state.phase = "chapter";
  setTheme(chapter);

  chapterNumber.textContent = chapter.number;
  chapterTitle.textContent = chapter.title;

  chapterCard.classList.remove("is-leaving");
  chapterCard.classList.add("show");

  // Første billede i kapitlet hentes, mens titlen står.
  preloadSlide(chapter.start);

  sceneTimer = setTimeout(() => {
    if (token === state.token) leaveChapterCard(chapter.start, token);
  }, CHAPTER_CARD_DURATION);
}

function leaveChapterCard(index, token) {
  clearTimeout(sceneTimer);

  chapterCard.classList.add("is-leaving");

  sceneTimer = setTimeout(
    () => {
      if (token !== state.token) return;

      chapterCard.classList.remove("show", "is-leaving");
      renderSlide(index, token);
    },
    reducedMotion ? 0 : 900,
  );
}

// ---------------- SLIDES ----------------
function preloadSlide(index) {
  const slide = slides[index];

  if (slide && slide.type === "image") {
    const image = new Image();
    image.src = slide.src;
  }
}

function setAmbientBackground(src) {
  if (blurBackground) {
    blurBackground.style.backgroundImage = `url("${src}")`;
  }
}

function enterSlideshow() {
  candleStage.classList.remove("show", "ready", "blown", "is-leaving");
  endingSection.style.display = "";
  endingSection.classList.remove("show");

  slideshowSection.style.display = "";
  slideshowSection.classList.add("show");
  document.body.classList.remove("is-candle");
  document.body.classList.add("is-playing");

  // Ny, tilfældig fordeling af overgangene hver gang man ser det
  planTransitions();

  goToSlide(0, { chapterCard: true });
  requestAnimationFrame(updateProgress);
}

/*
 * Går til et slide. Når man bevæger sig frem ind i et nyt kapitel,
 * vises kapitel-skærmen først.
 */
function goToSlide(index, { chapterCard = false } = {}) {
  const token = ++state.token;
  const chapter = chapterOf(index);
  const fromPhase = state.phase;

  clearSlideTimers();
  resetPause();

  state.index = index;
  state.imageRemaining = IMAGE_DURATION;
  state.imageTiming = false;

  const leaveDuration = fromPhase === "slide" && !reducedMotion ? LEAVE_DURATION : 0;

  // Det gamle slide toner ud, før det nye toner ind.
  if (fromPhase === "slide") {
    mediaFrame.classList.add("is-leaving");
    quoteBox.classList.add("is-hidden");
    slideVideo.pause();
    showVideoSoundButton(false);
    syncMusicLevel(1.6);
  }

  sceneTimer = setTimeout(() => {
    if (token !== state.token) return;

    if (chapterCard) {
      hideMedia();
      showChapterCard(chapter, token);
    } else {
      setTheme(chapter);
      renderSlide(index, token);
    }
  }, leaveDuration);
}

function hideMedia() {
  clearEffects();
  slideVideo.pause();
  slideVideo.onended = null;
  slideVideo.onerror = null;
  mediaFrame.classList.remove("is-entering", "is-leaving");
  mediaFrame.classList.add("is-hidden");
  quoteBox.classList.add("is-hidden");
}

// ---------------- OVERGANGS-EFFEKTER ----------------
/*
 * Hvert slide får sin helt egen overgang – 28 forskellige, ingen ens.
 * Nogle tegner et ekstra lag oven på billedet (stykker, lysprikker,
 * gardiner …). Laget fjernes igen bagefter, så kun billedet er tilbage.
 * Alt animeres med transform, opacity, clip-path eller mask (eller ét
 * lille canvas), så det kører glat på iPhone.
 */
let effectTimers = [];
let effectFrame = null;

function clearEffects() {
  effectTimers.forEach(clearTimeout);
  effectTimers = [];

  if (effectFrame !== null) {
    cancelAnimationFrame(effectFrame);
    effectFrame = null;
  }

  mediaFrame.querySelectorAll(".fx-layer").forEach((layer) => layer.remove());
  mediaFrame.classList.remove("fx-hold", "fx-done");
  mediaFrame.style.removeProperty("-webkit-mask-position");
  mediaFrame.style.removeProperty("mask-position");
}

function later(fn, ms) {
  effectTimers.push(setTimeout(fn, ms));
}

// Kører først, når slideshowet ikke står på pause
function laterUnpaused(fn, ms, token) {
  later(function check() {
    if (token !== state.token) return;
    if (state.paused) {
      later(check, 200);
      return;
    }
    fn();
  }, ms);
}

// Et lag, der ligger præcis oven på det synlige billede/video
function createLayer(media, className, tag = "div") {
  const layer = document.createElement(tag);
  const style = getComputedStyle(media);

  layer.className = "fx-layer " + className;
  layer.style.left = media.offsetLeft + "px";
  layer.style.top = media.offsetTop + "px";
  layer.style.width = media.offsetWidth + "px";
  layer.style.height = media.offsetHeight + "px";
  layer.style.borderRadius = style.borderRadius;

  mediaFrame.appendChild(layer);
  return layer;
}

// Videoen har først sin rigtige størrelse, når metadata er hentet.
function whenMediaReady(media) {
  if (media.tagName !== "VIDEO" || media.readyState >= 1) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const done = () => {
      media.removeEventListener("loadedmetadata", done);
      resolve();
    };

    media.addEventListener("loadedmetadata", done);
    later(done, 1500);
  });
}

const rand = (min, max) => min + Math.random() * (max - min);

function revealMedia(layer, token, fadeMs = 500) {
  if (token !== state.token) return;

  mediaFrame.classList.remove("fx-hold");
  layer.classList.add("fade-out");
  later(() => layer.remove(), fadeMs + 100);
}

/*
 * Billedet skåret i stykker, der hver især animeres (stykker, mosaik,
 * striber, persienner, to halvdele). Hvert stykke viser sin del af
 * billedet som baggrund. Kun til stillbilleder.
 */
function runTiles(media, token, { cols, rows, piece, setup, duration }) {
  const w = media.offsetWidth;
  const h = media.offsetHeight;

  if (!w || !h) {
    mediaFrame.classList.remove("fx-hold");
    return;
  }

  const tileW = w / cols;
  const tileH = h / rows;
  const layer = createLayer(media, "fx-tiles");
  const src = `url("${media.currentSrc || media.src}")`;
  let longest = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const el = document.createElement("span");

      el.className = "tile " + piece;
      el.style.left = col * tileW + "px";
      el.style.top = row * tileH + "px";
      // +1 px overlap, så der ikke ses tynde streger mellem stykkerne
      el.style.width = tileW + 1 + "px";
      el.style.height = tileH + 1 + "px";
      el.style.backgroundImage = src;
      el.style.backgroundSize = `${w}px ${h}px`;
      el.style.backgroundPosition = `${-col * tileW}px ${-row * tileH}px`;

      const delay = setup(el, col, row, cols, rows, w, h);
      el.style.animationDelay = `${delay}ms`;
      longest = Math.max(longest, delay);

      layer.appendChild(el);
    }
  }

  laterUnpaused(() => revealMedia(layer, token, 300), longest + duration, token);
}

// I · Stykker, der flyver blødt sammen
function runShards(media, token) {
  const cols = isSmallScreen ? 4 : 6;
  runTiles(media, token, {
    cols,
    rows: Math.max(3, Math.min(7, Math.round((cols * media.offsetHeight) / media.offsetWidth))),
    piece: "shard-piece",
    duration: 1500,
    setup: (el, c, r, cs, rs, w, h) => {
      el.style.setProperty("--sx", `${rand(-0.7, 0.7) * w}px`);
      el.style.setProperty("--sy", `${rand(-0.6, 0.6) * h}px`);
      el.style.setProperty("--sr", `${rand(-38, 38).toFixed(1)}deg`);
      return rand(0, 520);
    },
  });
}

// I · Små fliser, der vender én ad gangen, diagonalt hen over billedet
function runMosaic(media, token) {
  const cols = isSmallScreen ? 5 : 7;
  runTiles(media, token, {
    cols,
    rows: Math.max(4, Math.round((cols * media.offsetHeight) / media.offsetWidth)),
    piece: "mosaic-piece",
    duration: 1100,
    setup: (el, c, r) => (c + r) * 75,
  });
}

// I · Lodrette striber, der glider på plads skiftevis oppefra og nedefra
function runStrips(media, token) {
  runTiles(media, token, {
    cols: isSmallScreen ? 7 : 10,
    rows: 1,
    piece: "strip-piece",
    duration: 1400,
    setup: (el, c) => {
      el.style.setProperty("--from", c % 2 ? "-105%" : "105%");
      return c * 85;
    },
  });
}

// IV · Persienner, der vender sig åbne fra toppen og ned
function runBlinds(media, token) {
  runTiles(media, token, {
    cols: 1,
    rows: isSmallScreen ? 8 : 10,
    piece: "blind-piece",
    duration: 1100,
    setup: (el, c, r) => r * 95,
  });
}

// IV · To halvdele, der glider sammen fra hver sin side
function runSplit(media, token) {
  runTiles(media, token, {
    cols: 2,
    rows: 1,
    piece: "split-piece",
    duration: 1900,
    setup: (el, c) => {
      el.style.setProperty("--from", c === 0 ? "-55%" : "55%");
      return 0;
    },
  });
}

// II · Et blødt lys, der glider hen over billedet
function runSweep(media) {
  const layer = createLayer(media, "fx-sweep");
  const leftToRight = Math.random() < 0.5;

  layer.style.setProperty("--sweep-angle", `${rand(-24, 24).toFixed(1)}deg`);
  layer.style.setProperty("--sweep-from", leftToRight ? "-130%" : "175%");
  layer.style.setProperty("--sweep-to", leftToRight ? "175%" : "-130%");

  later(() => layer.remove(), 3200);
}

// II · Billedet kommer frem gennem en blød, drivende tåge
function runMist(media) {
  const layer = createLayer(media, "fx-mist");
  later(() => layer.remove(), 3400);
}

// III · Blæk i vand – fire pletter, der starter tilfældige steder
function runInk() {
  const positions = Array.from(
    { length: 4 },
    () => `${rand(10, 90).toFixed(0)}% ${rand(10, 90).toFixed(0)}%`,
  ).join(", ");

  mediaFrame.style.setProperty("-webkit-mask-position", positions);
  mediaFrame.style.setProperty("mask-position", positions);
}

// IV · Små stjerneglimt, der funkler, mens billedet toner frem
function runSparkle(media) {
  const layer = createLayer(media, "fx-sparkle");
  const count = isSmallScreen ? 14 : 20;

  for (let i = 0; i < count; i++) {
    const star = document.createElement("span");
    const size = rand(8, 20);

    star.className = "sparkle";
    star.style.left = rand(4, 96) + "%";
    star.style.top = rand(4, 96) + "%";
    star.style.width = size + "px";
    star.style.height = size + "px";
    star.style.animationDelay = rand(0, 1600).toFixed(0) + "ms";
    layer.appendChild(star);
  }

  later(() => layer.remove(), 3600);
}

// IV · To bløde gardiner, der glider til side
function runCurtain(media) {
  const layer = createLayer(media, "fx-curtain");

  // Billedet holdes skjult, til gardinerne hænger foran det
  mediaFrame.classList.remove("fx-hold");
  later(() => layer.remove(), 3000);
}

/*
 * IV · Billedet samles af små lysprikker i billedets egne farver.
 */
const DOT_PALETTE = [
  [253, 228, 208],
  [246, 198, 200],
  [255, 217, 160],
  [255, 240, 225],
];

function sampleColors(media, cols, rows) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = cols;
    canvas.height = rows;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(media, 0, 0, cols, rows);

    return ctx.getImageData(0, 0, cols, rows).data;
  } catch {
    // Fx hvis siden åbnes fra disken (file://); så bruges daggry-farver.
    return null;
  }
}

function createCanvasLayer(media, className) {
  const w = media.offsetWidth;
  const h = media.offsetHeight;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);

  const canvas = createLayer(media, "fx-canvas " + className, "canvas");
  canvas.width = Math.round(w * ratio);
  canvas.height = Math.round(h * ratio);

  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);

  return { canvas, ctx, w, h };
}

function runDots(media, token) {
  if (!media.offsetWidth || !media.offsetHeight) {
    mediaFrame.classList.remove("fx-hold");
    return;
  }

  const { canvas, ctx, w, h } = createCanvasLayer(media, "fx-dots");
  const step = isSmallScreen ? 9 : 11;
  const cols = Math.ceil(w / step);
  const rows = Math.ceil(h / step);

  const colors = media.tagName === "IMG" ? sampleColors(media, cols, rows) : null;
  const dots = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let rgb;

      if (colors) {
        const i = (row * cols + col) * 4;
        rgb = [colors[i], colors[i + 1], colors[i + 2]];
      } else {
        rgb = DOT_PALETTE[(row * 7 + col * 3) % DOT_PALETTE.length];
      }

      // Lysprikkerne starter spredt, mest nedefra – som morgenlys
      const angle = rand(0, Math.PI * 2);
      const distance = rand(0.25, 0.9) * Math.max(w, h);

      dots.push({
        tx: col * step + step / 2,
        ty: row * step + step / 2,
        sx: w / 2 + Math.cos(angle) * distance,
        sy: h * 0.75 + Math.sin(angle) * distance * 0.7,
        delay: rand(0, 0.55),
        rgb,
      });
    }
  }

  const DURATION = 1.7;
  const radius = step * 0.42;
  let elapsed = 0;
  let last = performance.now();

  const ease = (t) => 1 - Math.pow(1 - t, 3);

  function draw(now) {
    if (token !== state.token) return;

    // Står slideshowet på pause, står prikkerne også stille.
    if (!state.paused) elapsed += (now - last) / 1000;
    last = now;

    ctx.clearRect(0, 0, w, h);

    let done = true;

    for (const dot of dots) {
      const t = Math.min(1, Math.max(0, (elapsed - dot.delay) / DURATION));
      if (t < 1) done = false;

      const e = ease(t);
      const x = dot.sx + (dot.tx - dot.sx) * e;
      const y = dot.sy + (dot.ty - dot.sy) * e;

      // Varmt hvidt lys i starten, billedets farve når prikken lander
      const glow = 1 - e;
      const r = Math.round(dot.rgb[0] + (255 - dot.rgb[0]) * glow * 0.8);
      const g = Math.round(dot.rgb[1] + (236 - dot.rgb[1]) * glow * 0.8);
      const b = Math.round(dot.rgb[2] + (214 - dot.rgb[2]) * glow * 0.8);

      ctx.globalAlpha = Math.min(1, t * 2.2);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.arc(x, y, radius * (0.6 + 0.4 * e), 0, Math.PI * 2);
      ctx.fill();
    }

    if (done) {
      effectFrame = null;
      revealMedia(canvas, token, 900);
      return;
    }

    effectFrame = requestAnimationFrame(draw);
  }

  effectFrame = requestAnimationFrame(draw);
}

// IV · Billedet starter som store, bløde pixels og bliver skarpere
function runPixel(media, token) {
  if (!media.offsetWidth || !media.offsetHeight) {
    mediaFrame.classList.remove("fx-hold");
    return;
  }

  const { canvas, ctx, w, h } = createCanvasLayer(media, "fx-pixel");
  const small = document.createElement("canvas");
  const sctx = small.getContext("2d");
  const blocks = [42, 30, 21, 14, 9, 6, 4, 2.5];
  let step = 0;

  function drawStep() {
    if (token !== state.token) return;

    const size = blocks[step];
    small.width = Math.max(1, Math.round(w / size));
    small.height = Math.max(1, Math.round(h / size));
    sctx.drawImage(media, 0, 0, small.width, small.height);

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(small, 0, 0, w, h);

    step++;

    if (step < blocks.length) {
      laterUnpaused(drawStep, 190, token);
    } else {
      laterUnpaused(() => revealMedia(canvas, token, 700), 160, token);
    }
  }

  drawStep();
}

/*
 * Oversigt over alle overgange.
 * video: kan bruges på en video   hold: billedet skjules til effekten har samlet det
 * mask:  efter hvor mange ms masken fjernes (så billedet står helt rent)
 */
const EFFECTS = {
  // Kapitel I · Hvor det begyndte – minder, der samles
  shards: { video: false, hold: true, run: runShards },
  zoom: { video: true },
  develop: { video: true },
  mosaic: { video: false, hold: true, run: runMosaic },
  strips: { video: false, hold: true, run: runStrips },
  focus: { video: true },
  drift: { video: true },
  iris: { video: true },
  film: { video: true },
  // Kapitel II · Den ro du gav mig – stille og blødt
  polaroid: { video: true },
  sweep: { video: true, run: runSweep },
  mist: { video: true, run: runMist },
  // Kapitel III · Sabr – langsomt, tungt, men roligt
  ink: { video: true, mask: 2700, run: runInk, immediate: true },
  fade: { video: true },
  drip: { video: true, mask: 3100 },
  pageturn: { video: true },
  reflection: { video: true, mask: 2900 },
  // Kapitel IV · Det jeg beder om for dig – lys og håb
  dots: { video: true, hold: true, run: runDots },
  dawnwipe: { video: true, mask: 2700 },
  sparkle: { video: true, run: runSparkle },
  bloom: { video: true },
  brush: { video: true, mask: 3100 },
  split: { video: false, hold: true, run: runSplit },
  rise: { video: true },
  blinds: { video: false, hold: true, run: runBlinds },
  pixel: { video: false, hold: true, run: runPixel },
  curtain: { video: true, hold: true, run: runCurtain },
  horizon: { video: true },
};

const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/*
 * Fordeler kapitlets overgange tilfældigt på dets slides – hver bruges
 * præcis én gang. Videoer får først en af dem, der virker på video.
 */
function planTransitions() {
  const plan = [];

  CHAPTERS.forEach((chapter) => {
    const indices = [];
    for (let i = chapter.start; i <= chapter.end; i++) indices.push(i);

    const videos = indices.filter((i) => slides[i].type === "video");
    const images = indices.filter((i) => slides[i].type !== "video");

    const forVideo = shuffle(chapter.transitions.filter((t) => EFFECTS[t].video));
    const used = new Set();

    videos.forEach((i) => {
      const t = forVideo.find((name) => !used.has(name)) || "fade";
      used.add(t);
      plan[i] = t;
    });

    const rest = shuffle(chapter.transitions.filter((t) => !used.has(t)));
    images.forEach((i, n) => {
      plan[i] = rest[n] || "fade";
    });
  });

  state.plan = plan;
}

async function playEnterAnimation(media, token) {
  const transition = slideshow.dataset.transition;
  const effect = EFFECTS[transition] || {};

  mediaFrame.classList.remove("is-leaving", "is-hidden", "is-entering");

  if (effect.hold) mediaFrame.classList.add("fx-hold");

  // Overgange med maske starter forskelligt hver gang
  if (effect.immediate) effect.run(media, token);

  void mediaFrame.offsetWidth;
  mediaFrame.classList.add("is-entering");

  // Polaroiden lander med en lille, tilfældig hældning
  mediaFrame.style.setProperty("--tilt", `${(Math.random() * 4 - 2).toFixed(2)}deg`);

  if (effect.mask) {
    laterUnpaused(() => mediaFrame.classList.add("fx-done"), effect.mask, token);
  }

  if (effect.run && !effect.immediate) {
    await whenMediaReady(media);

    if (token !== state.token) return;
    effect.run(media, token);
  }
}


async function renderSlide(index, token) {
  const slide = slides[index];

  state.phase = "slide";

  slideshowSection.className = "slideshow-section show " + slide.className;

  clearEffects();
  slideshow.dataset.transition = reducedMotion ? "fade" : state.plan[index] || "fade";

  renderQuote(slide.quote || "");
  slideSubText.innerText = slide.subText || "";

  if (slide.type === "image") {
    slideVideo.pause();
    slideVideo.onended = null;
    slideVideo.onerror = null;
    slideVideo.style.display = "none";
    showVideoSoundButton(false);

    slideImage.src = slide.src;

    try {
      await slideImage.decode();
    } catch {
      // Billedet vises alligevel; decode() er kun for at undgå blink.
    }

    if (token !== state.token) return;

    slideImage.style.display = "block";
    setAmbientBackground(slide.src);
    playEnterAnimation(slideImage, token);
    syncMusicLevel(1.6);

    startImageTimer(token);
  }

  if (slide.type === "video") {
    slideImage.style.display = "none";

    slideVideo.pause();
    slideVideo.poster = stillFor(slide);
    slideVideo.src = slide.src;
    slideVideo.currentTime = 0;
    slideVideo.playsInline = true;
    slideVideo.style.display = "block";

    playEnterAnimation(slideVideo, token);

    slideVideo.onended = () => {
      if (token === state.token) nextSlide();
    };

    slideVideo.onerror = () => {
      if (token === state.token) {
        clearTimeout(videoWatchdog);
        videoWatchdog = setTimeout(nextSlide, 1200);
      }
    };

    slideVideo.onplaying = () => {
      clearTimeout(videoWatchdog);
      syncMusicLevel(1.2);
    };

    slideVideo.onpause = () => {
      if (token === state.token) syncMusicLevel(1.2);
    };

    /*
     * Kan videoen ikke starte af sig selv, kan man trykke på skærmen.
     * Sker der intet, går vi videre.
     */
    videoWatchdog = setTimeout(() => {
      if (token === state.token && slideVideo.paused && !state.paused) {
        nextSlide();
      }
    }, VIDEO_START_TIMEOUT);

    playVideo();
  }

  requestAnimationFrame(() => {
    if (token === state.token) quoteBox.classList.remove("is-hidden");
  });

  preloadSlide(index + 1);
}

// Prøver med lyd først; afvises det, spiller videoen uden lyd.
function playVideo() {
  slideVideo.muted = !state.videoSound;
  showVideoSoundButton(slideVideo.muted);

  slideVideo.play().catch(() => {
    if (slideVideo.muted) return;

    slideVideo.muted = true;
    showVideoSoundButton(true);
    slideVideo.play().catch(() => {});
  });
}

function startImageTimer(token) {
  state.imageStartedAt = performance.now();
  state.imageTiming = true;

  clearTimeout(imageTimer);
  imageTimer = setTimeout(() => {
    if (token === state.token) nextSlide();
  }, state.imageRemaining);
}

function nextSlide() {
  // Under kapitel-skærmen betyder "frem" bare: spring titlen over.
  if (state.phase === "chapter") {
    leaveChapterCard(chapterOf(state.index).start, state.token);
    return;
  }

  if (state.index >= slides.length - 1) {
    showEnding();
    return;
  }

  const next = state.index + 1;
  goToSlide(next, { chapterCard: chapterOf(next).start === next });
}

function previousSlide() {
  if (state.index > 0) {
    goToSlide(state.index - 1);
  } else {
    goToSlide(0);
  }
}

// ---------------- PAUSE ----------------
function flashPauseIcon(symbol, stay) {
  pauseIcon.textContent = symbol;
  pauseIcon.classList.remove("flash", "stay");
  void pauseIcon.offsetWidth;
  pauseIcon.classList.add(stay ? "stay" : "flash");
}

// Nulstiller pause uden at røre videoen (bruges ved slideskift).
function resetPause() {
  state.paused = false;
  slideshow.classList.remove("is-paused");
  pauseIcon.classList.remove("flash", "stay");
}

function setPaused(paused) {
  if (state.paused === paused) return;

  state.paused = paused;
  slideshow.classList.toggle("is-paused", paused);

  const slide = slides[state.index];

  if (state.phase === "slide" && slide) {
    if (slide.type === "image") {
      if (paused) {
        state.imageRemaining = Math.max(
          0,
          state.imageRemaining - (performance.now() - state.imageStartedAt),
        );
        clearTimeout(imageTimer);
      } else {
        startImageTimer(state.token);
      }
    } else if (paused) {
      slideVideo.pause();
    } else {
      playVideo();
    }
  }

  flashPauseIcon(paused ? "❚❚" : "▶", paused);
}

function togglePause() {
  if (state.phase === "chapter") {
    leaveChapterCard(chapterOf(state.index).start, state.token);
    return;
  }

  if (state.phase === "slide") {
    setPaused(!state.paused);
  }
}

// Skjules siden (anden app, låst telefon), pauses slideshowet.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && state.phase === "slide") {
    setPaused(true);
  }
});

// ---------------- STYRING: TRYK, SWIPE, TASTER ----------------
let pointerStart = null;

slideshowSection.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) return;

  pointerStart = { x: event.clientX, y: event.clientY, time: Date.now() };
});

slideshowSection.addEventListener("pointerup", (event) => {
  if (!pointerStart || event.target.closest("button")) {
    pointerStart = null;
    return;
  }

  const dx = event.clientX - pointerStart.x;
  const dy = event.clientY - pointerStart.y;
  const duration = Date.now() - pointerStart.time;

  pointerStart = null;

  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) {
    if (dx < 0) nextSlide();
    else previousSlide();
    return;
  }

  if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && duration < 600) {
    togglePause();
  }
});

slideshowSection.addEventListener("pointercancel", () => {
  pointerStart = null;
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.hidden) return;
  if (state.phase !== "slide" && state.phase !== "chapter") return;

  if (event.key === "ArrowRight") {
    event.preventDefault();
    nextSlide();
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    previousSlide();
  } else if (event.key === " " || event.key === "Spacebar") {
    event.preventDefault();
    togglePause();
  }
});

// ---------------- AFSLUTNING ----------------
function showEnding() {
  state.token++;
  clearSlideTimers();
  resetPause();

  state.phase = "ending";
  state.index = slides.length;

  slideVideo.pause();
  showVideoSoundButton(false);
  syncMusicLevel(2);

  if (progressFill) progressFill.style.transform = "scaleX(1)";

  mediaFrame.classList.add("is-leaving");
  quoteBox.classList.add("is-hidden");

  sceneTimer = setTimeout(
    () => {
      clearEffects();
      slideshowSection.style.display = "none";
      endingSection.style.display = "flex";
      endingSection.scrollTop = 0;

      startSunrise();
      resetGallery();
      requestAnimationFrame(() => endingSection.classList.add("show"));
    },
    reducedMotion ? 0 : 900,
  );
}

// ---------------- GALLERI ----------------
const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxVideo = document.getElementById("lightboxVideo");
const lightboxQuote = document.getElementById("lightboxQuote");

// Både billeder og videoer, i samme rækkefølge som slideshowet
const galleryItems = slides;
let lightboxIndex = 0;
let lastFocused = null;

// Et stillbillede fra hver video (assets/images/video-N-still.jpg)
function stillFor(slide) {
  if (slide.type !== "video") return slide.src;

  return slide.src
    .replace("assets/videos/", "assets/images/")
    .replace(".mp4", "-still.jpg");
}

function buildGallery() {
  galleryItems.forEach((slide, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-item";
    if (slide.type === "video") button.classList.add("is-video");
    button.setAttribute(
      "aria-label",
      `${slide.type === "video" ? "Video" : "Billede"} ${i + 1} af ${galleryItems.length}`,
    );

    // Hvert billede svæver i sit eget, rolige tempo
    const float = document.createElement("span");
    float.className = "gallery-float";
    float.style.animationDuration = `${(5 + Math.random() * 4).toFixed(1)}s`;
    float.style.animationDelay = `${(-Math.random() * 8).toFixed(1)}s`;
    float.style.setProperty("--float-tilt", `${(Math.random() * 1.6 - 0.8).toFixed(2)}deg`);

    const image = document.createElement("img");
    image.src = stillFor(slide);
    image.alt = "Memory";
    image.loading = "lazy";
    image.decoding = "async";

    const glare = document.createElement("span");
    glare.className = "gallery-glare";

    float.append(image, glare);

    if (slide.type === "video") {
      const play = document.createElement("span");
      play.className = "play-badge";
      play.setAttribute("aria-hidden", "true");
      play.textContent = "▶";
      float.appendChild(play);
    }

    button.appendChild(float);
    button.addEventListener("click", () => openLightbox(i));
    addTouchResponse(button);

    gallery.appendChild(button);
  });
}

/*
 * Billederne reagerer blødt, når man rører dem: de vipper en anelse
 * mod fingeren/musen, og et lille lysskær følger med.
 */
function addTouchResponse(item) {
  const setFrom = (event) => {
    const rect = item.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    item.style.setProperty("--ry", `${((x - 0.5) * 10).toFixed(2)}deg`);
    item.style.setProperty("--rx", `${((0.5 - y) * 10).toFixed(2)}deg`);
    item.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
    item.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
  };

  const release = () => {
    item.classList.remove("is-touched", "is-pressed");
    item.style.setProperty("--rx", "0deg");
    item.style.setProperty("--ry", "0deg");
  };

  item.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") item.classList.add("is-touched");
  });

  item.addEventListener("pointermove", (event) => {
    if (event.pointerType === "mouse" || item.classList.contains("is-pressed")) {
      setFrom(event);
    }
  });

  item.addEventListener("pointerdown", (event) => {
    setFrom(event);
    item.classList.add("is-touched", "is-pressed");
  });

  item.addEventListener("pointerup", (event) => {
    item.classList.remove("is-pressed");
    if (event.pointerType !== "mouse") setTimeout(release, 350);
  });

  item.addEventListener("pointerleave", release);
  item.addEventListener("pointercancel", release);
}

buildGallery();

/*
 * Billederne starter som en lille bunke polaroids i midten
 * og glider ud på deres pladser, ét ad gangen.
 */
function resetGallery() {
  gallery.classList.remove("assembled");

  galleryObserver.observe(gallery);
}

function assembleGallery() {
  const box = gallery.getBoundingClientRect();
  const centerX = box.left + box.width / 2;
  const centerY = box.top + box.height / 2;

  gallery.querySelectorAll(".gallery-item").forEach((item, i) => {
    item.style.transition = "none";

    const rect = item.getBoundingClientRect();
    const x = centerX - (rect.left + rect.width / 2);
    const y = centerY - (rect.top + rect.height / 2);
    const rotate = (Math.random() * 16 - 8).toFixed(1);

    item.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(0.7)`;
    item.style.opacity = "0";
    item.style.setProperty("--delay", `${i * 60}ms`);
  });

  void gallery.offsetWidth;

  gallery.querySelectorAll(".gallery-item").forEach((item) => {
    item.style.transition = "";
    item.style.transform = "";
    item.style.opacity = "";
  });

  gallery.classList.add("assembled");
}

const galleryObserver = new IntersectionObserver(
  (entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      galleryObserver.unobserve(gallery);
      assembleGallery();
    }
  },
  { threshold: 0.15 },
);

// Musikken skruer blidt ned, mens en video spiller i lightboxen
lightboxVideo.addEventListener("playing", () => {
  if (!music.paused) rampMusic(MUSIC_DUCKED, 1.2);
});

["pause", "ended", "emptied"].forEach((type) =>
  lightboxVideo.addEventListener(type, () => {
    if (!music.paused) rampMusic(MUSIC_VOLUME, 1.6);
  }),
);

function stopLightboxVideo() {
  lightboxVideo.pause();
  lightboxVideo.removeAttribute("src");
  lightboxVideo.load();
}

function showLightboxItem(index) {
  lightboxIndex = (index + galleryItems.length) % galleryItems.length;

  const slide = galleryItems[lightboxIndex];
  const media = slide.type === "video" ? lightboxVideo : lightboxImage;

  stopLightboxVideo();

  lightboxImage.hidden = slide.type === "video";
  lightboxVideo.hidden = slide.type !== "video";

  media.classList.remove("swap");
  void media.offsetWidth;

  if (slide.type === "video") {
    lightboxVideo.poster = stillFor(slide);
    lightboxVideo.src = slide.src;

    // Afspilles kun, fordi man selv har trykket – med lyd
    lightboxVideo.muted = false;
    lightboxVideo.play().catch(() => {});
  } else {
    lightboxImage.src = slide.src;
  }

  lightboxQuote.textContent = slide.quote || "";
  media.classList.add("swap");
}

function openLightbox(index) {
  lastFocused = document.activeElement;

  showLightboxItem(index);
  lightbox.hidden = false;

  requestAnimationFrame(() => lightbox.classList.add("show"));
  lightbox.querySelector(".lightbox-close").focus({ preventScroll: true });
}

function closeLightbox() {
  lightbox.classList.remove("show");
  stopLightboxVideo();

  setTimeout(
    () => {
      lightbox.hidden = true;
      lastFocused?.focus({ preventScroll: true });
    },
    reducedMotion ? 0 : 350,
  );
}

lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
lightbox
  .querySelector(".lightbox-prev")
  .addEventListener("click", () => showLightboxItem(lightboxIndex - 1));
lightbox
  .querySelector(".lightbox-next")
  .addEventListener("click", () => showLightboxItem(lightboxIndex + 1));

// Tryk udenfor billedet lukker
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

let lightboxSwipe = null;

lightbox.addEventListener("pointerdown", (event) => {
  lightboxSwipe = { x: event.clientX, y: event.clientY };
});

lightbox.addEventListener("pointerup", (event) => {
  if (!lightboxSwipe) return;

  const dx = event.clientX - lightboxSwipe.x;
  const dy = event.clientY - lightboxSwipe.y;

  lightboxSwipe = null;

  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
    showLightboxItem(lightboxIndex + (dx < 0 ? 1 : -1));
  }
});

document.addEventListener("keydown", (event) => {
  if (lightbox.hidden) return;

  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowRight") showLightboxItem(lightboxIndex + 1);
  if (event.key === "ArrowLeft") showLightboxItem(lightboxIndex - 1);
});

// ---------------- FORSIDE: INTRO-TEKSTEN ORD FOR ORD ----------------
/*
 * Teksten deles op i ord (selve teksten ændres ikke). Ordene svæver
 * på plads linje for linje, ligesom titlen, og "tillykke med de 27"
 * og "Allah ysa3dik el 3omr kelo" får en lille glød til sidst.
 */
const INTRO_START = 3.8; // sekunder – når titlen er landet
const INTRO_LINE_GAP = 0.42;
const INTRO_GLOW_WORDS = [
  ["tillykke", "med", "de", "27."],
  ["Allah", "ysa3dik", "el", "3omr", "kelo"],
];

function revealIntroText() {
  const introContent = document.querySelector(".intro-content");
  const introText = document.querySelector(".intro-text");

  if (!introContent || !introText || reducedMotion) return;

  const words = introText.textContent.trim().split(/\s+/);

  introText.setAttribute("aria-label", words.join(" "));
  introText.textContent = "";

  const spans = words.map((word, i) => {
    const span = document.createElement("span");

    span.className = "iw";
    span.textContent = word;
    span.setAttribute("aria-hidden", "true");
    span.style.setProperty("--dx", `${rand(-10, 10).toFixed(1)}px`);
    span.style.setProperty("--dr", `${rand(-5, 5).toFixed(1)}deg`);

    introText.appendChild(span);
    if (i < words.length - 1) introText.appendChild(document.createTextNode(" "));

    return span;
  });

  // Find de to sætninger, der skal gløde
  INTRO_GLOW_WORDS.forEach((phrase) => {
    for (let i = 0; i <= words.length - phrase.length; i++) {
      if (phrase.every((w, j) => words[i + j] === w)) {
        phrase.forEach((_, j) => spans[i + j].classList.add("glow-word"));
      }
    }
  });

  // Ord på samme linje har samme top-position
  let line = -1;
  let lastTop = null;
  let wordInLine = 0;

  spans.forEach((span) => {
    const top = span.offsetTop;

    if (lastTop === null || Math.abs(top - lastTop) > 4) {
      line++;
      wordInLine = 0;
      lastTop = top;
    }

    const delay = INTRO_START + line * INTRO_LINE_GAP + wordInLine * 0.045;
    span.style.setProperty("--delay", `${delay.toFixed(3)}s`);
    wordInLine++;
  });

  const textEnd = INTRO_START + line * INTRO_LINE_GAP + 1.3;

  introContent.style.setProperty("--glow-delay", `${textEnd.toFixed(2)}s`);
  introContent.style.setProperty("--buttons-delay", `${(textEnd + 0.4).toFixed(2)}s`);
  introContent.classList.add("words-ready");
}

revealIntroText();

// ---------------- SLUTNING: SOLOPGANG ----------------
const dawnSky = document.getElementById("dawnSky");

function buildStars() {
  const stars = dawnSky?.querySelector(".sky-stars");
  if (!stars) return;

  const count = isSmallScreen ? 55 : 90;

  for (let i = 0; i < count; i++) {
    const star = document.createElement("span");
    const size = rand(1, 2.6);

    star.style.left = rand(0, 100) + "%";
    star.style.top = rand(0, 70) + "%";
    star.style.width = size + "px";
    star.style.height = size + "px";
    star.style.animationDelay = rand(0, 4).toFixed(2) + "s";
    star.style.animationDuration = rand(2.5, 5).toFixed(2) + "s";

    stars.appendChild(star);
  }
}

buildStars();

// Himlen starter som nat og lysner langsomt til solopgang
function startSunrise() {
  if (!dawnSky) return;

  document.body.classList.add("is-ending");
  dawnSky.classList.remove("rise");
  void dawnSky.offsetWidth;
  dawnSky.classList.add("rise");

  // Ét stjerneskud, mens det endnu er nat
  const star = dawnSky.querySelector(".shooting-star");
  if (star) {
    star.style.top = rand(8, 26) + "%";
    star.style.left = rand(15, 55) + "%";
  }
}

function resetSunrise() {
  document.body.classList.remove("is-ending");
  dawnSky?.classList.remove("rise");
}

// ---------------- SMÅ LEVENDE DETALJER ----------------
/*
 * Hvert kapitel har sin egen lille stemning i luften:
 * I  guld – varme støvkorn, der stiger op, som i en gammel stue
 * II violet – store, bløde lyskugler, der driver langsomt
 * III tusmørke – fine, kolde korn, der falder stille, som let regn
 * IV daggry – små lysglimt, der stiger op mod morgenlyset
 * Den samme håndfuld elementer genbruges; CSS skifter udtryk pr. kapitel.
 */
function createChapterAmbience() {
  const ambience = document.getElementById("chapterAmbience");
  if (!ambience || reducedMotion) return;

  const count = isSmallScreen ? 12 : 18;

  for (let i = 0; i < count; i++) {
    const mote = document.createElement("span");

    mote.className = "amb";
    mote.style.left = rand(0, 100) + "%";
    mote.style.top = rand(0, 100) + "%";
    mote.style.setProperty("--size", rand(0.6, 1.4).toFixed(2));
    mote.style.setProperty("--drift", rand(-30, 30).toFixed(0) + "px");
    mote.style.animationDuration = rand(9, 17).toFixed(1) + "s";
    mote.style.animationDelay = -rand(0, 17).toFixed(1) + "s";

    ambience.appendChild(mote);
  }
}

createChapterAmbience();

// Et blødt lys spreder sig dér, hvor man rører forsiden
hero.addEventListener("pointerdown", (event) => {
  if (reducedMotion || event.target.closest("button, a")) return;

  const glow = document.createElement("span");
  glow.className = "touch-glow";
  glow.style.left = event.clientX + "px";
  glow.style.top = event.clientY + "px";

  document.body.appendChild(glow);
  glow.addEventListener("animationend", () => glow.remove());
});

// ---------------- START ----------------
musicBtn.addEventListener("click", () => {
  window.trackWebsiteEvent?.("FØDSELSDAGSGAVEN BLEV STARTET");

  if (state.phase === "hero") {
    startCandle();
  }
});

function createParticles() {
  const count = isSmallScreen ? 28 : 46;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("span");
    particle.classList.add("particle");

    const size = 2 + Math.random() * 8;

    particle.style.left = Math.random() * 100 + "vw";
    particle.style.top = Math.random() * 100 + "vh";
    particle.style.animationDuration = 8 + Math.random() * 10 + "s";
    particle.style.animationDelay = Math.random() * 6 + "s";
    particle.style.width = size + "px";
    particle.style.height = size + "px";
    particle.style.setProperty("--particle-opacity", 0.2 + Math.random() * 0.7);

    document.body.appendChild(particle);
  }
}

createParticles();

const storyButton = document.getElementById("storyButton");

if (storyButton) {
  // Sideovergangen (page-transition.js) venter et øjeblik,
  // så beskeden også når at blive sendt.
  storyButton.addEventListener("click", () => {
    window.trackWebsiteEvent?.("STORY-KNAPPEN BLEV TRYKKET");
  });
}

const restartBtn = document.getElementById("restartBtn");

if (restartBtn) {
  restartBtn.addEventListener("click", () => {
    window.trackWebsiteEvent?.("SE DET IGEN BLEV TRYKKET");

    endingSection.classList.remove("show");

    setTimeout(
      () => {
        resetSunrise();
        state.phase = "hero"; // så goToSlide ikke prøver at tone et slide ud
        enterSlideshow();
      },
      reducedMotion ? 0 : 700,
    );
  });
}
