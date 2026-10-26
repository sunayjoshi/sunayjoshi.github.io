(() => {
    function revealTarget(hash) {
        if (!hash) return null;

        let id;
        try {
            id = decodeURIComponent(hash.slice(1));
        } catch {
            return null;
        }

        const target = document.getElementById(id);
        if (!target) return null;

        for (let ancestor = target.parentElement; ancestor; ancestor = ancestor.parentElement) {
            if (ancestor.tagName === "DETAILS") ancestor.open = true;
        }

        return target;
    }

    document.addEventListener("click", (event) => {
        if (event.defaultPrevented || event.button !== 0 ||
            event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        const link = event.target instanceof Element
            ? event.target.closest("a.latest-update-link")
            : null;

        const href = link && link.getAttribute("href");
        if (href && href.startsWith("#")) {
            revealTarget(link.hash);
        }
    });

    function revealCurrentFragment() {
        const target = revealTarget(window.location.hash);
        if (target) {
            window.requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
        }
    }

    window.addEventListener("hashchange", revealCurrentFragment);
    revealCurrentFragment();
})();
