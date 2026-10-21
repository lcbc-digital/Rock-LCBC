//- Scrolls a newly opened accordion item up under the sticky header on mobile.

(function ($) {
    'use strict';

    if (!$) {
        return;
    }

    var SCOPE_SELECTOR = '.panel-group[id^="accordion-"]';
    var PANEL_SELECTOR = '.panel';
    var HEADER_SELECTOR = '#zone-header';

    //- Matches $screen-sm-max in Styles/Sass/Utils/_variables.scss.
    var MOBILE_QUERY = '(max-width: 991px)';

    //- Clear of the sticky header rather than flush against it.
    var HEADER_GAP = 12;

    function scrollPanelIntoView(panel) {
        var header = document.querySelector(HEADER_SELECTOR);
        var headerHeight = header ? header.getBoundingClientRect().height : 0;
        var target = window.pageYOffset + panel.getBoundingClientRect().top - headerHeight - HEADER_GAP;

        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        window.scrollTo({
            top: Math.max(0, target),
            behavior: reduceMotion ? 'auto' : 'smooth'
        });
    }

    $(document).on('shown.bs.collapse', SCOPE_SELECTOR + ' .panel-collapse', function () {
        if (!window.matchMedia(MOBILE_QUERY).matches) {
            return;
        }

        var panel = this.closest(PANEL_SELECTOR);
        if (panel) {
            scrollPanelIntoView(panel);
        }
    });
})(window.jQuery);
