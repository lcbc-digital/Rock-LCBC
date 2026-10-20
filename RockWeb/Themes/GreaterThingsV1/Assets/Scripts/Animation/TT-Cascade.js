// ============================================================
// TT Cascade Animation Utility
// ============================================================
//
// A lightweight, attribute-driven animation helper for creating
// staggered entrance animations on grouped elements.
//
// Built for use with HTMX and ASP.NET WebForms, ensuring safe
// re-initialization on swaps, postbacks, and history navigation.
//
// ------------------------------------------------------------
// ATTRIBUTES
// ------------------------------------------------------------
//
// tt-cascade
//   Defines the animation type applied to items.
//   Options: fade-up (default), fade-down, fade-left, fade-right, fade.
//
// tt-cascade-item
//   Marks child elements inside the container that will be animated.
//
// tt-cascade-duration
//   Base animation duration in milliseconds (default: 400).
//
// tt-cascade-delay
//   Initial delay before the first item animates in milliseconds (default: 0).
//
// tt-cascade-stagger
//   Time between each item's animation start in milliseconds (default: 100).
//
// tt-cascade-duration-increment
//   Amount added to duration per item index, creating progressive timing (default: 50).
//
// tt-cascade-distance
//   Distance in pixels elements travel during animation (default: 120).
//
// tt-cascade-trigger
//   CSS selector for a custom ScrollTrigger element.
//   Defaults to the container if not provided.
//
// tt-cascade-media
//   Optional media query string (e.g. "(max-width: 1200px)"). When set, the
//   cascade runs only if the query matches; otherwise children are left untouched.
//
// tt-cascade-manual
//   Present on a container: skip auto init on load. Call window.TTCascade.play(container)
//   when the block becomes visible (e.g. mobile drawer open). Use reset / resetAllIn to
//   return items to the hidden state when closing.
//
// ------------------------------------------------------------
// USAGE
// ------------------------------------------------------------
//
// Add `tt-cascade` to a container and `tt-cascade-item` to its children.
//
// Example:
// <div tt-cascade="fade-up" tt-cascade-stagger="100">
//     <h2 tt-cascade-item>Heading</h2>
//     <p tt-cascade-item>Content</p>
//     <div tt-cascade-item>Card</div>
// </div>
//
// Created by Brydon Johnson – Triumph Tech
// ============================================================

// ============================================================
// TT Cascade Animation Utility (HTMX + WebForms Safe)
// ============================================================
(function () {

    function getAttr(el, name, fallback) {
        const val = el.getAttribute(name);
        return val !== null ? val : fallback;
    }

    function getNum(el, name, fallback) {
        const val = parseFloat(el.getAttribute(name));
        return isNaN(val) ? fallback : val;
    }

    function markInitialized(el) {
        el.dataset.ttCascadeInit = "true";
    }

    function isInitialized(el) {
        return el.dataset.ttCascadeInit === "true";
    }

    function mediaMatches(container) {
        const mediaQuery = getAttr(container, "tt-cascade-media", null);
        if (!mediaQuery || typeof window.matchMedia !== "function") {
            return true;
        }
        return window.matchMedia(mediaQuery).matches;
    }

    function getCascadeMotion(container) {
        const type = getAttr(container, "tt-cascade", "fade-up");
        const distance = getNum(container, "tt-cascade-distance", 120);
        let dx = 0;
        let dy = 0;
        switch (type) {
            case "fade-down": dy = -distance; break;
            case "fade-left": dx = distance; break;
            case "fade-right": dx = -distance; break;
            case "fade": break;
            case "fade-up":
            default: dy = distance; break;
        }
        return {
            type,
            durationBase: getNum(container, "tt-cascade-duration", 400) / 1000,
            delayBase: getNum(container, "tt-cascade-delay", 0) / 1000,
            stagger: getNum(container, "tt-cascade-stagger", 100) / 1000,
            durationIncrement: getNum(container, "tt-cascade-duration-increment", 50) / 1000,
            distance,
            dx,
            dy,
        };
    }

    function killItemTween(el) {
        if (el._ttCascadeTween) {
            el._ttCascadeTween.kill();
            el._ttCascadeTween = null;
        }
    }

    function playManual(container) {
        if (!container || !container.hasAttribute("tt-cascade")) return;
        const items = container.querySelectorAll("[tt-cascade-item]");
        if (!items.length) return;

        if (!mediaMatches(container)) {
            items.forEach((el) => {
                killItemTween(el);
                gsap.set(el, { x: 0, y: 0, autoAlpha: 1 });
            });
            return;
        }

        const motion = getCascadeMotion(container);
        const minDuration = 0.1;

        items.forEach((el, index) => {
            killItemTween(el);
            // No will-change here on purpose: force3D promotes via translate3d
            // already, and setting/clearing will-change per run creates and
            // destroys a layer per item mid-interaction, which iOS stutters on.
            gsap.set(el, {
                x: motion.dx,
                y: motion.dy,
                autoAlpha: 0,
                force3D: true,
            });
            const duration = Math.max(minDuration, motion.durationBase + (motion.durationIncrement * index));
            const delay = motion.delayBase + (motion.stagger * index);
            el._ttCascadeTween = gsap.to(el, {
                x: 0,
                y: 0,
                autoAlpha: 1,
                duration,
                delay,
                ease: "power3.out",
                force3D: true,
            });
        });
    }

    function resetManual(container) {
        if (!container || !container.hasAttribute("tt-cascade")) return;
        const items = container.querySelectorAll("[tt-cascade-item]");
        const motion = getCascadeMotion(container);

        items.forEach((el) => {
            killItemTween(el);
            if (mediaMatches(container)) {
                gsap.set(el, { x: motion.dx, y: motion.dy, autoAlpha: 0, force3D: true });
            } else {
                gsap.set(el, { x: 0, y: 0, autoAlpha: 1 });
            }
        });
    }

    function resetManualIn(root) {
        if (!root || !root.querySelectorAll) return;
        root.querySelectorAll("[tt-cascade-manual]").forEach(resetManual);
    }

    // A cascade skipped for its media query keeps the CSS opacity: 0 on its items, so
    // resizing into that query would show nothing until a refresh. Init it on the switch.
    function initWhenMediaMatches(container) {
        if (container._ttCascadeMediaWatch) return;

        const mediaQueryList = window.matchMedia(getAttr(container, "tt-cascade-media", null));
        const onChange = (event) => {
            if (!event.matches) return;
            mediaQueryList.removeEventListener("change", onChange);
            container._ttCascadeMediaWatch = null;
            initCascade(container);
        };

        container._ttCascadeMediaWatch = onChange;
        mediaQueryList.addEventListener("change", onChange);
    }

    function initCascade(container) {

        if (isInitialized(container)) return;
        if (container.hasAttribute("tt-cascade-manual")) return;

        if (!mediaMatches(container)) {
            initWhenMediaMatches(container);
            return;
        }

        markInitialized(container);

        const motion = getCascadeMotion(container);
        const triggerSelector = getAttr(container, "tt-cascade-trigger", null);
        const triggerEl = triggerSelector
            ? document.querySelector(triggerSelector)
            : container;
        const startValue = getAttr(container, "tt-cascade-start", "top 90%");

        const items = container.querySelectorAll("[tt-cascade-item]");
        if (!items.length) return;

        items.forEach((el, index) => {

            killItemTween(el);

            gsap.set(el, {
                x: motion.dx,
                y: motion.dy,
                autoAlpha: 0
            });

            const minDuration = 0.1;
            const duration = Math.max(minDuration, motion.durationBase + (motion.durationIncrement * index));
            const delay = motion.delayBase + (motion.stagger * index);

            el._ttCascadeTween = gsap.to(el, {
                x: 0,
                y: 0,
                autoAlpha: 1,
                duration: duration,
                delay: delay,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: triggerEl,
                    start: startValue,
                    toggleActions: "play none none none"
                }
            });

        });
    }

    function initAll(context = document) {
        const containers = context.querySelectorAll("[tt-cascade]");
        containers.forEach((container) => {
            if (container.hasAttribute("tt-cascade-manual")) return;
            initCascade(container);
        });
    }

    window.TTCascade = {
        play: playManual,
        reset: resetManual,
        resetAllIn: resetManualIn,
    };

    // ============================================================
    // Initial Load
    // ============================================================
    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        window.addEventListener("load", () => initAll());
    }

    // ============================================================
    // HTMX Support
    // ============================================================
    document.body.addEventListener("htmx:afterSwap", function (evt) {
        initAll(evt.target);
    });

    // ============================================================
    // ASP.NET Postback Support
    // ============================================================
    if (window.Sys?.WebForms?.PageRequestManager) {
        Sys.WebForms.PageRequestManager.getInstance()
            .add_endRequest(() => initAll());
    }

})();