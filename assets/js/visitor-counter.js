(function () {
    "use strict";

    // Counts page views, not unique people. Read-only totals:
    // https://hits.sh/sunayjoshi.github.io/
    if (window.location.hostname !== "sunayjoshi.github.io" ||
        window.location.protocol !== "https:" ||
        navigator.webdriver ||
        navigator.doNotTrack === "1" ||
        window.doNotTrack === "1" ||
        navigator.globalPrivacyControl === true ||
        typeof window.fetch !== "function") {
        return;
    }

    function countView() {
        if (document.visibilityState !== "visible") {
            return;
        }

        document.removeEventListener("visibilitychange", countView);
        window.fetch("https://hits.sh/sunayjoshi.github.io.svg", {
            mode: "no-cors",
            credentials: "omit",
            cache: "no-store",
            referrerPolicy: "no-referrer",
            keepalive: true
        }).catch(function () {
            // A blocked or unavailable counter must not affect the page.
        });
    }

    if (document.visibilityState === "visible") {
        countView();
    } else {
        document.addEventListener("visibilitychange", countView);
    }
}());
