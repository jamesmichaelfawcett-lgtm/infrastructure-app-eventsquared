// by JSR <jsr@pixmob.com


KlikInterfaces = function() {
    KlikModule.call(this); // call super constructor

    this.label = 'ifaces';

    // config
    this.config = {};

    // gui
    this.padding = '20px';
    this.tab_index = 0;

    // setup map to know which map devices maps to which interface
    this.devices_map = {
        'ipad' : 'mobile',
        'hub'  : 'beacon',
        'usb'  : 'sentinelle',   // for testing
        'dmx'  : 'pixel',        // for testing
        'osc'  : 'registration', // for testing
    }
    
    // define the interfaces this instance can use
    this.authorized_interfaces = [
        [ 'none', KLIK_BLE_INTERFACE_NONE ], // name, interface
        [ 'ipad', KLIK_BLE_INTERFACE_IPAD ],
        [ 'hub' , KLIK_BLE_INTERFACE_HUB  ],
        [ 'usb' , KLIK_BLE_INTERFACE_USB  ],
        [ 'dmx' , KLIK_BLE_INTERFACE_DMX  ],
        [ 'osc' , KLIK_BLE_INTERFACE_OSC  ],
        [ 'all' , KLIK_BLE_INTERFACE_ALL  ],
    ]

    // define the navigation 
    this.navigation = [
        { title:'Interfaces', content:[]},
        { title:'IPAD', content:[] },
        { title:'HUB' , content:[] },
        { title:'USB' , content:[] },
        { title:'DMX' , content:[] },
        { title:'OSC' , content:[] },
    ];

    // define the content
    for (var i=0; i<this.authorized_interfaces.length; i++) {
        var iname = this.authorized_interfaces[i][0];
        var iface = this.authorized_interfaces[i][1];
        this.navigation[0].content.push({ 
            _t:'tab',
            _g:this.uid+'_0', // radiogroup
            _i:'ui_target_'+iname,
            _a:iface, 
            _l:iname.toUpperCase(),
        });
    }
    klik_ui_adjust_navigation(this.navigation);

    var self = this;
    this.callbacks = {
        onmousedown : function(event) {
            var interface_id = parseInt(event.target.getAttribute('_a'));
            self.set_interface(interface_id);
        }
    }

    // build navigation ui using the tech app methods
    var nav_sections = tech.append_navigation(this.navigation, this.callbacks);


    for (var i=1; i<nav_sections.length; i++) {
        hide(nav_sections[i]);
    }

    // dicts to remember stuff
    this.devices  = {};
    this.selected = {};
    this.sections = {};

    // know where our divs are
    var section_offset = 0; 

    this.sections.interface = { 
        index:section_offset++, 
        div:null
    };

    for (var i=0; i<this.authorized_interfaces.length; i++) {
        var iname = this.authorized_interfaces[i][0];
        // var iconf = this.authorized_interfaces[i][2];

        // NONE doesnt have a div, ALL is using all existing interfaces divs
        if (iname!='none' && iname!='all') { 
            this.devices[iname] = [];
            this.selected[iname] = {};
            this.sections[iname] = { 
                index:section_offset, 
                div:by_id('section_'+section_offset), 
                interface:this.authorized_interfaces[i][1] 
            };
            section_offset++;
        }
    }

    // select one or multiple interface(s)
    // this.interface = KLIK_BLE_INTERFACE_IPAD | KLIK_BLE_INTERFACE_HUB | KLIK_BLE_INTERFACE_USB;
    // this.interface = KLIK_BLE_INTERFACE_IPAD | KLIK_BLE_INTERFACE_HUB;
    this.interface = KLIK_BLE_INTERFACE_IPAD;
}

KlikInterfaces.prototype = Object.create(KlikModule.prototype);
KlikInterfaces.prototype.constructor = KlikInterfaces;


KlikInterfaces.prototype.on_app_data = function(namespace, data){ 
    if (namespace==='/infra') {
        this.make_device_lists(data);

        // when we get new list of devices we check if 
        // we should set it as selected or not
        for (var key in this.selected) {
            for (var device_id in this.selected[key]) {
                var device_div = by_id(device_id);
                if (device_div && this.selected[key][device_id]) {
                    add_class(device_div, 'selected_device')
                }
            }
        }

        // select the proper interface
        this.set_interface(this.interface);
    }
}


KlikInterfaces.prototype.init = function(config=null) { 
    // console.log('init with config', JSON.stringify(config, null, 2));

    // set config
    if (config) {
        this.config = config;
        this.selected  = this.config.selected;
        this.interface = this.config.interface;
    }

    // set style
    for (var key in this.devices_map) {
        this.sections[key].div.style.backgroundColor = '#000';
        this.sections[key].div.style.padding = this.padding;
    }

    // set state
    this.set_online(tech.online);


    // get data
    app.api.get_data();
}


KlikInterfaces.prototype.set_online = function(state) { 
    if (state) {
        for (var key in this.devices_map) {
           tech.set_section_online(this.sections[key].index, key.toUpperCase()+' : / '+app.api.env + ' / '+app.api.event); 
        }
    }
    else {
        for (var key in this.devices_map) {
           tech.set_section_offline(this.sections[key].index, key.toUpperCase()+' : Not available because you seem to be offline'); 
        }
        this.devices.hub = []; // clear hubs
    }
}


KlikInterfaces.prototype.set_interface = function(interface_flags) {
    this.interface = interface_flags;
    this.cout('mask', ':', this.interface);

    // toggle config panels depending on interface selection
    // show only if config flag is set, and if interface is a match

    for (var k in this.sections) {
        var s = this.sections[k];
        if (s.div && s.interface) {
            (this.interface & s.interface) ? show(s.div) : hide(s.div);
        }
    }

    // select interface tab
    for (var i=0; i<this.authorized_interfaces.length; i++ ) {
        if (this.authorized_interfaces[i][1]!=255 && (this.interface & this.authorized_interfaces[i][1]) ) {
            add_class(by_id('ui_target_'+this.authorized_interfaces[i][0]), 'selected');
        }
    }
 
    this.save();
}


KlikInterfaces.prototype.make_device_lists = function(data) {
    for (var key in this.devices_map) {
        this.make_device_list(data, key, this.devices_map[key]);
    }
}

// create a list of device for a specific interface
// taking devices info from the api
KlikInterfaces.prototype.make_device_list = function(data, key, device_type) {
    this.devices[key] = [];

    for (var i=0; i<data.length; i++) {
        if (data[i].type==device_type) {
            this.devices[key].push(data[i]);
        }
    }

    var self = this;
    for (var i=0; i<this.devices[key].length; i++) {
        var style = 'line-height:1.8; height:80px; text-align:left;';

        if ((i%4)==3) {
            style += 'width:calc(25%); margin-right:0px;';
        }
        else {
            style += 'width:calc(25% - 4px);'
        }

        var label     = this.devices[key][i].name + '<br>'+ this.devices[key][i].id;
        var unique_id = 'dev_'+this.devices[key][i].id;

        var toggle = add_node(this.sections[key].div, 'button', { 
            _t: 'tab_'+this.tab_index++, 
            _l: label,
            _i: unique_id,
            _s: style,
        });

        toggle.onmousedown = function(event) {
            self.on_toggle(key, event);
        }

        if (this.config.selected) {
            this.selected[key][unique_id] = this.config.selected[key][unique_id];
        }
        else {
            this.selected[key][unique_id] = 0;
        }
    }  
}


// make buttons act as toggles
KlikInterfaces.prototype.on_toggle = function(key, event) {
    if (event.target.className.match('selected_device')) {
        event.target.className = 'nav';
        this.selected[key][event.target.id] = 0;
    }
    else {
        event.target.className = 'nav selected_device';
        this.selected[key][event.target.id] = 1;
    }
    // console.log(key, event.target.id, this.selected[key][event.target.id])
    this.save();
}


KlikInterfaces.prototype.save = function() {
    this.config = {
        interface   : this.interface,
        selected    : this.selected,
        devices_map : this.devices_map,
    };

    // this.cout(JSON.stringify(this.config, null, 2));
    tech.save_config({
        interfaces : this.config
    });
}


KlikInterfaces.prototype.save_defaults = function() {
    this.config = {
        interface   : 1,
        selected    : {},
        devices_map : [],
    };

    // this.cout(JSON.stringify(this.config, null, 2));
    tech.save_config({
        interfaces : this.config
    });
}



KlikInterfacesModalView = function() {

}

KlikInterfacesModalView.prototype = Object.create(KlikModule.prototype);
KlikInterfacesModalView.prototype.constructor = KlikInterfacesModalView;


KlikInterfacesModalView.prototype.setup_modal_view = function(view_type) {
    modal_btn_2.innerHTML = 'Cancel';
    modal_btn_2.onclick = klik_modal_close;

    switch (view_type) {

        case 'network' : 
        case 'ethernet' : 
        case 'lte' : 
        case 'wifi' : {
            this.mv_network();
            break;
        };


        case 'bluetooth' : 
        case 'ble' : {
            this.mv_ble();
            break;
        };

        case 'dmx' : {
            this.mv_dmx();
            break;
        };

        case 'uart' : {
            this.mv_uart();
            break;
        };

        case 'osc' : {
            this.mv_osc();
            break;
        };

        case 'jit' : {
            this.mv_jit();
            break;
        };

        case 'midi' : {
            this.mv_midi();
            break;
        };

        case 'node v4' : {
            this.mv_node_v4();
            break;
        };

        case 'hub v2' : {
            this.mv_hub_v2();
            break;
        };

        default:
            this.cout('error', ':', 'unable to setup modal view :', view_type);
            break;
    }
}


KlikInterfacesModalView.prototype.mv_network = function() {
    modal_label.innerHTML = 'Network Interface'; 
    modal_notes.innerHTML = 'this will reset the interface that connects you to the internet'; 
    modal_btn_1.innerHTML = 'Reset Connection';
    modal_btn_1.onclick = function() {
        console.log('NOT resetting internet connection (not implemented)');
    };
}


KlikInterfacesModalView.prototype.mv_ble = function() {
    modal_label.innerHTML = 'BLE Interface'; 
    modal_notes.innerHTML = 'this will reset the websocket connection that connects to the BLE interface'; 
    modal_btn_1.innerHTML = 'Reset Connection';
    modal_btn_1.onclick = function() {
        console.log('NOT resetting BLE connection (not implemented)');
    };
}


KlikInterfacesModalView.prototype.mv_dmx = function() {
    modal_label.innerHTML = 'DMX Interface'; 
    modal_notes.innerHTML = 'this will reset the websocket connection that connects to the DMX interface'; 
    modal_btn_1.innerHTML = 'Reset Connection';
    modal_btn_1.onclick = function() {
        console.log('NOT resetting DMX connection (not implemented)');
    };
    // modal_btn_2.innerHTML = 'Set Framerate to 20';
    // modal_btn_2.onclick = function() {
    //     console.log('NOT setting framerate to 20 (not implemented)');
    // };

    // modal_btn_3.innerHTML = 'Set Framerate to 40';
    // modal_btn_3.onclick = function() {
    //     console.log('NOT setting framerate to 40 (not implemented)');
    // };
}


KlikInterfacesModalView.prototype.mv_uart = function() {
    modal_label.innerHTML = 'USB Serial Interface'; 
    modal_notes.innerHTML = 'this will reset the websocket connection that connects to the USB Serial device'; 
    modal_btn_1.innerHTML = 'Reset Connection';
    modal_btn_1.onclick = function() {
        console.log('NOT resetting USB Serial connection (not implemented)');
    };
}


KlikInterfacesModalView.prototype.mv_osc = function() {
    modal_label.innerHTML = 'OSC Interface'; 
    modal_notes.innerHTML = 'this will reset the websocket connection that connects to the OSC server'; 
    modal_btn_1.innerHTML = 'Reset Connection';
    modal_btn_1.onclick = function() {
        console.log('NOT resetting OSC connection (not implemented)');
    };
}


KlikInterfacesModalView.prototype.mv_jit = function() {
    modal_label.innerHTML = 'Jitter Interface'; 
    modal_notes.innerHTML = 'this will reset the tcp connections that connect to the jit.send and jit.send objects in MAX'; 
    modal_btn_1.innerHTML = 'Reset Connection';
    modal_btn_1.onclick = function() {
        console.log('NOT resetting jit.send or jit.recv connection (not implemented)');
    };
}


KlikInterfacesModalView.prototype.mv_midi = function() {
    modal_label.innerHTML = 'MIDI Interface'; 
    modal_notes.innerHTML = 'this will not do anything'; 
    modal_btn_1.innerHTML = 'Reset Connection';
    modal_btn_1.onclick = function() {
        console.log('NOT resetting midi connection (not implemented)');
    };
}


KlikInterfacesModalView.prototype.mv_node_v4 = function() {
    modal_label.innerHTML = 'PixMob Node v4'; 
    modal_notes.innerHTML = 'this will not do anything'; 
    modal_btn_1.innerHTML = 'Reset Connection';
    modal_btn_1.onclick = function() {
        console.log('NOT resetting Node v4 (not implemented)');
    };
}


KlikInterfacesModalView.prototype.mv_hub_v2 = function() {
    modal_label.innerHTML = 'Klik Hub v2'; 
    modal_notes.innerHTML = 'this will not do anything'; 
    modal_btn_1.innerHTML = 'Reset Connection';
    modal_btn_1.onclick = function() {
        console.log('NOT resetting Hub v2 (not implemented)');
    };
}





