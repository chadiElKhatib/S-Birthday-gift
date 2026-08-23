/*(() => {
  "use strict";

  const TRACKING_ENDPOINT =
    "https://birthday-tracker.chadi-kasswani51.workers.dev";

  const pageName = document.body.dataset.page || "ukendt";

  let sessionId = sessionStorage.getItem("trackingSessionId");

  if (!sessionId) {
    sessionId = crypto.randomUUID();

    sessionStorage.setItem("trackingSessionId", sessionId);
  }

  const pageViewId = crypto.randomUUID();

  let visibleSince = document.visibilityState === "visible" ? Date.now() : null;

  let totalVisibleMilliseconds = 0;
  let maxScrollPercent = 0;
  let interactionCount = 0;

  let hiddenAt = null;
  let hiddenEventSent = false;
  let pageOpenedSent = false;

  let lastVisibilityState = document.visibilityState;

  const device = /iPhone|iPad|Android|Mobi/i.test(navigator.userAgent)
    ? "📱 Mobil"
    : "💻 Computer";

  function getBotInformation() {
    const userAgent = navigator.userAgent.toLowerCase();

    const botNames = [
      "googlebot",
      "bingbot",
      "discordbot",
      "facebookexternalhit",
      "twitterbot",
      "linkedinbot",
      "telegrambot",
      "whatsapp",
      "crawler",
      "spider",
      "preview",
      "bot",
    ];

    const foundBot = botNames.find((name) => userAgent.includes(name));

    return {
      possibleBot: Boolean(foundBot),
      botName: foundBot || "ingen kendt bot",
    };
  }

  function getVisibleSeconds() {
    let milliseconds = totalVisibleMilliseconds;

    if (visibleSince !== null) {
      milliseconds += Date.now() - visibleSince;
    }

    return Math.floor(milliseconds / 1000);
  }

  function buildTrackingData(eventName, extra = {}) {
    const botInformation = getBotInformation();

    return {
      event: eventName,
      page: pageName,

      sessionId,
      pageViewId,

      device,

      time: new Date().toLocaleString("da-DK"),

      timestamp: new Date().toISOString(),

      visibleSeconds: getVisibleSeconds(),

      maxScrollPercent,
      interactionCount,

      visibilityState: document.visibilityState,

      possibleBot: botInformation.possibleBot,

      botName: botInformation.botName,

      userAgent: navigator.userAgent,

      referrer: document.referrer || "direkte link",

      screenWidth: window.screen.width,

      screenHeight: window.screen.height,

      ...extra,
    };
  }

  async function sendTrackingEvent(eventName, extra = {}, useBeacon = false) {
    const data = buildTrackingData(eventName, extra);

    const jsonData = JSON.stringify(data);

    console.log("Tracking:", data);

    if (!TRACKING_ENDPOINT) {
      return;
    }

    try {
      if (useBeacon && navigator.sendBeacon) {
        const blob = new Blob([jsonData], {
          type: "text/plain;charset=UTF-8",
        });

        const beaconSent = navigator.sendBeacon(TRACKING_ENDPOINT, blob);

        if (beaconSent) {
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

  window.addEventListener("scroll", updateScrollPercentage, {
    passive: true,
  });

  /*
   * capture: true gør, at klikket
   * tælles før knapkoden sender eventet.
   */
  ["click", "touchstart", "keydown"].forEach((eventName) => {
    document.addEventListener(
      eventName,
      () => {
        interactionCount++;
      },
      {
        passive: true,
        capture: true,
      },
    );
  });

  window.addEventListener("pageshow", (event) => {
    visibleSince = Date.now();

    if (pageOpenedSent) {
      return;
    }

    pageOpenedSent = true;

    sendTrackingEvent("SIDE ÅBNET", {
      restoredFromCache: event.persisted,
    });
  });

  document.addEventListener("visibilitychange", () => {
    const newState = document.visibilityState;

    /*
     * Stop hvis browseren sender
     * samme status flere gange.
     */
    if (newState === lastVisibilityState) {
      return;
    }

    if (newState === "hidden") {
      if (visibleSince !== null) {
        totalVisibleMilliseconds += Date.now() - visibleSince;

        visibleSince = null;
      }

      hiddenAt = Date.now();
      hiddenEventSent = true;

      sendTrackingEvent(
        "SIDE SKJULT",
        {
          explanation:
            "Browseren blev minimeret, fanen blev skiftet, en anden app blev åbnet, eller telefonen blev låst",
        },
        true,
      );
    }

    if (newState === "visible") {
      const hiddenSeconds = hiddenAt
        ? Math.floor((Date.now() - hiddenAt) / 1000)
        : 0;

      visibleSince = Date.now();

      hiddenEventSent = false;

      /*
       * Ignorér meget korte skift,
       * så Discord ikke bliver fyldt.
       */
      if (hiddenSeconds >= 3) {
        sendTrackingEvent("SIDE TILBAGE", {
          hiddenSeconds,
        });
      }
    }

    lastVisibilityState = newState;
  });

  window.trackWebsiteEvent = (eventName, extra = {}) => {
    return sendTrackingEvent(eventName, extra);
  };
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
