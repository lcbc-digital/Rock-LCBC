//- Fills the metric bars and counts their figures up when the row is scrolled to.
//-
//- Both halves run off one number. --metric-percent is what the stylesheet already reads for the width
//- of the fill and the position of the marker, so tweening that property animates the bar and the line
//- at its head together, and nothing here has to know how either is drawn.
//-
//- Bound to the group rather than to each bar, so a module swapped in later by htmx or a postback needs
//- no rebinding.

(function () {
    'use strict';

    // Every display type, because every one of them is filled the same way: off --metric-percent, which
    // the stylesheet turns into a width for the bar and a dash offset for the two dials. The card has no
    // gauge and simply has nothing to fill, which falls out of its percentage being zero.
    var GROUP_SELECTOR = '.js-metrics';
    var METRIC_SELECTOR = '.metric';
    var VALUE_SELECTOR = '.metric-value[data-metric-count]';

    var DEFAULT_DURATION = 1.4;
    var DEFAULT_STAGGER = 0.15;

    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function isBarGroup(group) {
        return group.classList.contains('metrics-bar');
    }

    function computeBarThreshold(metric) {
        var bar = metric.querySelector('.metric-bar');
        var content = metric.querySelector('.metric-bar-content');
        if (!bar || !content) {
            return 0;
        }
        var barRect = bar.getBoundingClientRect();
        if (barRect.width === 0) {
            return 0;
        }
        var rightmost = barRect.left;
        Array.prototype.forEach.call(content.children, function (child) {
            var r = child.getBoundingClientRect().right;
            if (r > rightmost) {
                rightmost = r;
            }
        });
        // Add the content's right padding so the text isn't clipped right at the edge
        return Math.min(100, Math.max(0, (rightmost + 16 - barRect.left) / barRect.width * 100));
    }

    function applyBarLow(metric) {
        var pct = parseFloat(getComputedStyle(metric).getPropertyValue('--metric-percent')) || 0;
        metric.classList.toggle('is-bar-low', pct < (metric._metricThreshold || 0));
    }

    // Matched to MetricNumber.lava's five formats. Only ever used for the numbers passed through on the
    // way up: the figure that ends up on screen is the one Lava printed, restored when the tween lands,
    // so a disagreement between the two shows as nothing at all rather than as a jump on the last frame.
    function formatterFor(format) {
        switch (format) {
            case 'currency':
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
            case 'compact':
                return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
            case 'currency-compact':
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
            default:
                return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
        }
    }

    function countUp(timeline, valueElement, duration, position) {
        var target = parseFloat(valueElement.dataset.metricCount);
        if (isNaN(target)) {
            return;
        }

        var format = valueElement.dataset.metricFormat || 'number';
        var formatter = formatterFor(format);
        var suffix = format === 'percent' ? '%' : '';
        var printed = valueElement.textContent;
        var counter = { value: 0 };

        valueElement.textContent = formatter.format(0) + suffix;

        timeline.to(counter, {
            value: target,
            duration: duration,
            ease: 'power2.out',
            onUpdate: function () {
                valueElement.textContent = formatter.format(counter.value) + suffix;
            },
            onComplete: function () {
                valueElement.textContent = printed;
            }
        }, position);
    }

    function play(group) {
        var metrics = Array.prototype.slice.call(group.querySelectorAll(METRIC_SELECTOR));
        if (!metrics.length) {
            return;
        }

        var duration = (parseFloat(group.dataset.metricDuration) / 1000) || DEFAULT_DURATION;
        var stagger = (parseFloat(group.dataset.metricStagger) / 1000) || DEFAULT_STAGGER;
        var bar = isBarGroup(group);

        var timeline = gsap.timeline();

        metrics.forEach(function (metric, index) {
            var position = index * stagger;

            // Read when the group was bound, before the gauges were emptied. Reading it now would find
            // the zero this script put there and animate every one of them to nothing.
            var target = metric._metricTarget || 0;

            // A metric with no goal has nothing to fill -- a card always, and any other type where the
            // goal was left blank. Tweening zero to zero would only cost a frame.
            if (target > 0) {
                var toVars = { '--metric-percent': target, duration: duration, ease: 'power2.out' };

                if (bar) {
                    toVars.onUpdate = function () {
                        metric.classList.toggle('is-bar-low', parseFloat(gsap.getProperty(metric, '--metric-percent')) < (metric._metricThreshold || 0));
                    };
                }

                timeline.fromTo(metric, { '--metric-percent': 0 }, toVars, position);
            }

            var valueElement = metric.querySelector(VALUE_SELECTOR);
            if (valueElement) {
                countUp(timeline, valueElement, duration, position);
            }
        });
    }

    function bindGroup(group) {
        if (group.dataset.metricBound) {
            return;
        }
        group.dataset.metricBound = 'true';

        // Compute thresholds and set the initial is-bar-low state before touching anything else,
        // so the reduced-motion early return below still leaves the text in a readable color.
        if (isBarGroup(group)) {
            Array.prototype.forEach.call(group.querySelectorAll(METRIC_SELECTOR), function (metric) {
                metric._metricThreshold = computeBarThreshold(metric);
                applyBarLow(metric);
            });

            window.addEventListener('resize', function () {
                Array.prototype.forEach.call(group.querySelectorAll(METRIC_SELECTOR), function (metric) {
                    metric._metricThreshold = computeBarThreshold(metric);
                    applyBarLow(metric);
                });
            });
        }

        // Nothing to animate towards: the bars are already full and the figures already printed.
        if (prefersReducedMotion()) {
            return;
        }

        // Emptied here rather than in the stylesheet, so a browser with no JavaScript, or one that
        // fails to reach this file, is left with bars that are filled in correctly. Each bar's real
        // figure is taken first, since zeroing it is what destroys the only record of it.
        Array.prototype.forEach.call(group.querySelectorAll(METRIC_SELECTOR), function (metric) {
            metric._metricTarget = parseFloat(getComputedStyle(metric).getPropertyValue('--metric-percent')) || 0;
            metric.style.setProperty('--metric-percent', '0');
            if (isBarGroup(group)) {
                metric.classList.add('is-bar-low');
            }
        });

        ScrollTrigger.create({
            trigger: group,
            start: 'top 85%',
            once: true,
            onEnter: function () {
                play(group);
            }
        });
    }

    function initMetrics(root) {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            return;
        }

        var scope = root || document;
        if (!scope.querySelectorAll) {
            return;
        }

        Array.prototype.forEach.call(scope.querySelectorAll(GROUP_SELECTOR), bindGroup);
    }

    window.initMetrics = initMetrics;

    document.addEventListener('DOMContentLoaded', function () {
        initMetrics();

        document.body.addEventListener('htmx:afterSwap', function (e) {
            initMetrics(e.target);
        });
    });

    if (window.Sys && Sys.WebForms && Sys.WebForms.PageRequestManager) {
        Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function () {
            initMetrics();
        });
    }
})();
