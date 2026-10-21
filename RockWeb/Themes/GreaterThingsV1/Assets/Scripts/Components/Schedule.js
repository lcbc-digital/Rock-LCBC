//- Day switching for the schedule template.
//-
//- The tabs follow the ARIA tabs pattern: one tab is in the tab order at a time, and the arrow keys
//- move between them. That is what a screen reader announces a tablist as, so anything less would
//- describe a control that does not behave the way it was announced.
//-
//- Bound to the group rather than to each tab, so a schedule swapped in later by htmx or a postback
//- needs no rebinding.

(function () {
    'use strict';

    var GROUP_SELECTOR = '.js-schedule';
    var TAB_SELECTOR = '.js-schedule-tab';
    var PANEL_SELECTOR = '.js-schedule-day';
    var SELECT_SELECTOR = '.js-schedule-select';
    var ROW_SELECTOR = '.schedule-session';
    var PANELS_SELECTOR = '.schedule-panels';

    //- Days are rendered in date order, so a higher index is a later day. Later travels the way
    //- reading does: the old rows leave to the left and the new ones arrive from the right. Flip the
    //- sign of SLIDE_DISTANCE to reverse both at once.
    var SLIDE_DISTANCE = 48;
    var EXIT_DURATION = 0.2;
    var EXIT_STAGGER = 0.03;
    var ENTER_DURATION = 0.35;
    var ENTER_STAGGER = 0.05;

    function tabsIn(group) {
        return Array.prototype.slice.call(group.querySelectorAll(TAB_SELECTOR));
    }

    function panelsIn(group) {
        return Array.prototype.slice.call(group.querySelectorAll(PANEL_SELECTOR));
    }

    function rowsIn(panel) {
        return Array.prototype.slice.call(panel.querySelectorAll(ROW_SELECTOR));
    }

    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // The strip and the select are two faces of one choice, so whichever was used, the other is
    // brought into line. Otherwise rotating a phone mid-read shows a control disagreeing with the
    // day on screen.
    function syncSelect(group, tab, index) {
        var select = group.querySelector(SELECT_SELECTOR);
        if (select && select.selectedIndex !== index) {
            select.selectedIndex = index;
        }

        var date = group.querySelector('.js-schedule-select-date');
        var day = group.querySelector('.js-schedule-select-day');

        if (date) {
            date.textContent = tab.dataset.date || '';
        }
        if (day) {
            day.textContent = tab.dataset.day || '';
        }
    }

    function showPanel(panels, index) {
        panels.forEach(function (panel, panelIndex) {
            panel.classList.toggle('active', panelIndex === index);
        });
    }

    function activeIndex(panels) {
        for (var i = 0; i < panels.length; i++) {
            if (panels[i].classList.contains('active')) {
                return i;
            }
        }
        return -1;
    }

    function swapPanels(group, index) {
        var panels = panelsIn(group);
        var from = activeIndex(panels);

        if (from === index || !panels[index]) {
            return;
        }

        if (!window.gsap || from === -1 || prefersReducedMotion()) {
            showPanel(panels, index);
            return;
        }

        var panelsBox = group.querySelector(PANELS_SELECTOR);
        var outgoing = rowsIn(panels[from]);
        var incoming = rowsIn(panels[index]);

        var exitX = index > from ? -SLIDE_DISTANCE : SLIDE_DISTANCE;
        var enterX = -exitX;

        if (group.scheduleTimeline) {
            group.scheduleTimeline.kill();
        }
        gsap.killTweensOf(outgoing.concat(incoming));
        gsap.set(panels[from].querySelectorAll(ROW_SELECTOR), { clearProps: 'opacity,transform' });

        if (panelsBox) {
            gsap.killTweensOf(panelsBox);
            gsap.set(panelsBox, { clearProps: 'height,overflow' });
        }

        var timeline = gsap.timeline({
            onComplete: function () {
                group.scheduleTimeline = null;

                if (window.ScrollTrigger) {
                    ScrollTrigger.refresh();
                }
            }
        });
        group.scheduleTimeline = timeline;

        if (outgoing.length) {
            timeline.to(outgoing, {
                opacity: 0,
                x: exitX,
                duration: EXIT_DURATION,
                ease: 'power2.in',
                stagger: EXIT_STAGGER,
                force3D: true
            });
        }

        timeline.add(function () {
            var fromHeight = panelsBox ? panelsBox.offsetHeight : 0;

            gsap.set(incoming, { opacity: 0, x: enterX });
            showPanel(panels, index);
            gsap.set(outgoing, { clearProps: 'opacity,transform' });

            if (!panelsBox) {
                return;
            }

            var toHeight = panelsBox.offsetHeight;
            if (toHeight === fromHeight) {
                return;
            }

            gsap.fromTo(panelsBox,
                { height: fromHeight, overflow: 'hidden' },
                {
                    height: toHeight,
                    duration: ENTER_DURATION,
                    ease: 'power2.out',
                    clearProps: 'height,overflow'
                }
            );
        });

        timeline.to(incoming, {
            opacity: 1,
            x: 0,
            duration: ENTER_DURATION,
            ease: 'power2.out',
            stagger: ENTER_STAGGER,
            force3D: true,
            clearProps: 'transform'
        });
    }

    function updateTabsOverflow(tabsEl) {
        if (!tabsEl) {
            return;
        }
        var scrollLeft = tabsEl.scrollLeft;
        var maxScroll = tabsEl.scrollWidth - tabsEl.clientWidth;
        tabsEl.classList.toggle('is-overflow-left', scrollLeft > 2);
        tabsEl.classList.toggle('is-overflow-right', maxScroll > 2 && scrollLeft < maxScroll - 2);
    }

    function scrollTabIntoView(tabsEl, tab) {
        if (!tabsEl || !tab) {
            return;
        }
        var containerRect = tabsEl.getBoundingClientRect();
        var tabRect = tab.getBoundingClientRect();
        var relLeft = tabRect.left - containerRect.left;
        var relRight = tabRect.right - containerRect.left;

        if (relLeft < 0) {
            tabsEl.scrollLeft += relLeft - 32;
        } else if (relRight > containerRect.width) {
            tabsEl.scrollLeft += relRight - containerRect.width + 32;
        }

        updateTabsOverflow(tabsEl);
    }

    function selectTab(group, tab, moveFocus) {
        var tabs = tabsIn(group);
        var index = tabs.indexOf(tab);
        if (index === -1) {
            return;
        }

        tabs.forEach(function (other, otherIndex) {
            var isSelected = otherIndex === index;
            other.classList.toggle('active', isSelected);
            other.setAttribute('aria-selected', isSelected ? 'true' : 'false');

            other.setAttribute('tabindex', isSelected ? '0' : '-1');
        });

        swapPanels(group, index);

        syncSelect(group, tab, index);

        scrollTabIntoView(group.querySelector('.js-schedule-tabs'), tab);

        if (moveFocus) {
            tab.focus();
        }
    }

    function bindGroup(group) {
        if (group.dataset.scheduleBound) {
            return;
        }
        group.dataset.scheduleBound = 'true';

        var tabsEl = group.querySelector('.js-schedule-tabs');
        if (tabsEl) {
            tabsEl.addEventListener('scroll', function () {
                updateTabsOverflow(tabsEl);
            });
            updateTabsOverflow(tabsEl);
            window.addEventListener('resize', function () {
                updateTabsOverflow(tabsEl);
            });

            var isDragging = false;
            var hasDragged = false;
            var dragStartX = 0;
            var dragScrollLeft = 0;

            tabsEl.addEventListener('mousedown', function (e) {
                isDragging = true;
                hasDragged = false;
                dragStartX = e.clientX;
                dragScrollLeft = tabsEl.scrollLeft;
                tabsEl.classList.add('is-dragging');
            });

            tabsEl.addEventListener('mousemove', function (e) {
                if (!isDragging) {
                    return;
                }
                var walk = e.clientX - dragStartX;
                if (Math.abs(walk) > 4) {
                    hasDragged = true;
                    e.preventDefault();
                }
                tabsEl.scrollLeft = dragScrollLeft - walk;
                updateTabsOverflow(tabsEl);
            });

            function endDrag() {
                isDragging = false;
                tabsEl.classList.remove('is-dragging');
            }

            tabsEl.addEventListener('mouseup', endDrag);
            tabsEl.addEventListener('mouseleave', endDrag);

            //- Suppress click on the tab strip if the mouse moved during mousedown, so releasing
            //- a drag does not accidentally switch to whatever tab is under the cursor.
            tabsEl.addEventListener('click', function (e) {
                if (hasDragged) {
                    e.stopPropagation();
                    e.preventDefault();
                    hasDragged = false;
                }
            }, true);
        }

        group.addEventListener('click', function (e) {
            var tab = e.target.closest(TAB_SELECTOR);
            if (tab && group.contains(tab)) {
                selectTab(group, tab, false);
            }
        });

        group.addEventListener('change', function (e) {
            if (!e.target.matches(SELECT_SELECTOR)) {
                return;
            }

            var tab = tabsIn(group)[e.target.selectedIndex];
            if (tab) {
                selectTab(group, tab, false);
            }
        });

        group.addEventListener('keydown', function (e) {
            var tab = e.target.closest(TAB_SELECTOR);
            if (!tab || !group.contains(tab)) {
                return;
            }

            var tabs = tabsIn(group);
            var index = tabs.indexOf(tab);
            var target = null;

            if (e.key === 'ArrowRight') {
                target = tabs[(index + 1) % tabs.length];
            } else if (e.key === 'ArrowLeft') {
                target = tabs[(index - 1 + tabs.length) % tabs.length];
            } else if (e.key === 'Home') {
                target = tabs[0];
            } else if (e.key === 'End') {
                target = tabs[tabs.length - 1];
            }

            if (target) {
                // Arrow keys scroll the page by default, and the strip is horizontally scrollable.
                e.preventDefault();
                selectTab(group, target, true);
            }
        });
    }

    function initSchedules(root) {
        var scope = root || document;
        if (!scope.querySelectorAll) {
            return;
        }

        Array.prototype.forEach.call(scope.querySelectorAll(GROUP_SELECTOR), function (group) {
            bindGroup(group);

            // The display spans are rendered empty, since which day is open is decided here.
            var open = group.querySelector(TAB_SELECTOR + '.active') || group.querySelector(TAB_SELECTOR);
            if (open) {
                syncSelect(group, open, tabsIn(group).indexOf(open));
            }
        });
    }

    window.initSchedules = initSchedules;

    document.addEventListener('DOMContentLoaded', function () {
        initSchedules();

        document.body.addEventListener('htmx:afterSwap', function (e) {
            initSchedules(e.target);
        });
    });

    if (window.Sys && Sys.WebForms && Sys.WebForms.PageRequestManager) {
        Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function () {
            initSchedules();
        });
    }
})();
