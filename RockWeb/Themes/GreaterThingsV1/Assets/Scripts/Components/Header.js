// ============================================================
// Site Header — mobile drawer
// ============================================================
//
// Two-level sliding drawer. The main panel lists the top-level
// pages; any page with children swaps in its own panel via
// TTCascade, which replays the stagger on every switch.
//
// Depends on: GSAP core, TT-Cascade.js
// ============================================================
(function () {
    var header = document.querySelector('header#SiteHeader');
    if (!header) return;

    var toggle = header.querySelector('.js-site-header-toggle');
    var drawer = header.querySelector('.site-header-drawer');
    if (!toggle || !drawer) return;

    var scroller = drawer.querySelector('.site-header-drawer-scroll');

    var MAIN_PANEL_ID = 'drawer-panel-main';

    function resetCascades() {
        if (window.TTCascade && typeof window.TTCascade.resetAllIn === 'function') {
            window.TTCascade.resetAllIn(drawer);
        }
    }

    function playActiveCascade() {
        if (!drawer.classList.contains('is-open')) return;
        if (!window.TTCascade || typeof window.TTCascade.play !== 'function') return;

        var active = drawer.querySelector('.js-site-header-drawer-panel.is-active');
        if (!active) return;

        var cascade = active.querySelector('[tt-cascade-manual]');
        if (!cascade) return;

        window.TTCascade.play(cascade);
    }

    function switchPanel(targetId, skipPlay) {
        drawer.querySelectorAll('.js-site-header-drawer-panel').forEach(function (panel) {
            panel.classList.remove('is-active');
        });

        var target = document.getElementById(targetId);
        if (target) target.classList.add('is-active');

        // Reset *after* the swap. Resetting first snaps the outgoing panel's
        // items to their start offset while it is still on screen — one frame
        // of visible jump, which iOS renders and desktop usually swallows.
        // Nothing paints between the class change and this, so the incoming
        // panel never shows its items at full opacity either.
        resetCascades();

        // A sub-panel left mid-scroll would otherwise restore at that offset.
        if (scroller) scroller.scrollTop = 0;

        if (skipPlay) return;

        requestAnimationFrame(playActiveCascade);
    }

    // The drawer opens below the header, but a promo banner above the header
    // shifts its top edge. Measure the real top so it always ends at the
    // viewport bottom instead of overflowing.
    function sizeDrawer() {
        if (!drawer.classList.contains('is-open')) return;
        // Floor it — a fractional height leaves the flex children splitting a
        // subpixel remainder, which iOS renders as a seam between them.
        var top = drawer.getBoundingClientRect().top;
        drawer.style.height = Math.max(0, Math.floor(window.innerHeight - top)) + 'px';
    }

    function openDrawer() {
        drawer.hidden = false;
        drawer.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close menu');
        document.body.classList.add('site-header-drawer-open');
        sizeDrawer();

        // Items are already parked by the close-time reset, so one frame is
        // enough for layout to settle after `hidden` comes off.
        requestAnimationFrame(playActiveCascade);
    }

    function closeDrawer() {
        drawer.classList.remove('is-open');
        drawer.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        document.body.classList.remove('site-header-drawer-open');
        switchPanel(MAIN_PANEL_ID, true);
    }

    function toggleDrawer() {
        if (drawer.classList.contains('is-open')) closeDrawer();
        else openDrawer();
    }

    toggle.addEventListener('click', toggleDrawer);

    drawer.addEventListener('click', function (e) {
        var subTrigger = e.target.closest('.js-sub-trigger');
        if (subTrigger) {
            switchPanel(subTrigger.dataset.target);
            return;
        }

        if (e.target.closest('.js-site-header-drawer-back-btn')) {
            switchPanel(MAIN_PANEL_ID);
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
    });

    window.addEventListener('resize', sizeDrawer);
})();
