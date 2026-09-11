// by JSR <jsr@pixmob.com>


KlikRssi = function(options=null) {
    KlikModule.call(this); // call super constructor

    // set some defaults
    this.label = 'rssi';
    this.min = 0;
    this.max = 120;
    this.value = 120;
    this.title = 'RSSI';

    // you can overwrite the defaults
    for (k in options) {
        this[k] = options[k];
    }

    this.sections = [];
 
    this.navigation = [
        { title:this.title, content:[]},
    ];

    // define handlers
    var self = this;
    this.callbacks = {
        oninput : function(event) {
            var val = event.target.valueAsNumber;
            if (val!=self.value) {
                self.value = val;
                if (self.on_rssi_change) {
                    self.on_rssi_change(val);
                }
            }
        }
    }

    // init ui
    this.sections = tech.append_navigation(this.navigation);

    var styles = {
        button:'width:100px', 
        number:'width:100px',
        slider:'width:calc(100% - 208px);', 
    }

    klik_ui_slider(this.sections[0], this.uid, this.label, [this.min, this.max], this.value, this.callbacks, styles);     

    // set value, no callbacks
    this.set_value = function(value) {
        self.value = value;
 
        klik_ui_slider_set_value(this.uid, self.value);
    }

    // console.log(by_id('ui_button_'+this.uid));
    // console.log(by_id('ui_number_'+this.uid));
    // console.log(by_id('ui_slider_'+this.uid));
}

KlikRssi.prototype = Object.create(KlikModule.prototype);
KlikRssi.prototype.constructor = KlikRssi;
