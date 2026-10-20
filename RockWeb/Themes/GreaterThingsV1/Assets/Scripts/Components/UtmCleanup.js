//- Takes utm_ parameters back off the address bar once the page has loaded.
//-
//- Safe because Rock has already read them server side and written the interaction before a byte
//- reached the browser. replaceState, not pushState, so Back returns to where the visitor came from.
//- Not deferred: every moment it waits is a moment the tagged address can be copied.

(function () {
    'use strict';

    if (!window.history || !history.replaceState || typeof URL !== 'function') {
        return;
    }

    var address;

    try {
        address = new URL(window.location.href);
    } catch (error) {
        return;
    }

    // Snapshotted: deleting while walking searchParams' own iterator skips entries.
    var names = [];

    address.searchParams.forEach(function (value, name) {
        if (name.toLowerCase().indexOf('utm_') === 0) {
            names.push(name);
        }
    });

    if (!names.length) {
        return;
    }

    names.forEach(function (name) {
        address.searchParams.delete(name);
    });

    history.replaceState(history.state, '', address.pathname + address.search + address.hash);
})();
