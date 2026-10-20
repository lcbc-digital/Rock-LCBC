//- Drifts the arrow texture down the section as it passes through the viewport, so it travels
//- further than the page does rather than sitting still in the layout.
//-
//- It starts above where CSS parks it and ends below, scrubbed to scroll position. The section
//- clips it (overflow: hidden), which is what keeps the extra travel from spilling out.
//-
//- The arrow already carries a rotate(90deg) from the stylesheet. That survives: GSAP decomposes
//- the existing transform on the first tween and re-applies the rotation alongside its own y, and
//- because it writes translate before rotate, y stays vertical on screen rather than following
//- the rotated axis.

(function () {
    'use strict';

    var SECTION_SELECTOR = '.textured-side-by-side-template';
    var ARROW_SELECTOR = '.texture-arrow';

    //- Half the total travel: the arrow starts this far above its resting spot and ends this far below.
    var DRIFT = 200;

    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function bindSection(section) {
        if (section.dataset.texturedSideBySideInit === 'true') {
            return;
        }
        section.dataset.texturedSideBySideInit = 'true';

        var arrow = section.querySelector(ARROW_SELECTOR);
        if (!arrow || prefersReducedMotion()) {
            return;
        }

        gsap.fromTo(arrow,
            { y: -DRIFT },
            {
                y: DRIFT,
                ease: 'none',
                force3D: true,
                scrollTrigger: {
                    trigger: section,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            }
        );
    }

    function initTexturedSideBySide(root) {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            return;
        }

        var scope = root || document;
        if (!scope.querySelectorAll) {
            return;
        }

        Array.prototype.forEach.call(scope.querySelectorAll(SECTION_SELECTOR), bindSection);
    }

    window.initTexturedSideBySide = initTexturedSideBySide;

    document.addEventListener('DOMContentLoaded', function () {
        initTexturedSideBySide();

        document.body.addEventListener('htmx:afterSwap', function (e) {
            initTexturedSideBySide(e.target);
        });
    });

    if (window.Sys && Sys.WebForms && Sys.WebForms.PageRequestManager) {
        Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function () {
            initTexturedSideBySide();
        });
    }
})();
