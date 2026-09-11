// by JSR <jsr@pixmob.com


function get_effects() {
    var effects = KLIK_SIMPLE_PRO.effect;
    effects.push('video');
    return effects;
}


const SEQUENCER_LABEL_EDIT_ON  = 'edit : ON';
const SEQUENCER_LABEL_EDIT_OFF = 'edit : OFF';


KlikSequencer = function(options=null) {
    KlikModule.call(this); // call super constructor

    // defaults
    this.label = 'seq';

    // config
    this.config = null;
    this.params = null;

    // sequencer
    this.running = false;
    this.timers = {};  // timers will be stored like this : { timer1 : {duration: 1, instance:null } }
    this.cues = {};
    this.cues_total = {};
    this.loop = 0;
    this.index = 0;
    this.interval_time = 200;
    this.interval = null;
    this.slots_btn = [];
    this.slots_cue = [];

    this.broadcasting = { hub:0, ipad:0 };

    this.priority = 'BRO';
    this.rssi = null;
    this.interface = 'NONE';
    this.dimmer = 1.0;

    this.interface_mask = KLIK_BLE_INTERFACE_NONE;
    this.on_hubs_change = null;

    this.obj_hubs_on_the_map = {};
    this.obj_hubs_online_assigned = {};
    this.obj_hubs_online_not_assigned = {};

    this.hubs_online = [];
    this.hubs_offline = [];
    this.hubs_unassigned = [];

    this.current_cue_button = null;
    this.current_cues_total = 0;

    this.references = {
        ui_priority  : null,
        ui_interface : null, 
        ui_dimmer    : null, 
        ui_rssi      : null, 
    }

    // override stuff
    for (k in options) {
        this[k] = options[k];
    }

    // remember
    this.last_cue = null;
    this.last_item_to_animate = null;

    // interfaces
    this.hubs_commands = {};

    var self = this;

    self.hubs = {};


    this.save_config = function() {
        // console.log(self.config);
        tech.save_config(self.config);
    }

    this.set_hubs = function(status, ids) {
        if (self.on_hubs_change) {
            self.on_hubs_change(status, ids);

            // status can be : user, online, offline, unassigned
            // - user       : the hubs that the user wants to use 
            // - online     : automatically set (based on data from server)
            // - offline    : automatically set (based on data from server)
            // - unassigned : the remaining hubs, available to assign to you event
            
            if (status=='user') {
                self.config.sequences_interface.targets_remote = ids;
                self.save_config();

                self.hubs = ids.split(',');
                // console.log(self.hubs);
            }
        }
    }

    this.set_hubs_user = function(ids) {
        self.set_hubs('user', ids);
    }

    this.set_hubs_online = function(ids) {
        self.set_hubs('online', ids);
    }

    this.set_hubs_offline = function(ids) {
        self.set_hubs('offline', ids);
    }

    this.set_hubs_unassigned = function(ids) {
        self.set_hubs('unassigned', ids);
    }


    // default params, you could overwrite this by
    // passing some params when you create the object
    if (!this.params) {
        this.params = {
            layer : {
                width:55,
                options:Utils.range(0,7),
                parser:function(value) { 
                    return parseInt(value);
                },
            },
            group : {
                width:55,
                options:Utils.range(0,31),
                parser:function(value) { 
                    return parseInt(value);
                },
            },
            effect : {
                width:140,
                options:get_effects(),
            },
            speed : {
                width:120,
                options:KLIK_SIMPLE_PRO.speed,
            },
            rgb : {
                width:55,
                options:Utils.rgb_palette_with_swatch(3),
                parser:function(value) { 
                    var parts = value.split(',');
                    var rgb = [];
                    rgb[0] = parseInt(parts[0]);
                    rgb[1] = parseInt(parts[1]);
                    rgb[2] = parseInt(parts[2]);
                    return rgb; 
                },
                handler:function(element, value) {
                    element.style.backgroundColor = 'rgba('+value+',0.95)';
                }
            },
            duration : {
                width:60,
                options:[
                    0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0,
                    1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0,
                    2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0,
                    3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0,
                    5, 10, 15, 20, 30, 60, 120, 300 
                ],
                parser:function(value) { 
                    return parseFloat(value); 
                },
            },
        }
        
    }


    this.set_cue_parameter = function(cue, param, value, element, parser=null, handler=null) {
        if (parser) {
            cue[param] = parser(value);
        }
        else {
            cue[param] = value;
        }

        if (handler) {
            handler(element, value);
        }
        else {
            element.innerHTML = cue[param];
        }
    }

    // menu options
    this.options = {
        handle : [ 'move manually' , 'cancel' ],
        add    : [ 'add before', 'add after', 'duplic. before', 'duplic. after', 'cancel' ],
        remove : [ 'delete now', 'cancel' ]
    }

    for (var key in this.params) {
        if (!this.options[key]) {
            this.options[key] = this.params[key].options;
        }
    }

    // ui
    this.mouse_down = false;
    this.selected_cue = null;
    this.sections_offset = tech.sections_offset+0;
    this.sections_quantity = 0;
    this.sections_keys = {};
    this.sections = [];
    this.last_section = null;
    this.delta_y = 0;
    this.last_y = null;

    // setting up the widths for of each 
    // button on the cue line, the order is important
    this.widths = { handle:50, add:50, remove:50 };
    for (var key in this.params) {
        if (!this.widths[key]) {
            this.widths[key] = this.params[key].width;
        }
    }
    this.widths.go = 'calc(100% - '+this.get_total_width(this.widths)+'px)';

    // setting up the command
    this.command = {
        localname_via_ios  :'BROxPAD',
        
        duration : 4.0,
        payload : null,
        state : { 
            broadcast : 1
        },
    }; 

    var self = this;

    window.addEventListener('mousemove', function(event) {
        self.handle_cue_move(event);
    });

    window.addEventListener('mouseup', function(event) {
        self.deselect_cue(event);
    });

    window.addEventListener('keydown', function(event) {
        if (event.target.id.match('description')) {
            event.stopPropagation();
        }
        else {
            if (event.code=='ArrowDown' || 
                event.code=='ArrowUp' || 
                event.code=='ArrowLeft' || 
                event.code=='ArrowRight' ||  
                event.code=='Space') {
                event.preventDefault();

                if (self.current_cue_button) {
                    var parts = self.current_cue_button.id.split('_');
                   
                    if (event.code=='ArrowDown' || event.code=='ArrowRight') { // next cue
                        parts[3]++; 
                    }  

                    else if (event.code=='ArrowUp' || event.code=='ArrowLeft'){ // previous cue
                        parts[3]--; 
                    } 
                    else if (event.code=='Space') { // next cue
                        parts[3]++; 
                    } 

                    try {
                        var cue_button = by_id(parts.join('_'));
                        klik_mouse_event(cue_button, 'mousedown');
                    }
                    catch(e) {
                        if (parts[3]<0){
                            parts[3] = self.current_cues_total-1; 
                        }
                        else {
                            parts[3] = 0; 
                        }
                        
                        var cue_button = by_id(parts.join('_'));
                        klik_mouse_event(cue_button, 'mousedown');
                    }
                }
               
            }
        }
    });
}

KlikSequencer.prototype = Object.create(KlikModule.prototype);
KlikSequencer.prototype.constructor = KlikSequencer;


const KLIK_SEQUENCER_DEVICE_CAPABILITIES = {

    // HW : hub 1 or hub2
    beacon : { 
        can_broadcast : 1
    },

    // HW : button, m4, tag2
    tag : {
        can_broadcast : 0
    },

    // HW : button, m4
    touchpoint : {
        can_broadcast : 0
    },

    // no HW yet
    config : {
        can_broadcast : 0
    }
};



KlikSequencer.prototype.on_app_data = function(namespace, data){ 
    var obj = new KlikData(namespace, data);
    // console.log(obj)

    // hubs are on the map (but we dont know if there are connected yet)
    if (namespace=='/infrastructures') {

        // clean slate
        this.obj_hubs_on_the_map = {};
        this.obj_hubs_online_assigned = {};
        this.obj_hubs_online_not_assigned = {};

        // for now this does not makes much sense
        // because we only considere hub1 and hub2 but
        // in a near future we will be able to broadcast via
        // other hardware such as : tag2, iphones, ipad, etc
        try {
            for (var type in KLIK_SEQUENCER_DEVICE_CAPABILITIES) {
                if (KLIK_SEQUENCER_DEVICE_CAPABILITIES[type].can_broadcast==1) {
                    for (var id in obj[type]) {
                        this.obj_hubs_on_the_map[id] = obj[type][id];

                        this.obj_hubs_on_the_map[id].custom.connected = 0;

                        // only dealing with hub1 and hub2 for now
                        this.obj_hubs_on_the_map[id].custom.hardware = (id.match('hubdroid')) ? 'hub2' : 'hub1';
                    }
                }
                else {
                    // console.log(k, 'cannot broadcast', obj[k]);
                }
            }
        }
        catch(e) {
            console.log('error', e, obj);
        }

        var num_devices = Object.keys(this.obj_hubs_on_the_map).length;
        if (num_devices>0) {
            // this.cout('devices', ':', num_devices + ' broadcaster(s)');
            // console.log(obj_hubs_on_the_map);

            // get hubs that are currently connected
            app.api.get_all_bridges();
        }
    }

    // receive hubs that are connected
    else if (namespace=='/bridges') {
        // console.log(namespace, obj);

        try {

            for (id in obj) {
                var bridge = obj[id];
                var hardware_id = bridge.beacons[0];
    
                // hubs with no event == null are unassigned
                if (bridge.event == null) {
                    this.obj_hubs_online_not_assigned[hardware_id] = bridge;
                }

                // hubs with event matching your event are yours
                else if (bridge.event == app.api.event) {
                    this.obj_hubs_online_assigned[hardware_id] = bridge;
                }
            }

            // for all hubs on the map, if they are assigned to your event
            // we assume that the servers see them and they are connected
            // console.log(this.obj_hubs_online_assigned);

            for (var k in this.obj_hubs_on_the_map) {
                if (this.obj_hubs_online_assigned[k]) {
                    this.obj_hubs_on_the_map[k].custom.connected = 1;
                }
            }

            // console.log('hubs on the map', this.obj_hubs_on_the_map);
            // console.log('hubs online (assigned)', this.obj_hubs_online_assigned);
            // console.log('hubs online (not assigned)', this.obj_hubs_online_not_assigned);
        }
        catch(e) {
            console.log(e);
        }
    }


    // check state of things

    this.hubs_online = [];
    this.hubs_offline = [];
    this.hubs_unassigned = [];

    for (var k in this.obj_hubs_on_the_map) {
        if (!this.obj_hubs_on_the_map[k].custom.connected) {
            if (this.obj_hubs_online_not_assigned[k]) {

                this.hubs_unassigned.push(k);

                // this does not work for hub1
                // ---

                // klik_modal_open({
                //     module: 'bridge_assignment',
                //     data: {
                //         addr : k,
                //         event : app.api.event
                //     }
                // });
            }
            else {
                this.hubs_offline.push(k);
            }
        }
        else {
            this.hubs_online.push(k);
        }
    }

    // this.cout('hubs online', ':', this.hubs_online);
    // this.cout('hubs offline', ':', this.hubs_offline);
    // this.cout('hubs unassigned', ':', this.hubs_unassigned);

    this.set_hubs_online(this.hubs_online);
    this.set_hubs_offline(this.hubs_offline);
    this.set_hubs_unassigned(this.hubs_unassigned);

    // console.log(namespace, obj);
}


// you should run this init method only when : 
// - api has been initialized
// - config exists for this object
KlikSequencer.prototype.init = function() {
    var self = this;

    if (!app.api) {
        this.cout('missing api');
        return;
    }

    if (!this.config) {
        this.cout('missing config');
        return;
    }

    // get api data
    app.api.get_data();

    // setup ui sections for the sequences
    self.add_all_sections();

    // all cues are at this point in the cues object
    // console.log(JSON.stringify(this.cues, null, 2));

    // this.cues contains the same data as config.sequences
    // console.log(JSON.stringify(self.config.sequences, null, 2));
}


// add

KlikSequencer.prototype.add_all_sections = function() {
    this.sections = []
    for (var i=0; i<Object.keys(this.config.sequences).length; i++) {
        this.sections[i] = add_node(klik_navigation, 'div', {_c:'klik_section loaded', _i:'section_'+(i+this.sections_offset)});
        this.sections_quantity++;
    }
    this.add_sequences_by_section(this.config.sequences);
}


KlikSequencer.prototype.add_sequences_by_section = function(sequences_data) {
    for (var i=0; i<Object.keys(sequences_data).length; i++) {
        var section_id = this.sections_offset+i;
        this.add_sequence_to_section(section_id, sequences_data);
    }
}


KlikSequencer.prototype.add_sequence_to_section = function(section_index, sequences_data) {
    this.add_cues_to_section(section_index, sequences_data);
    this.set_sequence_preview('section_'+section_index);
}


KlikSequencer.prototype.add_cues_to_section = function(section_index, sequences_data) {
    var section = by_id('section_'+section_index);
    if (section) {
        var key = Object.keys(sequences_data)[section_index-this.sections_offset];
        this.init_section(section, key, sequences_data[key]);
    }
}


// delete

KlikSequencer.prototype.delete_all_sections = function() {
    var qty = this.sections_quantity+0;
    for (var i=0; i<qty; i++) {
        this.delete_section_by_index(i+this.sections_offset);
    }
}


KlikSequencer.prototype.delete_section_by_index = function(section_index) {
    remove_node(by_id('section_'+section_index));
    this.sections_quantity--;
}


// rebuild

KlikSequencer.prototype.rebuild_all_section = function() {
    this.delete_all_sections();
    this.add_all_sections();
}

                
KlikSequencer.prototype.init_section = function(section, sequence_unique_id, cues_to_add) {
    section.innerHTML = '';

    this.sections_keys[section.id] = sequence_unique_id; 

    var seq_meta = this.config.sequences_meta[sequence_unique_id];

    var title  = add_node(section, 'label', { _l: seq_meta.title, _c:'topbar title' , _i:section.id+'_title' });
    var status = add_node(section, 'label', { _l: '...', _c:'topbar status', _i:section.id+'_status'});
    var expand = add_node(section, 'label', { _l: '+'  , _c:'topbar expand', _i:section.id+'_expand'  });


    var self = this;

    // clicking on title will bring up modal_view
    title.onmousedown = function(event) {
        klik_modal_open(event);
    }

    // clicking on expand will expand / minimize all the cues
    expand.onmouseover = function(event) {
        event.target.style.opacity = 0.7;
    }

    expand.onmouseout = function(event) {
        event.target.style.opacity = 1.0;
    }

    expand.onmouseup = function(event) {
        event.target.style.opacity = 0.8;
    }

    expand.onmousedown = function(event) {
        event.target.style.opacity = 0.5;
        var nodes = event.target.parentElement.childNodes;

        // hide all menus
        var node = null;
        for (var j=0;j<nodes.length; j++) {
            node = nodes[j];
            if (node.nodeName=='MENU') {
                toggle(node);
            }
        }

        // check status of last cue line that was hidden and
        // use that for setting our sequence expanded flag
        if (node) {
            var state = (node.style.display=='none') ? 0 : 1 ;
            event.target.innerHTML = (state)?'-':'+';
            self.save_sequences_meta(sequence_unique_id, 'expanded', state);
        }
    }


    var style = 'color:white; width:calc(50% - 4px); margin-right:4px; vertical-align:top; font-family:"HelveticaNeue-Light"; font-size:18; line-height:1.6;';

    var description         = add_node(section, 'textarea', { _l: seq_meta.description, _i:section.id+'_description', _s:style });
    var btn_stop_sequencer  = add_node(section, 'button'  , { _l:'stop' , _i:section.id+'_stop_sequencer' , _s:'width:calc(25% - 4px); vertical-align:top;'});
    var btn_start_sequencer = add_node(section, 'button'  , { _l:'start', _i:section.id+'_start_sequencer', _s:'width:25%; margin-right:0px; vertical-align:top;'});
    
    description.addEventListener('input', function(event) {
        self.save_sequences_meta(self.get_key_from_node_id(event.target.id), 'description', event.target.value);
    }, false);


    var menu = add_node(section, 'menu');
    menu.style.display = 'inline';

    var btn_toggle_edit  = add_node(menu, 'button', { _l:'edit'          , _i:section.id+'_toggle_edit'  , _s:'width:calc(25% - 4px);'});
    var btn_toggle_hubs  = add_node(menu, 'button', { _l:'send 5 cues', _i:section.id+'_toggle_hubs'  , _s:'width:calc(25% - 4px);'});
    var btn_toggle_off   = add_node(menu, 'button', { _l:'off'           , _i:section.id+'_toggle_off'   , _s:'width:calc(25% - 4px);'});
    var btn_toggle_loop  = add_node(menu, 'button', { _l:'loop'          , _i:section.id+'_toggle_loop'  , _s:'width:25%; margin:0px;'});
    
    var preview = add_node(section, 'canvas', { _i:section.id+'_canvas', _c:'preview'});

    btn_toggle_loop.onmousedown = function(event) {
        self.loop = (event.target.innerHTML=='loop : OFF') ? 1 : 0;

        self.set_toggle_state(event.target, 'loop', self.loop)
        self.save_sequences_meta(self.get_key_from_node_id(event.target.id), 'loop', self.loop);
    }

    btn_start_sequencer.onmousedown = function(event) {
        self.loop = seq_meta.loop;
        self.start('section_'+self.get_section_number(event));
    }

    btn_stop_sequencer.onmousedown = function(event) {
        self.loop = seq_meta.loop;
        self.stop('section_'+self.get_section_number(event));

        klik_mouse_event(btn_toggle_off, 'mousedown')
    }


    btn_toggle_hubs.onmousedown = function(event) {
        var nodes = section.childNodes;
        var counter = 0;

        for (var j=0;j<nodes.length; j++) {
            var node = nodes[j];

            if (node.nodeName=='MENU') {
                var line_items = node.childNodes;
                for (var k=0; k<line_items.length; k++) {
                    var item = line_items[k];
                    if (item.id.match('go')) {
                        // toggle(item);
                        if (counter++<=5) {
                            klik_mouse_event(item, 'mousedown');
                        }
                    }
                }
            }
        }
    }

    btn_toggle_off.onmousedown = function(event) {
        self.multimode = false;
        self.stop_broadcasting(KLIK_BLE_INTERFACE_REMOTE_HUB);
        self.stop_broadcasting(KLIK_BLE_INTERFACE_LOCAL_IOS);
        self.kill_animations();
        self.reset_status(status);

        // stop all timers 
        for (var k in self.timers) {
            if (self.timers[k].instance) {
                clearInterval(self.timers[k].instance);
            }

            if (self.timers[k].expiration) {
                clearTimeout(self.timers[k].expiration);
                self.timers[k].expiration = null;
            }

            self.timers[k].button.innerHTML = 'go';
            self.timers[k].instance = null;
        }

    }


    btn_toggle_edit.onmousedown = function(event) {
        var nodes = event.target.parentElement.parentElement.childNodes;

        self.edit = (event.target.innerHTML==SEQUENCER_LABEL_EDIT_OFF) ? 1 : 0;

        self.set_toggle_state(event.target, 'edit', self.edit, nodes)
        self.save_sequences_meta(self.get_key_from_node_id(event.target.id), 'edit', self.edit)
    }

    // add all cues
    self.add_cues(section, cues_to_add);

    // once the cues have been added we can set display states
    if (seq_meta.expanded) {
        klik_mouse_event(expand, 'mousedown'); // will minimize
        klik_mouse_event(expand, 'mousedown'); // will maximize
        expand.style.opacity = 1.0; // to fix
    }
    else {
        klik_mouse_event(expand, 'mousedown'); // will minimize
        expand.style.opacity = 1.0; // to fix
    }

    self.set_toggle_state(btn_toggle_loop, 'loop', seq_meta.loop);
    self.set_toggle_state(btn_toggle_edit, 'edit', seq_meta.edit, section.childNodes);
}



function deactivate_menu_items(nodes, keyword) {
    for (var j=0;j<nodes.length; j++) {
        var node = nodes[j];
        if (node.nodeName=='MENU') {
            var menus = node.childNodes;
            for (var k=0; k<menus.length; k++) {
                var item = menus[k];
                if (item.id.match(keyword)) {
                    item.style.pointerEvents = 'none';
                }
            }
        }
    }
}


function activate_menu_items(nodes, keyword) {
    for (var j=0;j<nodes.length; j++) {
        var node = nodes[j];
        if (node.nodeName=='MENU') {
            var menus = node.childNodes;
            for (var k=0; k<menus.length; k++) {
                var item = menus[k];
                if (item.id.match(keyword)) {
                    item.style.pointerEvents = 'auto';
                }
            }
        }
    }
}


function toggle_menu_items(nodes, keyword, state=null) {
    for (var j=0;j<nodes.length; j++) {
        var node = nodes[j];
        if (node.nodeName=='MENU') {
            var menus = node.childNodes;
            for (var k=0; k<menus.length; k++) {
                var item = menus[k];
                if (item.id.match(keyword)) {
                    if (state==true) {
                        show(item);
                    }
                    else if (state==false) {
                        hide(item);
                    }
                    else {
                        toggle(item);
                    }
                }
            }
        }
    }
}



function show_menu_items(nodes, keyword) {
    toggle_menu_items(nodes, keyword, true);
}


function hide_menu_items(nodes, keyword) {
    toggle_menu_items(nodes, keyword, false);
}



// save

KlikSequencer.prototype.save_sequences_meta = function(key, param, value) {
    this.config.sequences_meta[key][param] = value;
    this.save_config();
}


// config 

KlikSequencer.prototype.on_config_loaded = function(data) {
    if (this.set_config(data)) {
        this.init();
    }
    else {
        this.on_config_missing(true);
    }
}


KlikSequencer.prototype.on_config_missing = function(init_ui) {
    this.set_default_config();     
    if (init_ui) {
        this.init();
    }
}


KlikSequencer.prototype.set_default_config = function() {
    this.set_config(null);
    this.save_config();
}


KlikSequencer.prototype.set_config = function(data=null) {
    // console.log(JSON.stringify(data, null, 2));
    this.config = null;

    const DEFAULT_SEQUENCES = {};
    const DEFAULT_META      = {};
    const DEFAULT_PRIORITY  = 'BRO';
    const DEFAULT_INTERFACE = {mode:'LOCAL', targets_local:'localhost', targets_remote:''};
    const DEFAULT_DIMMER    = 1.0;
    const DEFAULT_RSSI      = 120;

    // config from localstorage data
    if (data && data.sequences && data.sequences_meta) {

        // partial config
        this.config = {
            sequences           : data.sequences,
            sequences_meta      : data.sequences_meta,
        }

        // complete with the new stuff
        if (data.sequences_priority) {
            this.config.sequences_priority = data.sequences_priority;
        }
        else {
            this.config.sequences_priority = DEFAULT_PRIORITY;
        }

        if (data.sequences_interface) {
            this.config.sequences_interface = data.sequences_interface;
        }
        else {
            this.config.sequences_interface = DEFAULT_INTERFACE;
        }

        if (data.sequences_dimmer) {
            this.config.sequences_dimmer = data.sequences_dimmer;
        }
        else {
            this.config.sequences_dimmer = DEFAULT_DIMMER;
        }

        if (data.sequences_rssi) {
            this.config.sequences_rssi = data.sequences_rssi;
        }
        else {
            this.config.sequences_rssi = DEFAULT_RSSI;
        }
    }

    // default config
    else { 
        this.config = { 
            sequences           : DEFAULT_SEQUENCES,
            sequences_meta      : DEFAULT_META,
            sequences_priority  : DEFAULT_PRIORITY,
            sequences_interface : DEFAULT_INTERFACE,
            sequences_dimmer    : DEFAULT_DIMMER,
            sequences_rssi      : DEFAULT_RSSI,
        };

        // create 1 sequences with the same default cues (CMYK)
        for (var i=0; i<1; i++) {
            var cues = [ 
                Utils.clone(sequencer.sample_cue_c), 
                Utils.clone(sequencer.sample_cue_m),
                Utils.clone(sequencer.sample_cue_y),
                Utils.clone(sequencer.sample_cue_k) 
            ];

            var seq_id = this.generate_sequence_id();
            this.config.sequences[seq_id] = cues;
            this.config.sequences_meta[seq_id] = {loop:1, edit:1, expanded:0, title:'Sequence', description:'This is the demo sequence'};
        }

        // this.config.sequences_meta['Sequence 1'].expanded = 1;
        // this.config.sequences_meta['Sequence 2'].expanded = 1;
    }



    // use config values to setup this sequencer values
    // ---
    if (this.config.sequences_priority) {
        this.priority = this.config.sequences_priority;
    }

    if (this.config.sequences_interface) {
        this.interface = this.config.sequences_interface.mode;
        this.set_hubs_user(this.config.sequences_interface.targets_remote);
    }

    if (this.config.sequences_dimmer) {
        this.dimmer = this.config.sequences_dimmer;
    }

    if (this.config.sequences_rssi) {
        this.rssi = this.config.sequences_rssi;
    }

    this.cout('priority'    , ':', this.priority);
    this.cout('interface'   , ':', this.interface);
    this.cout('dimmer'      , ':', this.dimmer);
    this.cout('rssi'        , ':', this.rssi);


    // update ui
    // ---
    if (this.references.ui_priority) {
        this.references.ui_priority.set_value(this.priority);
    }
    if (this.references.ui_interface) {
        this.references.ui_interface.set_value(this.interface);
    }
    if (this.references.ui_dimmer) {
        this.references.ui_dimmer.set_value(this.dimmer);
    }
    if (this.references.ui_rssi) {
        this.references.ui_rssi.set_value(this.rssi);
    }

    // tech.cout(JSON.stringify(this.config));
    return this.config;
}


// generate random sequence id based on time in ms
// and 8 random hex values;
KlikSequencer.prototype.generate_sequence_id = function(base_id=null) { 
    if (base_id) {
        return Date.now()+'_'+base_id.split('_')[1];
    }
    var hex = "0123456789ABCDEF";
    var id = "";
    for (var i = 0; i < 8; i++) {
        id+=hex.charAt(Math.round(Math.random() * 15));
    }
    return Date.now()+'_'+id;
}

// sample cues

KlikSequencer.prototype.sample_cue_c = { 
    layer:0, group:0, rgb:[0,255,255], effect:'x-fade', speed:'fast', duration:1.0
}


KlikSequencer.prototype.sample_cue_m = { 
    layer:0, group:0, rgb:[255,0,255], effect:'x-fade', speed:'fast', duration:1.0
}


KlikSequencer.prototype.sample_cue_y = { 
    layer:0, group:0, rgb:[255,255,0], effect:'x-fade', speed:'fast', duration:1.0
}


KlikSequencer.prototype.sample_cue_k = { 
    layer:0, group:0, rgb:[0,0,0], effect:'x-fade', speed:'fast', duration:1.0
}


KlikSequencer.prototype.sample_cue_blackout = { 
    layer:0, group:0, rgb:[0,0,0], effect:'background', speed:'fast', duration:1.0
}



// utils

KlikSequencer.prototype.get_total_width = function(dict, margin=4) {
    var total = margin;
    for (var key in dict) {
        var val = dict[key]
        if (val) {
            total += val + margin ;
        }
    }
    return total-margin;
}


KlikSequencer.prototype.get_object_from_node_id = function(node_id) { 
    var parts = node_id.split('_');
    var obj = {
        section : parseInt(parts[1]),
        param   : parts[2],
        index   : parseInt(parts[3]),
    }
    // var key = by_id('section_'+obj.section+'_title').innerHTML;
    var key = this.sections_keys['section_'+obj.section];
    var seq = this.config.sequences[key];
    return {  
        'key':key, 
        'seq':seq,
        'cue':seq[obj.index],
    }
}


KlikSequencer.prototype.get_key_from_node_id = function(node_id) {
    return this.get_object_from_node_id(node_id).key;
}


KlikSequencer.prototype.get_cue_from_node_id = function(node_id) {
    return this.get_object_from_node_id(node_id).cue;
}


KlikSequencer.prototype.get_seq_from_node_id = function(node_id) {
    return this.get_object_from_node_id(node_id).seq;
}


// start / stop sequencer

KlikSequencer.prototype.start = function(section_id) {
    var section = by_id(section_id);
    var nodes = section.childNodes;
   
    this.slots_btn = [];
    this.slots_cue = [];

    var counter = 0;

    for (var i=0; i<nodes.length; i++) {
        var node = nodes[i];
        if (node.nodeName=='MENU') {
            var line_items = node.childNodes;
            for (var k=0; k<line_items.length; k++) {
                var item = line_items[k];
                if (item.id.match('go') && !item.id.match('header')) {
                    this.slots_btn.push(item);
                    this.slots_cue.push(this.get_cue_from_node_id(item.id));
                }
            }
        }
    }

    // console.log('btns', this.slots_btn);
    // console.log('cues', this.slots_cue);

    this.running = true;
    this.first_cue();

    if (this.last_section==null) {
        this.last_section = section;
    }
    else {
        if (this.last_section.id!=section.id) {
            var last_status = by_id(this.last_section.id+'_status');
            this.reset_status(last_status);
            this.last_section = section;
        }
    }

}


KlikSequencer.prototype.reset_status = function(div) {
    div.style.backgroundColor = '#234';
    div.style.color = '#00ffb9';
    div.innerHTML = '...';
}


KlikSequencer.prototype.stop = function(section_id) {
    this.running = false;
    if (this.interval) {
        clearTimeout(this.interval)
        this.interval = null;
    }
}


KlikSequencer.prototype.get_cue_status = function(cue) {
    var msg = '';
    for (var key in this.params) {
        msg += cue[key]+' ';
    }
    return msg;
}



var gradients = {};


KlikSequencer.prototype.set_sequence_preview = function(section_id) {
    var nodes = by_id(section_id).childNodes;
    var slots = [];
    for (var i=0; i<nodes.length; i++) {
        var node = nodes[i];
        if (node.nodeName=='MENU') {
            var line_items = node.childNodes;
            for (var k=0; k<line_items.length; k++) {
                var item = line_items[k];
                if (item.id.match('go') && !item.id.match('header')) {
                    slots.push(this.get_cue_from_node_id(item.id));
                }
            }
        }
    }

    var canvas = by_id(section_id+'_canvas');
    var context = canvas.getContext('2d');
    var gradient = context.createLinearGradient(0,0,canvas.width,0);

    var slot_size = 1.0/(slots.length);

    var mode = 1;

    for (var i=0; i<slots.length; i++) {
        if (slots.length>1) {

            if (mode==0) { // linear
                var stop_location = i*slot_size;
                gradient.addColorStop(stop_location, rgb_to_rgba(slots[i].rgb));
            }

            else if (mode==1) { // matching the effects (not yet)
                var stop_location_begin = i*slot_size + slot_size*0.15;
                var stop_location_end = i*slot_size + slot_size*0.95 ;

                if (stop_location_begin>1) {
                    stop_location_begin = 1;
                }

                gradient.addColorStop(stop_location_begin, rgb_to_rgba(slots[i].rgb));
                if (stop_location_end<=1) {
                    gradient.addColorStop(stop_location_end, rgb_to_rgba(slots[i].rgb));
                }
            }
        }
        else {
            gradient.addColorStop(0, rgb_to_rgba(slots[i].rgb));
        }
    }

    gradients[section_id] = gradient;

    this.draw(section_id, 0, 1);
}

KlikSequencer.prototype.draw = function(section_id, index, total) {
    var canvas = by_id(section_id+'_canvas');
    var context = canvas.getContext('2d');

    // canvas.width = window.innerWidth;

    context.fillStyle = gradients[section_id] ;
    context.fillRect(0, 0, canvas.width, canvas.height);

    this.draw_marker(context, 1+index*(canvas.width/(total)), 0, canvas.height-0, 'black', 2);
    this.draw_marker(context, 3+index*(canvas.width/(total)), 0, canvas.height-0, 'white', 2);
    this.draw_marker(context, 5+index*(canvas.width/(total)), 0, canvas.height-0, 'black', 2);
}

KlikSequencer.prototype.draw_marker = function(ctx, x, y, height, color, width) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.moveTo(x, y);
    ctx.lineTo(x, y+height);
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.stroke();
}


// send cues

KlikSequencer.prototype.resend_cue = function(regenerate_packet=false) {
    if (regenerate_packet && this.last_cue) {
        this.send_cue(this.last_cue, this.last_item_to_animate);
    }
    else {
        this.send_via(this.interface_mask);
    }
}


// default generate_packet function, 
// you should override this if you are using the sequencer for other purposes
KlikSequencer.prototype.generate_packet = function(cue) {
    var generator = new KlikGenerator();
    if (cue.group==0) {

        var on_impact = 0x00; // video on impact does not seem to work, need to check with GD

        if (this.rssi!=null) {
           
            if (cue.effect=='video') {
                generator.rssi(this.rssi).video(cue.rgb[0], cue.rgb[1], cue.rgb[2], on_impact);
            }
            else {
                generator.rssi(this.rssi).simple_pro(cue.rgb[0], cue.rgb[1], cue.rgb[2], cue.effect, cue.speed)
            }
        }
        else {
            if (cue.effect=='video') {
                generator.video(cue.rgb[0], cue.rgb[1], cue.rgb[2], on_impact);
            }
            else {
                generator.simple_pro(cue.rgb[0], cue.rgb[1], cue.rgb[2], cue.effect, cue.speed)
            }
            
        }
    }

    else {

        // simple-pro does not handle the video effect
        // so we replace the effect by a bump
        if (cue.effect=='video') {
            self.cout('error', ':', 'video fx not supported with groups - replacing with bump')
            cue.effect = 'bump';
        }

        // match a group in a particular layer, without switching to that layer
        var data = [255,255,255,255,255,255,255,255];
        data[cue.layer] = cue.group;

        if (this.rssi!=null) {
            generator.rssi(this.rssi).group_match_all(data).simple_pro(cue.rgb[0], cue.rgb[1], cue.rgb[2], cue.effect, cue.speed);
        }
        else {
            generator.group_match_all(data).simple_pro(cue.rgb[0], cue.rgb[1], cue.rgb[2], cue.effect, cue.speed);
        }
    }

    return generator.packet;
}


KlikSequencer.prototype.send_cue = function(cue, item_to_animate=null) {
    this.last_cue = cue;
    this.last_item_to_animate = item_to_animate;

    var cue_copy = Utils.clone(cue);

    // set dimmer
    if (cue_copy.rgb) {
        cue_copy.rgb = [
            Math.floor(cue.rgb[0]*this.dimmer),
            Math.floor(cue.rgb[1]*this.dimmer),
            Math.floor(cue.rgb[2]*this.dimmer),
        ]
    }

    // generate packet 
    // ---
    var packet = null;
    try {
        packet = this.generate_packet(cue_copy);
    }
    catch(e) {
        this.cout(e.name, ':', e.message);
    }

    if (!packet){
        this.cout('you need to provide a valid packet')
        return;
    }
    // this.cout('packet', ':', packet)



    // update interface mask
    // ---
    if (this.interface == 'NONE') {
        this.interface_mask = KLIK_BLE_INTERFACE_NONE;
    }
    else if (this.interface == 'LOCAL') {
        this.interface_mask = KLIK_BLE_INTERFACE_LOCAL_IOS;
    }
    else if (this.interface == 'REMOTE') {
        this.interface_mask = KLIK_BLE_INTERFACE_REMOTE_HUB;
    }
    else if (this.interface == 'ALL') {
        this.interface_mask = KLIK_BLE_INTERFACE_ALL;
    }
    // this.cout('iface mask', ':',this.interface_mask);


    // send
    this.send_via(this.interface_mask, packet, cue.duration);
    

    // animate buttons
    if (item_to_animate && this.interface_mask!=KLIK_BLE_INTERFACE_NONE) {
        var parts = item_to_animate.id.split('_');
        parts[2] = 'go';
        var trigger_button_id = parts.join('_');

        this.start_animation(trigger_button_id, cue.duration*1000);

        var status = by_id('section_'+parts[1]+'_status');
        status.innerHTML = this.get_cue_status(cue_copy);
        status.style.backgroundColor = rgb_to_rgba(cue_copy.rgb); 
        status.style.color = rgb_to_contrast(cue_copy.rgb);
    }
}


// change interface + resend cue
KlikSequencer.prototype.set_interface = function(value) {
    this.interface = value;
    // this.cout('set_interface', ':', this.interface);

    this.config.sequences_interface.mode = this.interface;
    this.save_config();
}


// change priority + resend cue
KlikSequencer.prototype.set_priority = function(value) {
    this.priority = value;
    // this.cout('set_priority', ':', this.priority);

    this.config.sequences_priority = this.priority;
    this.save_config();
}


// change dimmer + resend cue
KlikSequencer.prototype.set_dimmer = function(value) {
    this.dimmer = value;
    // this.cout('set_dimmer', ':', this.dimmer);

    this.config.sequences_dimmer = this.dimmer;
    this.save_config();
}


// change rssi + resend cue
KlikSequencer.prototype.set_rssi = function(value, resend=false) {
    this.rssi = value;
    // this.cout('set_rssi', ':', this.rssi);

    this.config.sequences_rssi = this.rssi;
    this.save_config();
}



// - iterate all child nodes for a specific section
// - if child node is a MENU we add it to the list of elements to remove
// - once the list is complete we remove those elements from the section
KlikSequencer.prototype.clear_cues_from_section = function(section_id) {
    var section = by_id('section_'+section_id);
    if (section) {
        var nodes = section.childNodes;
        var to_remove = [];
        for (var i=0; i<nodes.length; i++) {
            if (nodes[i].nodeName=='MENU') {
                to_remove.push(nodes[i]);
            }
        }
        for (var i=0; i<to_remove.length; i++) {
            section.removeChild(to_remove[i]);
        }  
    }        
}


KlikSequencer.prototype.add_cues = function(section, cues) {
    this.add_header(section);
    this.cues_total[section.id] = 0;
    for (var i=0; i<cues.length; i++) { 
        this.add_cue(section, cues[i], i);
        this.cues_total[section.id]++;
    }
}


KlikSequencer.prototype.add_header = function(section) {
    var menu = add_node(section, 'menu', {_i:section.id+'_header'});

    for (var key in this.widths) {
        if (this.widths[key]!=0) {
            var label = key.toUpperCase();

            var node = null;

            if (key=='go') {
                label = 'TRIGGER';

                node = add_node(menu, 'button', { 
                    _l: label, 
                    _i: section.id+'_header_'+key,
                    _c: 'header',
                    _s: 'width:'+this.widths[key]+'; margin-right:0px;',
                });
            }
            else {
                node = add_node(menu, 'button', { 
                    _l: label, 
                    _i: section.id+'_header_'+key,
                    _c: 'header',
                    _s: 'width:'+this.widths[key]+';',
                });
            }

            if (label!='TRIGGER' && label!='HANDLE') {
                node.onmousedown = function(event) {
                    var parts = this.id.split('_');
                    var index = parts[1];
                    var param = parts[parts.length-1];

                    klik_modal_open(event);
                }
            }
        }
    }
}


KlikSequencer.prototype.add_cue = function(section, cue, cue_index) {
    section.style.minWidth = '700px';

    var ui = [];
    var index = 0;
    var style = "height:48; vertical-align:top; text-align:center; padding:0; margin:0; margin-right:4;"

    var line = add_node(section, 'menu', { 
        _i: section.id+'_line_'+cue_index,
        _s: 'width:100%; padding:0; margin-top:5;',
    });

    for (var k in this.widths) {
        // console.log(k, this.widths[k], this.params[k]);

        var label = k;
       
        // always there
        if (k=='handle') {
            label = cue_index;
        }
        else if (k=='add') {
            label = '+'
        }
        else if (k=='remove') {
            label = '-'
        }

        // custom params
        // example  for the regular sequencer we have
        // layer, group, effect, speed, duration, rgb 
        else if (this.params[k]) {
            if (k=='rgb') {
                label = '';
            }
            else {
                if (cue[k]==undefined) {
                    label = '';
                }
                else {
                    label = cue[k];
                }
            }
        }

        var node = add_node(line, 'button', { 
            _l: label, 
            _s: style+'width:'+this.widths[k]+';',
            _i: section.id+'_'+k+'_'+cue_index,
        });

        if (k=='rgb') {
            node.style.backgroundColor = 'rgba('+cue.rgb+',0.95)'
            node.style.color = 'black';
        }

        ui.push(node);
    }

    ui[ui.length-1].style.marginRight = 0;


    this.cues[section.id+'_go_'+cue_index] = cue;

    // setup handlers
    var self = this;
    for (var i=0; i<ui.length; i++) {

        // trigger cue on GO
        if (ui[i].id.match('go')) {
            ui[i].addEventListener('mousedown', function(event) { 
                self.current_cue_button = this;
                self.current_cues_total = self.cues_total[section.id];
                self.send_cue(cue, event.target);

                // console.log(self.current_cues_total);

                self.draw(section.id, cue_index, self.current_cues_total);
            }); 
        }

        // move cue order manually
        else if (ui[i].id.match('handle')) {
            if (tech.ios) {
                ui[i].addEventListener('touchstart', function(event) { self.select_cue(event.target.parentElement);}); 
                ui[i].addEventListener('touchend'  , function(event) { self.deselect_cue(); }); 
            }
            else {
                ui[i].addEventListener('mousedown', function(event) { self.select_cue(event.target.parentElement);}); 
                ui[i].addEventListener('mouseup'  , function(event) { self.deselect_cue(); }); 
            }
        }

        // any other hit will open the modal view
        else {
            ui[i].addEventListener('mousedown', function(event) { klik_modal_open(event); }); 
        }

        // force rgb panel to dim when we hover over it
        if (ui[i].id.match('rgb')) {
            ui[i].addEventListener('mouseover', function(event) { event.target.style.opacity = 0.7; });
            ui[i].addEventListener('mouseout' , function(event) { event.target.style.opacity = 1.0; }); 
        }
    }
}


// broadcasting

KlikSequencer.prototype.send_via = function(iface_flags, payload=null, duration=null) {
    
    // set new payload
    if (payload) {
        this.command.payload = payload; 
    }

    // set new duration
    if (duration) {
        this.command.duration = parseFloat(duration); 
    }

    // handle null payloads
    if (this.command.payload == null) {
        this.cout('no payload, cannot send via interface : ', iface_flags);
        return;
    }

    // const KLIK_BLE_INTERFACE_NONE           = 0x0000;
    // const KLIK_BLE_INTERFACE_LOCAL_IOS      = 0x0001;
    // const KLIK_BLE_INTERFACE_LOCAL_MACOS    = 0x0002;
    // const KLIK_BLE_INTERFACE_LOCAL_ANDROID  = 0x0004;
    // const KLIK_BLE_INTERFACE_REMOTE_HUB     = 0x0010;
    // const KLIK_BLE_INTERFACE_ALL            = 0xFFFF;

    // notes
    // -----
    // - for now, we only allow one interface at the time
    // - future implementation swill allow multiple interfaces using the bitmask

    // only ios
    if (iface_flags == KLIK_BLE_INTERFACE_LOCAL_IOS) {
        this.start_broadcasting(KLIK_BLE_INTERFACE_LOCAL_IOS);
        this.stop_broadcasting(KLIK_BLE_INTERFACE_REMOTE_HUB);
    }

    // only hubs
    else if (iface_flags == KLIK_BLE_INTERFACE_REMOTE_HUB) {
        this.start_broadcasting(KLIK_BLE_INTERFACE_REMOTE_HUB);
        this.stop_broadcasting(KLIK_BLE_INTERFACE_LOCAL_IOS);
    }

    // all at once
    else if (iface_flags == KLIK_BLE_INTERFACE_ALL) {
        this.start_broadcasting(KLIK_BLE_INTERFACE_REMOTE_HUB);
        this.start_broadcasting(KLIK_BLE_INTERFACE_LOCAL_IOS);
    }

    // stop all
    else if (iface_flags == KLIK_BLE_INTERFACE_NONE) {
        this.stop_broadcasting(KLIK_BLE_INTERFACE_REMOTE_HUB);
        this.stop_broadcasting(KLIK_BLE_INTERFACE_LOCAL_IOS);
    }

}


KlikSequencer.prototype.stop_broadcasting = function(iface_flags) {

    if ( (this.broadcasting.hub == 1) && (iface_flags == KLIK_BLE_INTERFACE_REMOTE_HUB) ) {

        // stop all existing hub commands
        for (var k in this.hubs_commands) {
            const cmd = this.hubs_commands[k];

            // to cancel a command simply send same payload but with duration 0
            app.api.broadcast(
                cmd.target,
                cmd.payload,
                0,
                cmd.localname,
            );

            this.cout('broadcast stop', ':', cmd.target, cmd.payload, 0, cmd.localname);
        }

        // clear 
        this.hubs_commands = {};
        this.set_broadcasting('hub', 0);
    }

    else if ( (this.broadcasting.ipad == 1) && (iface_flags == KLIK_BLE_INTERFACE_LOCAL_IOS)) {
        klik_send_state({broadcast:0});
        this.set_broadcasting('ipad', 0);
    }

}

KlikSequencer.prototype.set_broadcasting = function(key, state, verbose=false) {
    this.broadcasting[key] = state;
    if (verbose) {
        this.cout('broadcast ', ':', key, (state)?'on':'off');
    }
}


KlikSequencer.prototype.get_online_targets = function() {
    // makes sure you provided at least one hub
    // ---
    if (this.hubs[0]=='') {
        this.cout('error', ':', 'please specify one or more valid target(s)');
        return null;
    }

    // makes sure the target hubs are actually online
    // ---
    var counter = 0;
    var targets = {};
    for (i in this.hubs) {
        var is_online = false;
        for (var j in this.hubs_online) {
            if (this.hubs[i]==this.hubs_online[j]) {
                is_online = true;
                counter++;
                continue;
            }
        }
        targets[this.hubs[i]] = is_online ;
    }

    if (counter==0) {
        this.cout('error', ':', 'please specify one or more valid target(s)');
        return null;
    }

    return targets;
}



// example hub1 : BROD:B5 (will contain the last part of the mac)
// example hub2 : BRO0023 (will only have the hubdroid ID)

KlikSequencer.prototype.get_localname_for_hub = function(hardware_id) {
    var last_four = hardware_id.substr(hardware_id.length - 4);
    return this.priority + last_four;
}

KlikSequencer.prototype.get_localname_for_ipad = function() {
    return this.priority + 'xPAD';
}


KlikSequencer.prototype.start_broadcasting = function(iface_flags) {
    if (this.command.payload) {

        // broadcast with hub1, hub2 via the server
        // ---
        if (iface_flags == KLIK_BLE_INTERFACE_REMOTE_HUB){

            var online_targets = this.get_online_targets();

            for (hardware_id in online_targets) {
                if (online_targets[hardware_id]) {

                    this.set_broadcasting('hub', 1);

                    // {
                    //     "payload_field" : "a34e1e081317ff",
                    //     "duration" : 60,
                    //     "localname" : "BRO_HUB"
                    // }

                    var k = hardware_id + '_'+this.command.payload+'_'+this.command.duration;

                    this.hubs_commands[k] = {
                        target      : hardware_id,
                        payload     : this.build_packet_for_hub(this.command.payload),
                        duration    : this.command.duration,
                        localname   : this.get_localname_for_hub(hardware_id) 
                    }

                    this.cout('broadcast', ':', 
                        this.hubs_commands[k].target, 
                        this.hubs_commands[k].payload, 
                        this.hubs_commands[k].duration,
                        this.hubs_commands[k].localname,                  
                    );

                    app.api.broadcast(
                        this.hubs_commands[k].target,
                        this.hubs_commands[k].payload,
                        this.hubs_commands[k].duration,
                        this.hubs_commands[k].localname 
                    );
                }
            }
        }

        else if (iface_flags == KLIK_BLE_INTERFACE_LOCAL_IOS) {
            this.set_broadcasting('ipad', 1);

            var name = this.get_localname_for_ipad() ;
            
            this.cout('broadcast', ':', name, this.command.payload );

            klik_send_payload(this.command.payload, name);
        }
    }
    else {
        this.cout('no payload');
    }
}


// {
//     "payload_field" : "a34e1e081317ff",
//     "duration" : 60,
//     "localname" : "BROPADx"
// }

KlikSequencer.prototype.build_packet_for_hub = function(payload) {
    if (typeof(payload)=='string') {
        payload = klik_hex_string_to_array(payload);
    }

    var packet = [];  

    packet.push.apply(packet, payload);

    return klik_array_to_hex_string(packet);  // return as hexstring
}



// triggers

KlikSequencer.prototype.first_cue = function() {
    this.trigger_cue(0, true);
}


KlikSequencer.prototype.trigger_cue = function(index, loop) {
    this.index = index;
    if (this.index>(this.slots_btn.length-1)) {
        if (this.loop) {
            this.index = 0;
        }
        else {
            return; // sequence is done and we dont loop
        }
    }

    var btn = this.slots_btn[this.index];
    var cue = this.slots_cue[this.index];

    klik_mouse_event(btn, 'mousedown');

    if (loop && sequencer.running) {  
        this.delayed_cue(++this.index, cue.duration*1000);
    }
}


KlikSequencer.prototype.delayed_cue = function(index, wait_time) {
    if (this.interval) {
        clearTimeout(this.interval)
        this.interval = null;
    }
    
    var self = this;
    this.interval = setTimeout(function() {
        self.trigger_cue(index, true);
    }, wait_time);
}


// manipulations

KlikSequencer.prototype.handle_cue_move = function(event) {
    if (this.selected_cue && this.mouse_down) {
       
        if (event) {
            if (event.clientY && this.last_y) {
                this.delta_y += (event.clientY-this.last_y);
            }
            this.last_y = event.clientY;
        }

        if (this.delta_y>this.selected_cue.offsetHeight/1.1) {
            this.delta_y = 0;
            if (this.selected_cue.nextSibling) {
                insert_after(this.selected_cue.nextSibling, this.selected_cue);
            }
        }
        else if (this.delta_y<-this.selected_cue.offsetHeight/1.1) {
            this.delta_y = 0;
            if (this.selected_cue.previousSibling.nodeName=='MENU' && (!this.selected_cue.previousSibling.id.match('header')) ) {
                insert_before(this.selected_cue.previousSibling, this.selected_cue);
            }
        }
        // this.cout('handle_cue_move - this.delta_y', this.delta_y);
    }
}    


KlikSequencer.prototype.select_cue = function(element) {
    this.mouse_down = true;

    var self = this;
    if (tech.ios) {
        document.body.ontouchmove = function(e){ 
            e.preventDefault();
            var obj = klik_handle_touchmove(event)
            self.handle_cue_move(obj);
        }
    }

    this.selected_cue = element;
    this.selected_cue.style.outline = '1px solid red';
}


KlikSequencer.prototype.deselect_cue = function() {
    this.mouse_down = false;

    if (tech.ios) {
        document.body.ontouchmove = function(e) { 
            return true;
        } 
    }

    this.delta_y = 0;

    if (this.selected_cue) {
        this.move_cue(this.selected_cue);
      
        var parts =  this.selected_cue.id.split('_');
        var section_id = parts[0]+'_'+parts[1];
        this.set_sequence_preview(section_id);

        this.selected_cue.style.outline = 'none';
        this.selected_cue = null; 
    }

    window.removeEventListener('mousemove', this.handle_cue_move);
    window.removeEventListener('mouseup'  , this.deselect_cue);
}


KlikSequencer.prototype.get_sequence = function(section_id) {
    return this.config.sequences[Object.keys(this.config.sequences)[section_id-this.sections_offset]]
}


KlikSequencer.prototype.move_cue_inside_sequence = function(seq, cue_index, new_index) {
  if (cue_index != new_index) {
        // console.log('from cue_index', cue_index, 'to new_index', new_index, 'data:', seq[cue_index]);
        seq.splice(new_index+1, 0, seq[cue_index]); // insert new cue
        
        if (new_index<cue_index) {
            seq.splice(cue_index+1, 1); // delete old position if inserted cue is before
        }
        else {
            seq.splice(cue_index, 1); // delete old position if inserted cue is after
        }
        return true;
    }
    return false;
}


KlikSequencer.prototype.rebuild_cues_in_section = function(section_id) {
    this.clear_cues_from_section(section_id);
    this.add_cues_to_section(section_id, this.config.sequences);
}


KlikSequencer.prototype.move_cue = function() {
    var parts = this.selected_cue.id.split('_');
    var section_id = parseInt(parts[1]);
    var cue_index = parseInt(parts[3]);

    var seq = this.get_sequence(section_id);

    var new_index = 0;
    if (this.selected_cue.nextSibling) {
        new_index = parseInt(this.selected_cue.nextSibling.id.split('_')[3]-1);
    }
    else {
        new_index = seq.length-1;
    }

    if (this.move_cue_inside_sequence(seq, cue_index, new_index)) {
        tech.save_config(this.config);
        this.rebuild_cues_in_section(section_id);
    }    
}



// animations

KlikSequencer.prototype.kill_animations = function() {
    var nodes = by_class('pulse');
    var nodes_to_remove = [];
    var i=0;

    for (i=0; i<nodes.length; i++) {
        nodes_to_remove.push(nodes[i]);
    }

    for (i=0; i<nodes_to_remove.length; i++) {
        this.kill_animation(nodes_to_remove[i]);
    }
}


KlikSequencer.prototype.kill_animation = function(node) {
    if (node) {
        rem_class(node, 'pulse');
        rem_class(node.parentElement, 'outlined');
    }
}


KlikSequencer.prototype.start_animation = function(element_id, duration) {

    if (this.interface_mask==KLIK_BLE_INTERFACE_LOCAL_IOS) {
        this.kill_animations();
    }

    var node = by_id(element_id);
    add_class(node, 'pulse');

    // node.parentElement.style.outline = '2px solid #00ffb9'

    add_class(node.parentElement, 'outlined');

    var loop_duration = duration/1000.;

    if (this.interface_mask==KLIK_BLE_INTERFACE_REMOTE_HUB ||
        this.interface_mask==KLIK_BLE_INTERFACE_ALL ) {

        var self = this;

        function start_countdown(dur) {

            if (!self.timers[node.id]) {
                self.timers[node.id] = {};
            }

            var timer = self.timers[node.id];

            timer.duration = dur;
            timer.button = node;
            node.innerHTML = timer.duration;

            if (timer.instance) {
                clearInterval(timer.instance);
                timer.instance = null;
            }

            timer.instance = setInterval(function() {
                node.innerHTML = --timer.duration;
            }, 1000 );


            if (timer.expiration) {
                clearTimeout(timer.expiration);
                timer.expiration = null;
            }

            timer.expiration = setTimeout(function() {
                
                if (timer.instance) {
                    clearInterval(timer.instance);
                    timer.instance = null;
                }
                node.innerHTML = 0;

                self.kill_animation(node);
                rem_class(node, 'pulse');

                // make sure the button text goes back to 'GO' after 200ms
                setTimeout( function() {
                    node.innerHTML = 'go'
                }, 500);

            }, dur*1000. );
        }

        start_countdown(loop_duration);   
    }
    else {

    }
}

KlikSequencer.prototype.handle_loop = function(node_id) {
    var cue = this.get_cue_from_node_id(node_id);
    this.send_cue(cue);
}


// section tools

KlikSequencer.prototype.get_section_number = function(event) {
    return parseInt(event.target.id.split('_')[1]);
}


KlikSequencer.prototype.set_section_title = function(section_obj, title) {
    by_id('section_'+section_obj.index+'_title').innerHTML = title;
}

                 
KlikSequencer.prototype.set_toggle_state = function(element, label, state, nodes_to_toggle=null) {
    if (state==1) {
        element.innerHTML = label+' : ON';
        element.style.color = '#00ffb9'
    }
    else if (state==0) {
        element.innerHTML = label+' : OFF';
        element.style.color = 'red'
    }

    if (!nodes_to_toggle) {
        return;
    }


    if (element.innerHTML===SEQUENCER_LABEL_EDIT_ON) {
        self.edit = 1;
        show_menu_items(nodes_to_toggle, 'handle');
        show_menu_items(nodes_to_toggle, 'add');
        show_menu_items(nodes_to_toggle, 'remove');

        // enable pointer events
        activate_menu_items(nodes_to_toggle, 'handle');
        activate_menu_items(nodes_to_toggle, 'add');
        activate_menu_items(nodes_to_toggle, 'remove');
        activate_menu_items(nodes_to_toggle, 'layer');
        activate_menu_items(nodes_to_toggle, 'group');
        activate_menu_items(nodes_to_toggle, 'effect');
        activate_menu_items(nodes_to_toggle, 'speed');
        activate_menu_items(nodes_to_toggle, 'rgb');
        activate_menu_items(nodes_to_toggle, 'duration');
    }
    else if (element.innerHTML===SEQUENCER_LABEL_EDIT_OFF) {
        self.edit = 0;
        hide_menu_items(nodes_to_toggle, 'handle');
        hide_menu_items(nodes_to_toggle, 'add');
        hide_menu_items(nodes_to_toggle, 'remove');
    
        // disable pointer events
        deactivate_menu_items(nodes_to_toggle, 'handle');
        deactivate_menu_items(nodes_to_toggle, 'add');
        deactivate_menu_items(nodes_to_toggle, 'remove');
        deactivate_menu_items(nodes_to_toggle, 'layer');
        deactivate_menu_items(nodes_to_toggle, 'group');
        deactivate_menu_items(nodes_to_toggle, 'effect');
        deactivate_menu_items(nodes_to_toggle, 'speed');
        deactivate_menu_items(nodes_to_toggle, 'rgb');
        deactivate_menu_items(nodes_to_toggle, 'duration');
    }
}




// function on_modal_open(event) {

//     event.notes = null;

//     if (event.module=='switch_hub') {
//         apply_modal_settings(event, 'switch_hub');
//     }
//     else if (event.module=='goto') {
//         apply_modal_settings(event, 'goto');
//     }
//     else if (event.module=='map') {
//         apply_modal_settings(event, 'map');
//     }
//     else if (event.module=='device') {
//         apply_modal_settings(event, 'device');
//     }
//     else if (event.module=='location') {
//         apply_modal_settings(event, 'location');
//         event.label = get_location_modal_title(event.data);
//     }

//     if (!event.notes) {
//         var dev = event.data;
//         klik_modal_update_device_data(dev);
//     }
//     else {
//         modal_notes.innerHTML = event.notes;
//     }

    

//     modal_notes.style.cssText = 'width:100%; height:360px; font-family: monospace; font-size:12; text-align:left; overflow-y:auto';
    
//     // setup label
//     modal_label.innerHTML = event.label;

//     var keys = [
//         'btn_1', 'btn_2', 'btn_3', 
//         'btn_4', 'btn_5', 'btn_6',
//         'btn_7', 'btn_8', 'btn_9'
//     ];

//     // setup event handlers for the buttons
//     for (var i=0; i<keys.length; i++) {
//         var btn = by_id('modal_'+keys[i]);
//         var label = keys[i];

//         btn.style.textAlign = 'center';

//         // setup button label
//         btn.innerHTML = (event[label]) ? event[label] : '...'; // setup all null labels to '...'

//         // setup button onclick handler
//         btn.onclick = (event[label]==null) ? null : function(e) {
//             event.target = e.target
//             for (key in modal_settings) {
//                 if (event.module==key) {
//                     var id = e.target.id.substring(6, e.target.id.length); // 'modal_btn_1' becomes 'btn_1'
//                     var handlers = modal_settings[key].handlers;
//                     if (handlers && handlers[id]) {
//                         try {
//                             modal_settings[key].handlers[id](event);
//                         }
//                         catch(e) {
//                             modal_settings[key].handlers[id][event.data.type](event);
//                         }
//                     }
//                 }
//             }
//         }
//     }
// }


// modal

KlikSequencer.prototype.on_modal_open = function(event) {

    if (event.module=='bridge_assignment') {
        const bridge_data = event.data;


        function handle_bridge_assignment(e) {
            // console.log('setting bridge data', bridge_data);

            app.api.set_bridge(bridge_data, function(){
                modal_label.innerHTML  = 'Success';
                modal_notes.innerHTML  = 'Successfully assigned ' +bridge_data.addr + ' to '+ bridge_data.event;
                modal_btn_1.innerHTML = '...';
                modal_btn_2.innerHTML = '...';
                klik_modal_cleanup();

                // at this point you can reload the bridges
                app.api.get_all_bridges();

                setTimeout(klik_modal_close, 2000);
            })
        }


        var hub_id = bridge_data.addr;
        var hub_event = bridge_data.event;

        var msg = '<span style="color:red">';
        msg +='<p>The '+hub_id +' is online and available ( BUT is not assigned to any event ).</p>';
        msg +='<p>You currently have this hub in your floorplan.</p>';
        msg +='<p>Do you want to proceed and assign ' +hub_id+ ' to your event ('+ hub_event+ ') ?</p>';
        msg +='</span>';

        modal_label.innerHTML = 'Assign '+hub_id+ ' to event : '+hub_event; 
        modal_notes.innerHTML = msg;
        modal_btn_1.innerHTML = 'Assign Now';
        modal_btn_1.onclick = handle_bridge_assignment;
        modal_btn_2.innerHTML = 'Cancel';
        modal_btn_2.onclick = klik_modal_close;

        return;
    }


    if (event.target.id.match('klik_toolbar_settings')) {
        return;
    }

    var obj = null;

    var parts = event.target.id.split('_'); // section_2_speed_1, section_2_header_speed
    if (parts[2] == 'header') {
        obj = {
            section : parseInt(parts[1]), // parts = ['section', '2', 'header', 'speed'];
            param   : parts[3],
            index   : -1, // means we will edit all cues
        }
    }
    else {
        obj = {
            section : parseInt(parts[1]), // parts = ['section', '2', 'speed', '1'];
            param   : parts[2],
            index   : parseInt(parts[3]),
        }
    }

    var self = this;

    function handle_mouse_down(e) {
        var close_modal_view = true;

        var val = e.target.innerHTML; // take the button label as value

        // ws previously using the sequence name (section label), as the key
        // var key = by_id('section_'+obj.section+'_title').innerHTML; 

        var key = self.sections_keys['section_'+obj.section];
        
        // get reference to the sequence and its metadata (for formating the ui)
        var seq  = self.config.sequences[key];
        var meta = self.config.sequences_meta[key];


        var indices = [];
        if (obj.index==-1) { // edit all cues
            for (var i=0; i<seq.length; i++) {
                indices.push(i)
            }
        }
        else {
            indices.push(obj.index);
        }

        var dirty = false;
        var dirty_all = false;
        var deletion_complete = false;

        for (var i=0; i<indices.length; i++) {
            var index = indices[i];
            var cue = seq[index];
        
            if (obj.param=='handle') {

            }

            else if (obj.param=='remove') {
                if (!deletion_complete) {
                    if (val=='delete now' && seq.length>1) {
                        if (obj.index==-1) {
                            seq.splice(1, seq.length-1) // delete all cues, except the first one
                            dirty = true;
                            deletion_complete = true;
                        }
                        else { 
                            seq.splice(index, 1); // delete one cue
                            dirty = true;
                            deletion_complete = true;
                        }
                    }
                    else {
                        self.cout('cannot delete because this is the last item')
                    }
                }
            }

            else if (obj.param=='add') {
                if (val=='add after') {
                    seq.splice(index+indices.length, 0, Utils.clone(sequencer.sample_cue_c));
                    dirty = true;
                }
                else if (val=='add before') {
                    seq.splice(index, 0, Utils.clone(sequencer.sample_cue_m));
                    dirty = true;
                }
                else if (val=='duplic. after') {
                    seq.splice(index+indices.length, 0, Utils.clone(cue));
                    dirty = true;
                }
                else if (val=='duplic. before') {
                    seq.splice(index, 0, Utils.clone(cue));
                    dirty = true;
                }
            }

            else if (obj.param=='title') {
                if (val=='add') {
                    self.cout('add');
                }
                else if (val=='duplicate') {
                    var new_key  = self.generate_sequence_id(key);
                    var new_seq  = Utils.clone(seq);
                    var new_meta = Utils.clone(meta);

                    self.config.sequences[new_key] = new_seq;
                    self.config.sequences_meta[new_key] = new_meta;

                    dirty_all = true;
                }
                else if (val=='rename') {
                    var res = prompt('Enter a new title to replace "'+self.config.sequences_meta[key].title+'"');
                    if (res) {
                        self.config.sequences_meta[key].title = res;
                        dirty = true;
                    }
                }
                else if (val=='delete') {
                    var res = confirm('Are you sure you want to delete "'+self.config.sequences_meta[key].title+'" ?');
                    if (res) {
                        if (self.sections_quantity>1) {
                            delete self.config.sequences[key];
                            delete self.config.sequences_meta[key];
                            dirty_all = true;
                        }
                        else {
                            self.cout('this is the last sequence, cannot delete it');
                        }
                    }
                }
                else if (val=='share') {
                    self.cout('share');
                    close_modal_view = false;
                }
            }

            else {
                // get the ui item for that param
                var element = by_id('section_'+obj.section+'_'+obj.param+'_'+index); 

                var parser  = self.params[obj.param].parser;
                var handler = self.params[obj.param].handler;

                self.set_cue_parameter(cue, obj.param, val, element, parser, handler);
            }
        }

        tech.save_config(self.config);

        // as soon as we delete or duplicate 
        // as section we rebuild all
        if (dirty_all) {
            self.rebuild_all_section();
        }
        else {
            // redraw cues in the proper order
            if (self.config.sequences[key]) {
                if (dirty) {
                    setTimeout(function() {
                        sequencer.clear_cues_from_section(obj.section);
                        sequencer.add_cues_to_section(obj.section, self.config.sequences);

                        self.set_sequence_preview('section_'+obj.section);
                    }, 200 );
                }
                else {
                    self.set_sequence_preview('section_'+obj.section);
                }
            }
        }
        
        if (close_modal_view) {
            setTimeout(klik_modal_close, 100);
        }
    };

    // setup label and notes
    modal_label.innerHTML = obj.param.toUpperCase(); 

    if (obj.param=='add') {
        if (obj.index==-1) {
            modal_notes.innerHTML = 'will add or duplicate <span style="color:red">all cues</span>'; 
        }
        else {
            modal_notes.innerHTML = 'will add a cue after this one'; 
        } 
    }
    else if (obj.param=='remove') {
        if (obj.index==-1) {
            modal_notes.innerHTML = 'will permanently <span style="color:red"> erase all cues</span>, except the first one'; 
        }
        else {
            modal_notes.innerHTML = 'will permanently erase this cue'; 
        } 
    }
    else if (obj.param=='title') {
        modal_label.innerHTML = 'Edit sequence '+(obj.section-1); 
        modal_notes.innerHTML = 'from here you can modify sequence no.'+ (obj.section-1);
    }
    else if (obj.param!='settings') {
        if (obj.index==-1) {
            modal_notes.innerHTML = 'will change the '+obj.param+ ' for <span style="color:red">all cues</span> from sequence '+ (obj.section-1); 
        }
        else {
            modal_notes.innerHTML = 'will change the '+obj.param+ ' for cue '+obj.index +' from sequence '+ (obj.section-1);
        } 
    }

    // setup buttons

    var buttons_config = null;
    if (sequencer.options[obj.param]) {
        buttons_config = sequencer.options[obj.param];
    }
    else {
        if (obj.param=='title') {
            // buttons_config = [ 'add', 'duplicate', 'delete', 'share', 'cancel'];
            buttons_config = [ 'rename', 'duplicate', 'delete', 'cancel'];
        }
    }

    if (buttons_config) {
        for (var i=0; i<buttons_config.length; i++) {
            var ui = by_id('modal_btn_'+(i+1));
            if (ui) {
                ui.innerHTML = buttons_config[i];
                ui.onmousedown = handle_mouse_down;

                if (obj.param=='rgb') {
                    ui.style.borderBottom = '10px solid rgba('+buttons_config[i]+',0.95)';
                }
                else if (obj.param=='add' || obj.param=='remove') {
                    ui.style.width = 130;
                }
                else if (obj.param=='title') {
                    ui.style.width = 130;
                }
                else {
                    ui.style.width = sequencer.widths[obj.param];
                }
            }
        }
    }
}
