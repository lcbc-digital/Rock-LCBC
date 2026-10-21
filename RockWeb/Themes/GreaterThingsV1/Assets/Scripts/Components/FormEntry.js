//- Moves a form card's corner glow to follow the cursor, and eases it back to the bottom
//- right corner it rests in when the cursor leaves.
//-
//- The glow is a background layer on the card, so this only writes two custom properties and the
//- stylesheet does the drawing. Custom properties inside a gradient cannot be transitioned unless
//- they are registered with @property, so the easing is done here per frame instead.
//-
//- The loop is only alive while the glow is still catching up. It stops itself once it has, so a
//- card sitting idle under a still cursor costs nothing.

(function () {
    'use strict';

    var SELECTOR = '.form-entry, .workflow-entry';

    //- Fraction of the remaining distance covered each frame. Higher is snappier.
    var EASE = 0.12;
    var SETTLED = 0.1;

    //- Matches the resting values in _form-entry.scss.
    var REST_X = 100;
    var REST_Y = 100;

    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function bindCard(card) {
        if (card.dataset.formEntryGlowInit === 'true') {
            return;
        }
        card.dataset.formEntryGlowInit = 'true';

        var targetX = REST_X;
        var targetY = REST_Y;
        var currentX = REST_X;
        var currentY = REST_Y;
        var frame = null;

        function draw() {
            currentX += (targetX - currentX) * EASE;
            currentY += (targetY - currentY) * EASE;

            card.style.setProperty('--form-entry-glow-x', currentX.toFixed(2) + '%');
            card.style.setProperty('--form-entry-glow-y', currentY.toFixed(2) + '%');

            if (Math.abs(targetX - currentX) < SETTLED && Math.abs(targetY - currentY) < SETTLED) {
                frame = null;
                return;
            }

            frame = window.requestAnimationFrame(draw);
        }

        function run() {
            if (frame === null) {
                frame = window.requestAnimationFrame(draw);
            }
        }

        card.addEventListener('pointermove', function (e) {
            //- Mouse only. A touch drag would otherwise fling the glow across the card mid scroll.
            if (e.pointerType !== 'mouse') {
                return;
            }

            var rect = card.getBoundingClientRect();
            if (!rect.width || !rect.height) {
                return;
            }

            targetX = ((e.clientX - rect.left) / rect.width) * 100;
            targetY = ((e.clientY - rect.top) / rect.height) * 100;
            run();
        });

        card.addEventListener('pointerleave', function () {
            targetX = REST_X;
            targetY = REST_Y;
            run();
        });
    }

    function initFormEntry(root) {
        if (prefersReducedMotion()) {
            return;
        }

        var scope = root || document;
        if (!scope.querySelectorAll) {
            return;
        }

        Array.prototype.forEach.call(scope.querySelectorAll(SELECTOR), bindCard);
    }

    window.initFormEntry = initFormEntry;

    document.addEventListener('DOMContentLoaded', function () {
        initFormEntry();

        document.body.addEventListener('htmx:afterSwap', function (e) {
            initFormEntry(e.target);
        });
    });

    //- The workflow block rebuilds itself on every step, so this has to run again after a postback.
    if (window.Sys && Sys.WebForms && Sys.WebForms.PageRequestManager) {
        Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function () {
            initFormEntry();
        });
    }
})();
