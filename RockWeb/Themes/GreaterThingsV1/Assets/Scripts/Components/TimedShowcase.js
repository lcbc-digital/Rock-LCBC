//- Auto-rotating stack of CTA rows with a circular timer and a crossfading side image. Clicking a
//- row activates it and restarts the cycle from that row. Uses only GSAP core (no DrawSVG) by
//- tweening stroke-dashoffset from the ring's circumference to 0. Rebinds after htmx swaps and
//- ASP.NET postbacks, and respects prefers-reduced-motion.

(function () {
    'use strict';

    var GROUP_SELECTOR = '.js-timed-showcase';
    var ITEM_SELECTOR = '.js-timed-showcase-item';
    var IMAGE_SELECTOR = '.js-timed-showcase-image';
    var PROGRESS_SELECTOR = '.js-timed-showcase-progress';

    var DEFAULT_DURATION = 6000;
    var CIRCUMFERENCE = 282.74;

    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function TimedShowcase(root) {
        this.root = root;
        this.items = Array.prototype.slice.call(root.querySelectorAll(ITEM_SELECTOR));
        this.images = Array.prototype.slice.call(root.querySelectorAll(IMAGE_SELECTOR));
        this.duration = parseInt(root.dataset.duration, 10) || DEFAULT_DURATION;

        this.index = 0;
        this.interval = null;

        this.bindEvents();
        this.activate(0, true);
        if (!prefersReducedMotion) this.start();

        root._timedShowcaseInstance = this;
    }

    TimedShowcase.prototype.bindEvents = function () {
        var self = this;

        this.items.forEach(function (item, i) {
            item.addEventListener('click', function (e) {
                if (e.target.closest('a')) return;
                self.stop();
                self.activate(i);
                if (!prefersReducedMotion) self.start();
            });

            item.addEventListener('keydown', function (e) {
                if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
                if (e.target.closest('a')) return;
                e.preventDefault();
                self.stop();
                self.activate(i);
                if (!prefersReducedMotion) self.start();
            });
        });
    };

    TimedShowcase.prototype.resetTimers = function () {
        this.items.forEach(function (item) {
            var circle = item.querySelector(PROGRESS_SELECTOR);
            if (!circle) return;
            if (window.gsap) {
                gsap.killTweensOf(circle);
                gsap.set(circle, { strokeDashoffset: CIRCUMFERENCE });
            } else {
                circle.style.strokeDashoffset = CIRCUMFERENCE;
            }
        });
    };

    TimedShowcase.prototype.animateTimer = function (item) {
        var circle = item.querySelector(PROGRESS_SELECTOR);
        if (!circle || !window.gsap) return;
        gsap.fromTo(
            circle,
            { strokeDashoffset: CIRCUMFERENCE },
            { strokeDashoffset: 0, duration: this.duration / 1000, ease: 'none' }
        );
    };

    TimedShowcase.prototype.activate = function (i, isInitial) {
        this.resetTimers();

        this.items.forEach(function (item, itemIndex) {
            var isActive = itemIndex === i;
            item.classList.toggle('active', isActive);
            item.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        this.images.forEach(function (image, imageIndex) {
            image.classList.toggle('active', imageIndex === i);
        });

        this.index = i;

        if (!isInitial && !prefersReducedMotion) {
            this.animateTimer(this.items[i]);
        } else if (isInitial && !prefersReducedMotion) {
            this.animateTimer(this.items[i]);
        }
    };

    TimedShowcase.prototype.start = function () {
        var self = this;
        this.interval = setInterval(function () {
            self.activate((self.index + 1) % self.items.length);
        }, this.duration);
    };

    TimedShowcase.prototype.stop = function () {
        clearInterval(this.interval);
        this.items.forEach(function (item) {
            var circle = item.querySelector(PROGRESS_SELECTOR);
            if (circle && window.gsap) gsap.killTweensOf(circle);
        });
    };

    function initTimedShowcases(root) {
        var scope = root || document;
        if (!scope.querySelectorAll) return;

        Array.prototype.forEach.call(scope.querySelectorAll(GROUP_SELECTOR), function (el) {
            if (el.dataset.timedShowcaseInitialized) return;
            el.dataset.timedShowcaseInitialized = 'true';
            new TimedShowcase(el);
        });
    }

    window.initTimedShowcases = initTimedShowcases;

    document.addEventListener('DOMContentLoaded', function () {
        initTimedShowcases();

        document.body.addEventListener('htmx:beforeSwap', function (e) {
            if (!e.target.querySelectorAll) return;
            Array.prototype.forEach.call(e.target.querySelectorAll(GROUP_SELECTOR), function (el) {
                if (el._timedShowcaseInstance) el._timedShowcaseInstance.stop();
            });
        });

        document.body.addEventListener('htmx:afterSwap', function (e) {
            initTimedShowcases(e.target);
        });
    });

    if (window.Sys && Sys.WebForms && Sys.WebForms.PageRequestManager) {
        Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function () {
            initTimedShowcases();
        });
    }
})();
