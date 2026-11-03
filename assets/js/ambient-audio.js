/*
 * Fælles stemningslyd til "Sidste ord" (piano) og "Tid siden" (regn).
 *
 * Regler:
 * - Lyden starter først ved første tryk (iPhone tillader ikke lyd før).
 * - Den toner meget blødt ind og spiller meget lavt.
 * - Den lille knap slår lyden fra og til.
 * - Lyden går på pause, når siden skjules (anden app, låst telefon).
 *
 * Lydstyrken styres med Web Audio (GainNode), fordi iPhone ikke
 * tillader at ændre audio.volume.
 */
function createAmbientSound({
  button,
  hint = null,
  volume = 0.1,
  fadeSeconds = 4,
  element = null, // et <audio>-element (piano), eller…
  build = null, // …en funktion der bygger lyden selv (regn)
}) {
  let ctx = null;
  let gain = null;
  let started = false;
  let muted = false;
  let volumeOnly = false; // file:// – Web Audio ville give stilhed
  let volumeFade = null;

  function setup() {
    const Context = window.AudioContext || window.webkitAudioContext;

    if (element && (location.protocol === "file:" || !Context)) {
      volumeOnly = true;
      return;
    }

    if (!Context) return;

    ctx = new Context();
    gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    if (element) {
      ctx.createMediaElementSource(element).connect(gain);
    } else if (build) {
      build(ctx, gain);
    }
  }

  function ramp(target, seconds) {
    if (gain) {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now);
      gain.gain.linearRampToValueAtTime(target, now + seconds);
      return;
    }

    if (!element) return;

    clearInterval(volumeFade);
    const start = element.volume;
    const steps = Math.max(1, Math.round((seconds * 1000) / 50));
    let step = 0;

    volumeFade = setInterval(() => {
      step++;
      element.volume = Math.min(1, Math.max(0, start + ((target - start) * step) / steps));
      if (step >= steps) clearInterval(volumeFade);
    }, 50);
  }

  function updateButton() {
    if (!button) return;

    const on = started && !muted;
    button.textContent = on ? "🔊" : "🔇";
    button.setAttribute("aria-label", on ? "Slå lyden fra" : "Slå lyden til");
    button.classList.toggle("is-on", on);
    hint?.classList.toggle("is-hidden", started);
  }

  function start() {
    if (started) return;

    started = true;
    muted = false;

    setup();

    if (element) {
      if (volumeOnly) element.volume = 0;

      // play() kaldes direkte i trykket, så iPhone tillader det.
      element.play().catch(() => {
        started = false;
        updateButton();
      });
    }

    ctx?.resume();
    ramp(volume, fadeSeconds);
    updateButton();
  }

  function mute() {
    muted = true;
    ramp(0, 0.8);

    setTimeout(() => {
      if (!muted) return;
      element?.pause();
      ctx?.suspend();
    }, 900);

    updateButton();
  }

  function unmute() {
    muted = false;
    ctx?.resume();
    element?.play().catch(() => {});
    ramp(volume, 2);
    updateButton();
  }

  button?.addEventListener("click", (event) => {
    event.stopPropagation();

    if (!started) start();
    else if (muted) unmute();
    else mute();
  });

  // Første rigtige tryk et sted på siden starter lyden.
  const firstGesture = (event) => {
    if (button && button.contains(event.target)) return;

    start();

    if (started) {
      ["touchend", "click", "keydown"].forEach((type) =>
        document.removeEventListener(type, firstGesture, true),
      );
    }
  };

  ["touchend", "click", "keydown"].forEach((type) =>
    document.addEventListener(type, firstGesture, { capture: true, passive: true }),
  );

  document.addEventListener("visibilitychange", () => {
    if (!started || muted) return;

    if (document.visibilityState === "hidden") {
      element?.pause();
      ctx?.suspend();
    } else {
      ctx?.resume();
      element?.play().catch(() => {});
    }
  });

  updateButton();

  return { start, isPlaying: () => started && !muted, context: () => ctx };
}
