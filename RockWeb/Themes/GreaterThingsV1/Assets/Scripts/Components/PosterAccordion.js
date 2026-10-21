//- Opens and closes the tiles in a poster accordion.
//-
//- One poster is open at a time within a group, and clicking the open one closes it. The click
//- handler is bound to the group rather than to each tile, so posters added later by htmx or a
//- postback need no rebinding.
//-
//- The tile carries role="button", so it also has to answer to Enter and Space the way a real button
//- would, and keep aria-expanded in step with the visible state.

(function () {
    'use strict';

    var GROUP_SELECTOR = '.js-poster-accordion';
    var ITEM_SELECTOR = '.js-poster-accordion-item';

    function setPosterState(poster, isOpen) {
        poster.classList.toggle('active', isOpen);
        poster.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    function togglePoster(group, poster) {
        var wasOpen = poster.classList.contains('active');

        Array.prototype.forEach.call(group.querySelectorAll(ITEM_SELECTOR), function (other) {
            setPosterState(other, false);
        });

        setPosterState(poster, !wasOpen);
    }

    function bindGroup(group) {
        if (group.dataset.posterAccordionBound) {
            return;
        }
        group.dataset.posterAccordionBound = 'true';

        group.addEventListener('click', function (e) {
            // Let clicks on links or buttons inside the panel through without closing the poster.
            if (e.target.closest('a, button')) {
                return;
            }

            var poster = e.target.closest(ITEM_SELECTOR);
            if (poster && group.contains(poster)) {
                togglePoster(group, poster);
            }
        });

        group.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') {
                return;
            }

            var poster = e.target.closest(ITEM_SELECTOR);
            if (!poster || !group.contains(poster)) {
                return;
            }

            e.preventDefault();
            togglePoster(group, poster);
        });
    }

    function initPosterAccordions(root) {
        var scope = root || document;
        if (!scope.querySelectorAll) {
            return;
        }

        Array.prototype.forEach.call(scope.querySelectorAll(GROUP_SELECTOR), bindGroup);
    }

    window.initPosterAccordions = initPosterAccordions;

    document.addEventListener('DOMContentLoaded', function () {
        initPosterAccordions();

        document.body.addEventListener('htmx:afterSwap', function (e) {
            initPosterAccordions(e.target);
        });
    });

    if (window.Sys && Sys.WebForms && Sys.WebForms.PageRequestManager) {
        Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function () {
            initPosterAccordions();
        });
    }
})();
