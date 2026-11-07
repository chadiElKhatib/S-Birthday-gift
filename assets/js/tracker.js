(() => {
  "use strict";

  const TRACKING_ENDPOINT =
    "https://birthday-tracker.chadi-kasswani51.workers.dev";

  const OPENED_AFTER_MILLISECONDS = 3000;

  // Korte fane-skift ignoreres, så Discord ikke bliver fyldt.
  const MIN_HIDDEN_SECONDS_FOR_RETURN = 3;

  const pageName = document.body.dataset.page || "ukendt";

  function createId() {
    try {
      return crypto.randomUUID();
    } catch {
      return (
        Date.now().toString(36) + "-" + Math.random().toString(36).slice(2)
      );
    }
  }

  function getSessionId() {
    try {
      let id = sessionStorage.getItem("trackingSessionId");

      if (!id) {
        id = createId();
        sessionStorage.setItem("trackingSessionId", id);
      }

      return id;
    } catch {
      return createId();
    }
  }

  const sessionId = getSessionId();
  const pageViewId = createId();

  const device = /iPhone|iPad|Android|Mobi/i.test(navigator.userAgent)
    ? "📱 Mobil"
    : "💻 Computer";

  const BOT_PATTERNS = [
    [/facebookexternalhit|facebot/i, "Messenger/Instagram/iMessage-forhåndsvisning"],
    [/snap url preview/i, "Snapchat-forhåndsvisning"],
    [/whatsapp/i, "WhatsApp-forhåndsvisning"],
    [/twitterbot/i, "X/Twitter-forhåndsvisning"],
    [/telegrambot/i, "Telegram-forhåndsvisning"],
    [/discordbot/i, "Discord-forhåndsvisning"],
    [/slackbot|slack-imgproxy/i, "Slack-forhåndsvisning"],
    [/linkedinbot/i, "LinkedIn-forhåndsvisning"],
    [/skypeuripreview/i, "Skype/Teams-forhåndsvisning"],
    [/googlebot|google-inspectiontool|googleother/i, "Google"],
    [/bingbot/i, "Bing"],
    [/applebot/i, "Apple"],
    [/headlesschrome|phantomjs|puppeteer|playwright/i, "Headless browser"],
    [/\bbot\b|bot\/|crawler|spider|preview/i, "Ukendt robot"],
  ];

  function detectBot() {
    const userAgent = navigator.userAgent;

    for (const [pattern, name] of BOT_PATTERNS) {
      if (pattern.test(userAgent)) {
        return { isBot: true, name };
      }
    }

    if (navigator.webdriver === true) {
      return { isBot: true, name: "Automatiseret browser" };
    }

    return { isBot: false, name: "ingen kendt bot" };
  }

  const bot = detectBot();

  let visibleSince = document.visibilityState === "visible" ? Date.now() : null;
  let totalVisibleMilliseconds = 0;
  let maxScrollPercent = 0;
  let interactionCount = 0;

  let pageOpenedSent = false;
  let leftEventSent = false;
  let hiddenAt = null;
  let openTimer = null;

  function getVisibleMilliseconds() {
    let milliseconds = totalVisibleMilliseconds;

    if (visibleSince !== null) {
      milliseconds += Date.now() - visibleSince;
    }

    return milliseconds;
  }

  function buildTrackingData(eventName, extra = {}) {
    return {
      event: eventName,
      page: pageName,

      sessionId,
      pageViewId,

      device,

      time: new Date().toLocaleString("da-DK"),
      timestamp: new Date().toISOString(),

      visibleSeconds: Math.floor(getVisibleMilliseconds() / 1000),

      maxScrollPercent,
      interactionCount,

      visibilityState: document.visibilityState,

      possibleBot: bot.isBot,
      botName: bot.name,

      userAgent: navigator.userAgent,
      referrer: document.referrer || "direkte link",

      screenWidth: window.screen.width,
      screenHeight: window.screen.height,

      ...extra,
    };
  }

  async function sendTrackingEvent(eventName, extra = {}, useBeacon = false) {
    if (!TRACKING_ENDPOINT) {
      return;
    }

    const jsonData = JSON.stringify(buildTrackingData(eventName, extra));

    try {
      if (useBeacon && navigator.sendBeacon) {
        const blob = new Blob([jsonData], {
          type: "text/plain;charset=UTF-8",
        });

        if (navigator.sendBeacon(TRACKING_ENDPOINT, blob)) {
          return;
        }
      }

      const response = await fetch(TRACKING_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonData,
        keepalive: true,
      });

      if (!response.ok) {
        console.error("Tracking kunne ikke sendes:", response.status);
      }
    } catch (error) {
      console.error("Trackingfejl:", error);
    }
  }

  window.trackWebsiteEvent = (eventName, extra = {}) => {
    return sendTrackingEvent(eventName, extra);
  };

  if (bot.isBot) {
    sendTrackingEvent(`🤖 ROBOT / LINK-FORHÅNDSVISNING: ${bot.name}`);
    return;
  }

  function markOpened() {
    if (pageOpenedSent || document.visibilityState !== "visible") {
      return;
    }

    pageOpenedSent = true;
    clearTimeout(openTimer);

    sendTrackingEvent("SIDE ÅBNET");
  }

  // Tæller kun den tid, siden faktisk har været synlig.
  function scheduleOpenedCheck() {
    clearTimeout(openTimer);

    if (pageOpenedSent || document.visibilityState !== "visible") {
      return;
    }

    const remaining = OPENED_AFTER_MILLISECONDS - getVisibleMilliseconds();

    openTimer = setTimeout(markOpened, Math.max(0, remaining));
  }

  // "Forladt" sendes kun, hvis "åbnet" er sendt først – og kun én gang.
  function markLeft() {
    if (!pageOpenedSent || leftEventSent) {
      return;
    }

    leftEventSent = true;

    sendTrackingEvent(
      "SIDE SKJULT",
      {
        explanation:
          "Browseren blev minimeret, fanen blev skiftet, en anden app blev åbnet, eller telefonen blev låst",
      },
      true,
    );
  }

  function handleHidden() {
    if (visibleSince !== null) {
      totalVisibleMilliseconds += Date.now() - visibleSince;
      visibleSince = null;
    }

    clearTimeout(openTimer);

    if (hiddenAt === null) {
      hiddenAt = Date.now();
    }

    markLeft();
  }

  function handleVisible() {
    if (visibleSince === null) {
      visibleSince = Date.now();
    }

    const hiddenSeconds = hiddenAt
      ? Math.floor((Date.now() - hiddenAt) / 1000)
      : 0;

    hiddenAt = null;

    if (leftEventSent) {
      leftEventSent = false;

      if (hiddenSeconds >= MIN_HIDDEN_SECONDS_FOR_RETURN) {
        sendTrackingEvent("SIDE TILBAGE", { hiddenSeconds });
      }
    }

    scheduleOpenedCheck();
  }

  function updateScrollPercentage() {
    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    if (scrollableHeight <= 0) {
      maxScrollPercent = 100;
      return;
    }

    const currentPercentage = Math.round(
      (window.scrollY / scrollableHeight) * 100,
    );

    maxScrollPercent = Math.max(
      maxScrollPercent,
      Math.min(100, currentPercentage),
    );
  }

  window.addEventListener(
    "scroll",
    () => {
      updateScrollPercentage();
      markOpened();
    },
    { passive: true },
  );

  ["click", "touchstart", "keydown"].forEach((eventName) => {
    document.addEventListener(
      eventName,
      () => {
        interactionCount++;
        markOpened();
      },
      { passive: true, capture: true },
    );
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      handleHidden();
    } else {
      handleVisible();
    }
  });

  // pagehide fanger lukning af fanen, også hvor visibilitychange udebliver.
  window.addEventListener("pagehide", handleHidden);

  // Siden blev genskabt fra browserens cache (frem/tilbage-knap).
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && document.visibilityState === "visible") {
      handleVisible();
    }
  });

  scheduleOpenedCheck();
})();

const backButton = document.getElementById("backButton");

if (backButton) {
  backButton.addEventListener("click", (event) => {
    event.preventDefault();

    const destination = backButton.href;

    window.trackWebsiteEvent?.("TILBAGE-KNAPPEN BLEV TRYKKET");

    setTimeout(() => {
      window.location.href = destination;
    }, 250);
  });
}
