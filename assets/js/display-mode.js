(() => {
    const preferenceKey = "sunay-display-mode";
    const controls = document.querySelector(".display-preferences");
    if (!controls) return;

    const choices = [...controls.querySelectorAll('input[name="display-mode"]')];
    const descriptions = [];
    let mode = "standard";

    document.querySelectorAll(".section-collection .entry-annotation").forEach((paragraph, index) => {
        const entry = paragraph.closest("li");
        if (!entry) return;

        const title = document.createElement("span");
        for (const node of entry.childNodes) {
            if (node === paragraph) break;
            title.append(node.cloneNode(true));
        }

        paragraph.id ||= `entry-description-${index + 1}`;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "annotation-toggle";
        button.setAttribute("aria-controls", paragraph.id);
        button.hidden = true;
        paragraph.before(button);
        descriptions.push({ paragraph, button, title: title.textContent.trim(), expanded: false });

        button.addEventListener("click", () => {
            const description = descriptions.find((item) => item.button === button);
            description.expanded = !description.expanded;
            updateDescription(description);
        });
    });

    function updateDescription(description) {
        const { paragraph, button, title, expanded } = description;
        button.hidden = mode !== "compact";
        button.textContent = "About";
        button.setAttribute("aria-expanded", String(expanded));
        button.setAttribute("aria-label", `About: ${title}`);
        paragraph.hidden = mode === "compact" && !expanded;
    }

    function applyMode(value) {
        mode = value === "compact" ? "compact" : "standard";
        document.documentElement.dataset.displayMode = mode;
        choices.forEach((choice) => { choice.checked = choice.value === mode; });
        descriptions.forEach(updateDescription);
    }

    function revealDescription(scroll = false) {
        let target;
        try {
            target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
        } catch {
            return;
        }
        if (!target) return;
        const description = descriptions.find(({ paragraph }) => paragraph === target || paragraph.contains(target));
        if (description) {
            description.expanded = true;
            updateDescription(description);
            for (let ancestor = target.parentElement; ancestor; ancestor = ancestor.parentElement) {
                if (ancestor.tagName === "DETAILS") ancestor.open = true;
            }
            if (scroll) {
                window.requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
            }
        }
    }

    try {
        applyMode(window.localStorage.getItem(preferenceKey));
    } catch {
        applyMode("standard");
    }
    revealDescription(true);
    controls.hidden = false;

    choices.forEach((choice) => {
        choice.addEventListener("change", () => {
            if (!choice.checked) return;
            // Only change presentation; native details elements retain their open state.
            applyMode(choice.value);
            revealDescription();
            try {
                window.localStorage.setItem(preferenceKey, mode);
            } catch {
                // The view still works when browser storage is unavailable.
            }
        });
    });
    window.addEventListener("hashchange", () => revealDescription(true));
    window.addEventListener("storage", (event) => {
        if (event.key !== preferenceKey && event.key !== null) return;
        applyMode(event.newValue);
        revealDescription();
    });
})();
