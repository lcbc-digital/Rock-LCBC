//- Fades an intro block in when it is scrolled to, offset against its own alignment: left aligned
//- content arrives from the left, right aligned from the right, centered from below.
//-
//- Not TT-Cascade, for one reason: it tweens autoAlpha to 1, and .description rests at 0.8. Running
//- it here would leave every description brighter than designed. Each element's resting opacity is
//- read off computed style instead and used as the tween's end value.
//-
//- Reading that resting value is also why the guard class sits on the .intro-content wrapper rather
//- than on the elements themselves -- the wrapper hides the block before paint, while each child is
//- still reporting its own real opacity to read back.

(function () {
    'use strict';

    //- [data-intro-fade] opts a block that is not an .intro-content into the same treatment,
    //- as long as its pieces carry the same .label / .title / .description class names.
    //- Give it a value -- left, right or up -- where the block's own alignment is not the
    //- direction it should arrive from, as with a column whose copy is left aligned but which
    //- sits on the right of a side by side. [data-intro-fade-item] opts in anything else.
    var BLOCK_SELECTOR = '.intro-content, [data-intro-fade]';
    var ITEM_SELECTOR = '.label, .title, .description, .button-group, [data-intro-fade-item]';

    var DISTANCE = 24;
    var DURATION = 0.7;
    var STAGGER = 0.1;

    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    //- An explicit data-intro-fade value wins; otherwise this mirrors the alignment classes
    //- IntroContent.lava writes. Split has no alignment class of its own -- both its columns are
    //- left aligned -- so it falls through to the left aligned offset.
    function getOffset(block) {
        var declared = block.getAttribute('data-intro-fade');

        if (declared === 'up' || block.classList.contains('text-center')) {
            return { y: DISTANCE };
        }
        if (declared === 'right' || block.classList.contains('text-right')) {
            return { x: DISTANCE };
        }
        return { x: -DISTANCE };
    }

    function getRestingOpacity(element) {
        var value = parseFloat(window.getComputedStyle(element).opacity);
        return isNaN(value) ? 1 : value;
    }

    function bindBlock(block) {
        if (block.dataset.introContentInit === 'true') {
            return;
        }
        block.dataset.introContentInit = 'true';

        var items = Array.prototype.slice.call(block.querySelectorAll(ITEM_SELECTOR));
        if (!items.length) {
            gsap.set(block, { autoAlpha: 1 });
            return;
        }

        if (prefersReducedMotion()) {
            gsap.set(block, { autoAlpha: 1 });
            return;
        }

        var offset = getOffset(block);

        var states = items.map(function (item) {
            return { item: item, opacity: getRestingOpacity(item) };
        });

        states.forEach(function (state) {
            gsap.set(state.item, { opacity: 0, x: offset.x || 0, y: offset.y || 0 });
        });
        gsap.set(block, { autoAlpha: 1 });

        ScrollTrigger.create({
            trigger: block,
            start: 'top 85%',
            once: true,
            onEnter: function () {
                var timeline = gsap.timeline({
                    defaults: { ease: 'power2.out', force3D: true, duration: DURATION }
                });

                states.forEach(function (state, index) {
                    timeline.to(state.item, {
                        opacity: state.opacity,
                        x: 0,
                        y: 0
                    }, index * STAGGER);
                });
            }
        });
    }

    function initIntroContent(root) {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            return;
        }

        var scope = root || document;
        if (!scope.querySelectorAll) {
            return;
        }

        Array.prototype.forEach.call(scope.querySelectorAll(BLOCK_SELECTOR), bindBlock);
    }

    window.initIntroContent = initIntroContent;

    document.addEventListener('DOMContentLoaded', function () {
        initIntroContent();

        document.body.addEventListener('htmx:afterSwap', function (e) {
            initIntroContent(e.target);
        });
    });

    if (window.Sys && Sys.WebForms && Sys.WebForms.PageRequestManager) {
        Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function () {
            initIntroContent();
        });
    }
})();
