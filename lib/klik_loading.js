// Klik Loading — boot & data progress overlay.
//
// Phase 1: KlikApp loads ~85 JS modules one at a time before it even checks
//          you're logged in. We hook into that loader for a real percentage.
// Phase 2: once modules are loaded, the login prompt(s) appear, then the
//          app fetches event data. We track that via klik_loading_begin()/
//          klik_loading_end(), called directly from klik_http_requests.js.

var KlikLoading = {
    el: null,
    bar: null,
    label: null,
    pending: 0,
    hideTimer: null,
    failSafe: null,
    bootDone: false, // once the initial load has finished, this overlay
                      // never shows again for this page — later background
                      // refreshes (e.g. Monitor's auto-poll) stay silent

    init: function() {
        this.el = document.getElementById('klik_loading_overlay');
        this.bar = document.getElementById('klik_loading_bar');
        this.label = document.getElementById('klik_loading_label');

        // never block the app forever, even if something above goes wrong
        var self = this;
        this.failSafe = setTimeout(function() {
            self.hide();
            self.bootDone = true;
        }, 30000);
    },

    setProgress: function(fraction) {
        if (this.bar) {
            var pct = Math.max(4, Math.min(100, Math.round(fraction * 100)));
            this.bar.style.width = pct + '%';
        }
    },

    setLabel: function(text) {
        if (this.label) {
            this.label.textContent = text;
        }
    },

    show: function() {
        if (this.el) {
            this.el.classList.remove('klik_loading_hidden');
        }
    },

    hide: function() {
        if (this.el) {
            this.el.classList.add('klik_loading_hidden');
        }
        if (this.failSafe) {
            clearTimeout(this.failSafe);
            this.failSafe = null;
        }
    },

    // called from klik_http_requests.js around every network call
    begin: function(label) {
        if (this.bootDone) { return; } // don't resurface for background polling
        if (label) { this.setLabel(label); }
        this.pending++;
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
        this.show();
    },

    end: function() {
        if (this.bootDone) { return; }
        this.pending = Math.max(0, this.pending - 1);
        if (this.pending === 0) {
            var self = this;
            // debounce: initial login is often followed a beat later by one
            // or two more fetches, so wait for a real quiet period before
            // declaring the boot sequence finished (and disabling for good)
            this.hideTimer = setTimeout(function() {
                self.hide();
                self.bootDone = true;
            }, 1500);
        }
    }
};

function klik_loading_begin(label) { KlikLoading.begin(label); }
function klik_loading_end() { KlikLoading.end(); }


// --- local cache for event data (namespace-keyed) -----------------------
// Used by klik_http_get: paints instantly from the last successful fetch
// for a given namespace/event/env, while the real network request is still
// in flight. The fresh result always overwrites it once it arrives — this
// is purely about not showing a blank screen while waiting, never about
// showing stale data instead of fresh.

function klik_cache_key(namespace) {
    if (!namespace) { return null; }
    try {
        var event = (typeof app !== 'undefined' && app.api) ? app.api.event : '';
        var env   = (typeof app !== 'undefined' && app.api) ? app.api.env   : '';
        return 'klik_data_cache:' + env + ':' + event + ':' + namespace;
    }
    catch (e) {
        return null;
    }
}

function klik_cache_get(key) {
    try {
        var raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    }
    catch (e) {
        return null;
    }
}

function klik_cache_set(key, value) {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    }
    catch (e) {
        // storage full/unavailable — caching is a nice-to-have, fail silently
    }
}

document.addEventListener('DOMContentLoaded', function() {
    KlikLoading.init();
});


// --- hook into KlikApp's sequential module loader for real progress ---
(function() {
    var watch = setInterval(function() {
        if (!(window.KlikApp && KlikApp.prototype && KlikApp.prototype.loaded_script)) {
            return;
        }
        clearInterval(watch);

        var original_loaded_script = KlikApp.prototype.loaded_script;
        KlikApp.prototype.loaded_script = function(node) {
            original_loaded_script.call(this, node);
            if (this.scripts) {
                KlikLoading.setProgress(this.scripts.index / this.scripts.files.length);
                KlikLoading.setLabel('Starting up (' + this.scripts.index + '/' + this.scripts.files.length + ')');
            }
        };

        var original_loaded_all_scripts = KlikApp.prototype.loaded_all_scripts;
        KlikApp.prototype.loaded_all_scripts = function() {
            KlikLoading.setProgress(1);
            KlikLoading.setLabel('Preparing session\u2026');

            // klik_ui.js has loaded by now, so klik_prompt() exists — wrap it
            // once, so the overlay reflects what's actually happening behind
            // the native login dialog rather than looking stuck.
            if (window.klik_prompt && !window.klik_prompt._klik_loading_wrapped) {
                var original_prompt = window.klik_prompt;
                var wrapped_prompt = function(msg, is_password) {
                    KlikLoading.setLabel(is_password ? 'Waiting for password\u2026' : 'Waiting for login\u2026');
                    return original_prompt(msg, is_password);
                };
                wrapped_prompt._klik_loading_wrapped = true;
                window.klik_prompt = wrapped_prompt;
            }

            original_loaded_all_scripts.call(this);
        };
    }, 20);
})();
