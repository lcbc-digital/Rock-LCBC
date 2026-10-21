//- Single source of truth for whether a link opens in a new tab.
//-
//- Any anchor pointing at another host gets target="_blank"; everything else is left alone.
//- Relative hrefs resolve against the current page, so the DOM reports the current host for them
//- and they are internal by definition, no parsing required.
//-
//- An explicit target in the markup always wins: the selector skips anchors that already have one.
//- That is the escape hatch when a template needs to force a behavior.

(function () {
    'use strict';

    var IGNORED_PROTOCOLS = ['mailto:', 'tel:', 'sms:', 'javascript:'];

    // Compare registrable domain, not full host, so www/apex/origin subdomains all count as internal.
    function siteDomain(host) {
        return host.split('.').slice(-2).join('.');
    }

    function isExternal(anchor) {
        if (IGNORED_PROTOCOLS.indexOf(anchor.protocol) !== -1) {
            return false;
        }

        return siteDomain(anchor.host) !== siteDomain(window.location.host);
    }

    function applyLinkTargets(root) {
        var scope = root || document;
        var anchors = scope.querySelectorAll('a[href]:not([target])');

        Array.prototype.forEach.call(anchors, function (anchor) {
            if (!isExternal(anchor)) {
                return;
            }

            anchor.setAttribute('target', '_blank');
            anchor.setAttribute('rel', 'noopener noreferrer');
        });
    }

    window.applyLinkTargets = applyLinkTargets;

    document.addEventListener('DOMContentLoaded', function () {
        applyLinkTargets();

        document.body.addEventListener('htmx:afterSwap', function (e) {
            applyLinkTargets(e.target);
        });
    });

    if (window.Sys && Sys.WebForms && Sys.WebForms.PageRequestManager) {
        Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function () {
            applyLinkTargets();
        });
    }
})();
