// by JSR <jsr@pixmob.com

SECTION_COMMANDS = 0
SECTION_MODES    = 1
SECTION_FILTERS  = 2
SECTION_DEVICES  = 3

MODE_DATA  = 0;
MODE_NAMES = 1;
MODE_RSSI  = 2;


KlikDecoder = function(options=null) {
    KlikModule.call(this, 'decoder');

    // default params
    this.ready = 0;
    this.rssi_limit = -120; 
    this.tab_style = 'width:100;'; //' height:50; border-radius:4px;';
    this.mode = 0
    this.filter = 'ALL';
    this.report = 'fast';
    this.mode = MODE_DATA;
    this.history = {};
    this.devices = {};
    this.show_ui = 1;
    this.tag_tuner = false;

    for (k in options) {
        this[k] = options[k];
    }

    if (this.tag_tuner) {
        this.rssi_limit = -40;
        this.filter = "TAG"
    } 
         
    this.sections = [];

    this.navigation = [
        { title:null, id:'intervals', content:[] },
        { title:null, id:'modes', content:[] },
        { title:null, id:'filters', content:[] },
        { title:'>', id:'devices', content: [
            { _t:'div', _i:'div_devices', _l:'', _s:'font-size:12px; background-color:#345;'},
        ]},
    ];


    this.clear_history = function() {
        self = this;
        setTimeout(function() {
            self.history = {};
        }, 200);
    }


    this.set_filter = function(value=null) {
        if (value) {
            this.filter = value;
        }
        klik_send_command('filter_'+this.filter);
        this.cout('filter', ':', this.filter);

        this.clear_history();
    }

    this.set_ready = function(value=null) {
        if (value) {
            this.ready = value;
        }
        this.cout('ready', ':', this.ready);
    }


    this.set_mode = function(value=null) {
        if (value) {
            this.mode = value;
        }
        this.cout('mode', ':', this.mode);
        this.clear_history();
    }
}



KlikDecoder.prototype = Object.create(KlikModule.prototype);
KlikDecoder.prototype.constructor = KlikDecoder;


KlikDecoder.prototype.on_app_data = function(namespace, data){ 
    // console.log(namespace, data);
}


// run this method only when : 
// - api has been initialized
// - config exists for this object
KlikDecoder.prototype.init = function() {
    var self = this;

    if (!app.api) {
        this.cout('missing api');
        return;
    }

    if (!this.config) {
        this.cout('missing config');
        return;
    }


    var self = this;

    if (this.show_ui) { // && !this.tag_tuner) {
        new KlikRssi({ 
            value : this.rssi_limit*-1, 
            title : null,
            on_rssi_change : function(value) {
                self.rssi_limit = value * -1;
                self.history = {}; 
            }
        });
    }

    if (this.tag_tuner) {
        this.tag_tuner_rssi = new KlikRssi({ 
            label : "threshold",
            value : 55, 
            title : null,
            on_rssi_change : function(value) {
                // self.rssi_limit = value * -1;
                // self.history = {};
                self.cout(value);
            }
        });
    }


    // add sections
    this.sections = tech.append_navigation(this.navigation, this.callbacks);


    function handle_tab_selection(event) {
        var method = event.target.getAttribute('_m');
        var args   = event.target.getAttribute('_a');
        self[method](args);
    }


    // populate modes

    var items = [
        { _a:{report:0        , scan:0}, _l:'stop' },
        { _a:{report:'slow'   , scan:1}, _l:'1000ms' },
        { _a:{report:'default', scan:1}, _l:'500ms' },
        { _a:{report:'fast'   , scan:1}, _l:'250ms' },
        { _a:{report:'stream' , scan:1}, _l:'stream' },
    ];

    for (var i=0; i<items.length; i++) {
        if (items[i]._a.report==this.report) {
            items[i]._c = 'selected';
        }
        Utils.join(items[i], { _f:'klik_send_state', _t:'tab', _g:0, _s:this.tab_style });
        var tab = tech.add_navigation_item(this.sections[SECTION_COMMANDS], items[i], i);
        if (items[i]._m) {
            tab.onmousedown = handle_tab_selection;
        }
    }


    // populate modes

    var items = [
        { _a:MODE_DATA , _l:'show data' },
        { _a:MODE_NAMES, _l:'show names' },
        { _a:MODE_RSSI , _l:'show rssi' },
    ];

    for (var i=0; i<items.length; i++) {
        if (items[i]._a==this.mode) {
            items[i]._c = 'selected';
        }
        Utils.join(items[i], { _m:'set_mode', _t:'tab', _g:1, _s:this.tab_style+' width:204px;' });
        var tab = tech.add_navigation_item(this.sections[SECTION_MODES], items[i], i);
        if (items[i]._m) {
            tab.onmousedown = handle_tab_selection;
        }
    }



    // populate filters

    var items = [
        { _a:'off', _l:'ALL' },

        { _a:'BRO', _l:'BRO' },
        { _a:'EPR', _l:'EPR' },
        { _a:'SPR', _l:'SPR' },
        { _a:'EMX', _l:'EMX' },
        { _a:'DMX', _l:'DMX' },
        { _a:'SIL', _l:'SIL' },

        { _a:'WND', _l:'WND' },
        { _a:'PIX', _l:'PIX' },
        { _a:'TAG', _l:'TAG' },
        { _a:'SEN', _l:'SEN' },
        { _a:'FWD', _l:'FWD' },
        { _a:'MOB', _l:'MOB' },
        { _a:'REG', _l:'REG' },
        { _a:'BCN', _l:'BCN' },
        { _a:'SRV', _l:'SRV' },
        { _a:'WUB', _l:'WUB' },
        { _a:'HUB', _l:'HUB' },
        
        { _a:'TRK', _l:'TRK' },
        { _a:'GPS', _l:'GPS' },

        { _a:'FRI', _l:'FRI' },
        { _a:'TAP', _l:'TAP' },
    ]

    for (var i=0; i<items.length; i++) {
        if (items[i]._l==this.filter) {
            items[i]._c = 'selected';
        }

        Utils.join(items[i], { _m:'set_filter', _t:'tab', _g:2, _s:this.tab_style });
        var tab = tech.add_navigation_item(this.sections[SECTION_FILTERS], items[i], i);
        tab.onmousedown = handle_tab_selection;
    }


    // setup views
    if (!this.show_ui) {
        hide(section_intervals);
        hide(section_modes);
        hide(section_filters);
        hide(section_devices);
    }

    if (this.tag_tuner) {
        hide(section_intervals);
        hide(section_modes);
        hide(section_filters);     
        show(section_devices);
    }
}



// config 

KlikDecoder.prototype.on_config_loaded = function(data) {
    if (this.set_config(data)) {
        this.init();
    }
    else {
        this.on_config_missing(true);
    }
}


KlikDecoder.prototype.on_config_missing = function(init_ui) {
    this.set_default_config();     
    if (init_ui) {
        this.init();
    }
}


KlikDecoder.prototype.set_default_config = function() {
    this.set_config(null);
    tech.save_config(this.config);
}


KlikDecoder.prototype.set_config = function(data=null) {
    // console.log(JSON.stringify(data, null, 2));
    this.config = null;

    // config from localstorage data
    if (data) {
        this.config = {

        }
    }

    // default config
    else { 
        this.config = { 

        };
    }

    // tech.cout(JSON.stringify(this.config));
    return this.config;
}



KlikDecoder.prototype.on_modal_open = function(event) {
    this.debug('on_modal_open');
}




KlikDecoder.prototype.parse_devices = function(data) {
  
    if (this.show_ui) {
        section_devices_title.style.opacity = 0.6;
        setTimeout(function() {
            section_devices_title.style.opacity = 1.0;
        }, 100);
    }


    var counter = {
        BRO:0, EPR:0, SPR:0, EMX:0, DMX:0, SIL:0, WND:0,
        PIX:0, TAG:0, SEN:0, FWD:0, MOB:0, REG:0, BCN:0,
        SRV:0, WUB:0, HuB:0, TRK:0, GPS:0, FRI:0, TAP:0,
    }

    var html = ''

    if (this.mode == MODE_NAMES || this.mode==MODE_RSSI) {
        html+='<div style="padding:10px; font-size:25px; font-family:courier;">'
    }

    for (var key in data.devices) {
        var dev = data.devices[key];
        var rssi = dev.rssi;

        // console.log("dev.name", dev.name);
       
        if (rssi==127 || rssi<this.rssi_limit) { // invalid (127) or out of range
            data.size--;
            delete data.devices[key];
        }
        else if (dev.name) {
            var type = dev.name.substr(0,3).toUpperCase();
            if (counter[type]!=null) {
                counter[type]+=1;
            }

            if (this.mode == MODE_NAMES) {
                html += key +'<br>';
            }

            if (this.mode==MODE_RSSI) {
                html += key +' '+dev.rssi+'<br>';
            }
        }
    }

    if (this.mode == MODE_NAMES || this.mode==MODE_RSSI) {
        html+='</div>';
    }


    for (var d in data.devices) {
        if (data.devices[d].name == undefined) { 
            console.log("no name")
            continue; 
        }

        // using Vadim's decoder
        var ble_decoder = new KlikBLEPacket(data.devices[d].payload, data.devices[d].name);
        var decoded = ble_decoder.decode(); 

        if (!('decoded' in data.devices[d])) {
            data.devices[d].decoded = {};             
        }

        if (!(d in this.history)) { 
            this.history[d] = {}; 
        }                    


        for (var cmd in decoded) {
            for (var cmd_name in decoded[cmd]) {
                // console.log('+', cmd, cmd_name, decoded[cmd], decoded[cmd][cmd_name]);
                data.devices[d].decoded[cmd_name] = decoded[cmd][cmd_name];
                this.history[d][cmd_name] = decoded[cmd][cmd_name];
            }
        }
    }

    this.devices = this.history;

    if (this.show_ui) {

        // write some quantities in the title
        var title = '>  ';
        for (var k in counter) {
            if (counter[k]!=0 || k==this.filter) {
                title += counter[k] + ' '+ k + ', '
            }
        }
        section_devices_title.innerText = title.substr(0,title.length-2);

        // view details
        if (this.mode == MODE_NAMES || this.mode==MODE_RSSI) {
            div_devices.innerHTML = html
        }
        else {
            div_devices.innerHTML = klik_highlight(JSON.stringify(this.history, klik_debug.inline_array, 2));
        }

        div_devices.style.height = div_devices.scrollHeight+'px';
    }
}

