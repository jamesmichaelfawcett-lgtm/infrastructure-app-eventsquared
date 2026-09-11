// by JSR <jsr@pixmob.com>


KlikDimmer = function(options=null) {
    KlikModule.call(this); // call super constructor

    // defaults
    this.label = 'dimmer';
    this.inc = 10;
    this.min = 0;
    this.max = 100;
    this.value = 100;

    for (k in options) {
        this[k] = options[k];
    }

    this.navigation = [
        { title:'Dimmer', content:[]},
    ];

    var tabs_options = {
        inc  : this.inc, 
        min  : this.min, 
        max  : this.max,
        value: this.value
    }

    klik_ui_tabs(this.navigation, tabs_options);
    klik_ui_adjust_navigation(this.navigation, this.uid);

    // define handlers
    var self = this;
    this.callbacks = {
        onmouseup : function(event) {

            var val = parseInt(event.target.innerText);

            if (self.on_dimmer_change_percent) {
                self.on_dimmer_change_percent(val / self.max);
            }

            if (self.on_dimmer_change_normalized) {
                self.on_dimmer_change_normalized((val-self.min) / (self.max-self.min));
            }

            if (self.on_dimmer_change) {
                self.on_dimmer_change(val);
            }

            klik_ui_slider_set_value(self.uid+'_slider', val);
        }
    }

    // init ui
    this.sections = tech.append_navigation(this.navigation, this.callbacks);


    // setup slider
    var slider_callbacks = {
        oninput : function(event) {
            var val = event.target.valueAsNumber;
            if (val!=self.value) {

                self.value = val;

                if (self.on_dimmer_change) {
                    self.on_dimmer_change(val);
                }

                if (self.on_dimmer_change_percent) {
                    self.on_dimmer_change_percent(val/100.);
                }

                var rounded = Math.floor(val/10.0) * 10;
                klik_ui_tab_select(self.sections[0], rounded);

            }
        }
    }

    var style_overlay = 'background:none; position:relative; left:calc(50% - 45px); top:22px; margin-bottom:-49px; pointer-events:none;';

    var slider_styles = {
        button:'width:100px; '+style_overlay, 
        number:'width:90px; text-align:center; color:#678; '+style_overlay,
        slider:'height:90px; width:calc(100%); padding-left:calc(3%); padding-right:calc(3%);', 
    }

    klik_ui_slider(this.sections[0], this.uid+'_slider', this.label, [tabs_options.min, tabs_options.max], tabs_options.value, slider_callbacks, slider_styles);     

    var button = by_id('ui_button_'+this.uid+'_slider');
    var number = by_id('ui_number_'+this.uid+'_slider');
    var slider = by_id('ui_slider_'+this.uid+'_slider');

    // set value, no callbacks
    this.set_value = function(value) {
        self.value = value * 100;

        klik_ui_slider_set_value(this.uid+'_slider', self.value);
        klik_ui_tab_select(self.sections[0], self.value);
    }

    hide(button);
    // hide(number);

}

KlikDimmer.prototype = Object.create(KlikModule.prototype);
KlikDimmer.prototype.constructor = KlikDimmer;
