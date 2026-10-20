//- Fades the pull quote up one wrapped line at a time when the section is scrolled to, then the buttons.
//-
//- There is no element per visual line to animate -- where the quote breaks is a layout result, not
//- markup -- so the text is split into words and the words are grouped by their measured top offset.
//- Words sharing a top are on the same line, and each group is tweened as one.
//-
//- That measurement is why this waits on document.fonts: the quote renders at display size in a custom
//- face, so measuring before the font swaps in groups the words against the fallback's line breaks.
//-
//- The quote's markup is not flat: RegExReplace wraps the **marked** terms in .highlighted-text spans
//- before this ever sees it. So the split walks the tree and only rewrites text nodes, leaving those
//- spans (and their color) in place around the words it generates.
//-
//- Whitespace between words stays a plain text node and the words themselves are inline-block, which
//- is what keeps the quote wrapping normally once every word is its own element.

(function () {
    'use strict';

    var SECTION_SELECTOR = '.text-highlight-template';
    var TEXT_SELECTOR = '.text';
    var BUTTONS_SELECTOR = '.button-group';

    var LINE_DISTANCE = 16;
    var LINE_DURATION = 0.6;
    var LINE_STAGGER = 0.12;
    var BUTTON_DURATION = 0.6;

    //- Subpixel slack, so two words on the same line whose rects differ by a fraction still group.
    var SAME_LINE_TOLERANCE = 4;

    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function whenFontsReady(callback) {
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(callback);
            return;
        }
        callback();
    }

    function splitWords(root) {
        var words = [];

        function walk(node) {
            Array.prototype.slice.call(node.childNodes).forEach(function (child) {
                if (child.nodeType === 1) {
                    walk(child);
                    return;
                }

                if (child.nodeType !== 3 || !child.textContent) {
                    return;
                }

                var fragment = document.createDocumentFragment();

                child.textContent.split(/(\s+)/).forEach(function (chunk) {
                    if (!chunk) {
                        return;
                    }

                    if (/^\s+$/.test(chunk)) {
                        fragment.appendChild(document.createTextNode(chunk));
                        return;
                    }

                    var wordSpan = document.createElement('span');
                    wordSpan.style.display = 'inline-block';
                    wordSpan.textContent = chunk;
                    fragment.appendChild(wordSpan);
                    words.push(wordSpan);
                });

                node.replaceChild(fragment, child);
            });
        }

        walk(root);
        return words;
    }

    function groupIntoLines(words) {
        var lines = [];
        var currentLine = null;
        var currentTop = null;

        words.forEach(function (word) {
            var top = word.getBoundingClientRect().top;

            if (currentLine === null || Math.abs(top - currentTop) > SAME_LINE_TOLERANCE) {
                currentLine = [];
                currentTop = top;
                lines.push(currentLine);
            }

            currentLine.push(word);
        });

        return lines;
    }

    function bindSection(section) {
        if (section.dataset.textHighlightInit === 'true') {
            return;
        }
        section.dataset.textHighlightInit = 'true';

        var text = section.querySelector(TEXT_SELECTOR);
        if (!text) {
            return;
        }

        var buttons = section.querySelector(BUTTONS_SELECTOR);

        if (prefersReducedMotion()) {
            gsap.set(text, { autoAlpha: 1 });
            return;
        }

        var words = splitWords(text);
        if (!words.length) {
            return;
        }

        whenFontsReady(function () {
            //- Grouped before anything is offset, so the tops being read are the resting ones.
            var lines = groupIntoLines(words);

            //- The lines carry the fade, so the paragraph itself is revealed up front.
            gsap.set(words, { autoAlpha: 0, y: LINE_DISTANCE });
            gsap.set(text, { autoAlpha: 1 });
            if (buttons) {
                gsap.set(buttons, { autoAlpha: 0 });
            }

            ScrollTrigger.create({
                trigger: section,
                start: 'top 75%',
                once: true,
                onEnter: function () {
                    var timeline = gsap.timeline({
                        defaults: { ease: 'power2.out', force3D: true }
                    });

                    lines.forEach(function (line, index) {
                        timeline.to(line, {
                            autoAlpha: 1,
                            y: 0,
                            duration: LINE_DURATION
                        }, index * LINE_STAGGER);
                    });

                    if (buttons) {
                        timeline.to(buttons, {
                            autoAlpha: 1,
                            duration: BUTTON_DURATION
                        }, '-=0.25');
                    }
                }
            });
        });
    }

    function initTextHighlights(root) {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            return;
        }

        var scope = root || document;
        if (!scope.querySelectorAll) {
            return;
        }

        Array.prototype.forEach.call(scope.querySelectorAll(SECTION_SELECTOR), bindSection);
    }

    window.initTextHighlights = initTextHighlights;

    document.addEventListener('DOMContentLoaded', function () {
        initTextHighlights();

        document.body.addEventListener('htmx:afterSwap', function (e) {
            initTextHighlights(e.target);
        });
    });

    if (window.Sys && Sys.WebForms && Sys.WebForms.PageRequestManager) {
        Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function () {
            initTextHighlights();
        });
    }
})();
