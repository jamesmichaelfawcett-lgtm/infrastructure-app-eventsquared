// by JSR <jsr@pixmob.com>


KlikPriority = function(options=null) {
    KlikModule.call(this); // call super constructor

    this.label = 'priority';

    for (k in options) {
        this[k] = options[k];
    }

    this.navigation = [
        { title:'Priority', content:[
            { _t:'tab', _l:'OFF'},
            { _t:'tab', _l:'GPS'},
            { _t:'tab', _l:'MOB'},
            // { _t:'tab', _l:'DMX'},
            // { _t:'tab', _l:'EMX'},
            // { _t:'tab', _l:'EPR'},
            { _t:'tab', _l:'BRO'}, //, _c:'selected'},
        ]},
    ];

    klik_ui_adjust_navigation(this.navigation, this.uid);

    // define handlers
    var self = this;
    this.callbacks = {
        onmouseup: function(event) {
            self.value = event.target.innerText;
            if (self.on_priority_change) {
                self.on_priority_change(self.value);
            }
        }
    }

    // set value, no callbacks
    this.set_value = function(value) {
        self.value = value;
        klik_ui_tab_select(self.sections[0], self.value);
    }
    
    // init ui
    this.sections = tech.append_navigation(this.navigation, this.callbacks);
}

KlikPriority.prototype = Object.create(KlikModule.prototype);
KlikPriority.prototype.constructor = KlikPriority;
