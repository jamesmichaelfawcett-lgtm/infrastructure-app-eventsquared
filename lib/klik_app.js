// by JSR <jsr@pixmob.com>

// important for this file : keep everything vanilla javascript

// app version
const APP_VERSION                       = '0.9.4';
const APP_BUILD                         = '';
const APP_DATE                          = '2019-09-13';

// app navigation
var   APP_NAVIGATION_LAYOUT             = {};
var   APP_NAVIGATION_MENU               = {};

// app defaults
const APP_DEFAULT_SETTINGS              = false;
const APP_DEFAULT_DEBUG                 = false;

// jquery version to use (or not)
const APP_JQUERY_OK                     = true;
const APP_JQUERY                        = 'jquery-1.12.4.min.js';
const APP_JQUERY_UI                     = 'jquery-ui-1.12.1.min.js';

// namespaces
const NAMESPACE_ROOT                    = 'klik';
const NAMESPACE_APP                     = NAMESPACE_ROOT+'_app';
const NAMESPACE_API                     = NAMESPACE_ROOT+'_api';
const NAMESPACE_INTERFACES              = NAMESPACE_ROOT+'_interfaces';
const NAMESPACE_WEBSOCKET               = NAMESPACE_ROOT+'_websocket';
const NAMESPACE_JAVASCRIPT              = NAMESPACE_ROOT+'_javascript';
const NAMESPACE_STORAGE                 = NAMESPACE_ROOT+'_storage';
const NAMESPACE_TOOLBAR                 = NAMESPACE_ROOT+'_toolbar';
const NAMESPACE_NAVIGATION              = NAMESPACE_ROOT+'_navigation';



// OLD : we need to fix this
// ---
// set KLIK_WS_DEFAULT_DESKTOP_TO_IPAD to false when not connecting from the desktop to the ipad
// - when running the desktop Tech App we can now use the Bluetooth from the computer
// - before, in the early days, we were only able to use BLE from the iOS device
// - so we had to have the desktop Chrome browser connect to the iPad via websocket

// const KLIK_WS_DEFAULT_DESKTOP_TO_IPAD = false;

const KLIK_DEFAULT_PROTOCOL             = 'klik-protocol-v0.9.x';

// javascript interface, to talk to native app
const KLIK_JS_ENABLE = true;
const KLIK_JS_DEFAULT_OS                = 'ios'; // ios, android
const KLIK_JS_DEFAULT_PROTOCOL          = KLIK_DEFAULT_PROTOCOL;

// websocket interface to connect to remote host
const KLIK_WS_ENABLE = false;
const KLIK_WS_DEFAULT_HOST              = '127.0.0.1'; // '127.0.0.1' '10.10.8.64' '10.10.8.226', '10.10.8.64' '10.10.10.142'
const KLIK_WS_DEFAULT_PORT              = '9000'; // 9000     
const KLIK_WS_DEFAULT_PROTOCOL          = KLIK_DEFAULT_PROTOCOL;

// api
var   KLIK_API_DEFAULT_ENV              = 'prod';
var   KLIK_API_DEFAULT_EVENT            = 'DeviceManager';
var   KLIK_API_RESET_ACCESS_TOKEN       = false;

// debug
const KLIK_DEBUG_TO_CONSOLE             = false;

// ble interface
// todo : review this and integrate the Android & Webkit javascript interface
// const KLIK_BLE_INTERFACE_NONE           = 0x00;
// const KLIK_BLE_INTERFACE_IPAD           = 0x01;
// const KLIK_BLE_INTERFACE_HUB            = 0x02;
// const KLIK_BLE_INTERFACE_USB            = 0x04;
// const KLIK_BLE_INTERFACE_DMX            = 0x08;
// const KLIK_BLE_INTERFACE_OSC            = 0x10;
// const KLIK_BLE_INTERFACE_ALL            = 0xFF;

const KLIK_BLE_INTERFACE_NONE           = 0x0000;
const KLIK_BLE_INTERFACE_LOCAL_IOS      = 0x0001;
const KLIK_BLE_INTERFACE_LOCAL_MACOS    = 0x0002;
const KLIK_BLE_INTERFACE_LOCAL_ANDROID  = 0x0004;
const KLIK_BLE_INTERFACE_REMOTE_HUB     = 0x0010;
const KLIK_BLE_INTERFACE_ALL            = 0x00FF;

// todo : native interface
// ---
// const KLIK_NATIVE_INTERFACE_NONE       = 0x00;
// const KLIK_NATIVE_INTERFACE_WEBSOCKET  = 0x01; // native <-> websocket  <-> webview
// const KLIK_NATIVE_INTERFACE_JAVASCRIPT = 0x02; // native <-> javascript <-> webview


APP_NAVIGATION_LAYOUT['klik'] = {
    
    'infrastructure' : [
        'monitor',
        'manager',
        'explorer',
        // 'hub',
    ],
    'lightshow' : [
        'sequencer',
        'visualizer',
        // 'colours',
    ],
    'packets' : [
        'forwarder',
        'decoder',
        // 'encoder'
    ],
    // 'access control' : [
    //     'bouncer',
    //     // 'passive',
    //     // 'active'
    // ],
}


APP_NAVIGATION_LAYOUT['pixmob'] = {
    'wand' : [
        'status',
        'controller',
    ],
}


APP_NAVIGATION_LAYOUT['prototypes'] = {
    // 'eden' : [
    //     'effects',
    //     'commando',
    // ],
    'dmx' : [
        'moving',     
        'interface',
        'table',
        'editor',
    ],
    'bridge' : [
        'python',
    ],
    'tracking' : [
        'map',
        'debug',
    ],
    'api' : [
        'klik',
        'pixmob'
    ],
    'tags' : [
        'bookmarking',
        'scanning',
        'test',
        'cleaner',
    ],
    'beacons' : [
        'tuner',
    ],
    'nodes' : [
        'editor dmx',
        'editor max',
        'editor packets',
    ],
    'beacons' : [
        'tuner',
    ],
    'demo' : [
        'tracking',
        'groups',
        'sms',
        'mask',
        'websocket',
    ],
    'control' : [
        'klik',
        'pro',
        // 'model s'
    ],
    // 'hub' : [
    //     'broadcast', 
    //     'status',
    //     'interface',
    // ],
    'interface' : [
        'all',
        'websocket',
        'http',
    ],
    'map' : [
        'canvas',
        'devices',
        'zones',
    ],
    'visualize' : [
        'colors',
        'clips',
        'icons',
    ],
    'debug' : [
        'console',
        'logs',
    ],
    'dummy' : [
        'tag configurator',
        'tag decoder',
        'tag interactions',
        'logger',
    ],
    'template' : [
        'widgets'
    ],
}


const KLIK_LIB =  [
    // keep module at the top
    'klik_module.js', 
    'klik_dmx_constants.js',
    // utils
    'klik_utils.js',
    'klik_array.js',

    // others
    'klik_agent.js',
    'klik_api.js',
    'klik_api_chatbot.js',
    'klik_api_hub.js',
    'klik_canvas.js',
    'klik_colors.js',
    'klik_coords.js',
    'klik_controller.js',
    'klik_controller_pro.js',
    'klik_controller_ble.js',
    'klik_controller_model_s.js',
    'klik_counters.js',
    'klik_csv.js',
    'klik_data.js',
    'klik_decoder_functions.js',
    'klik_decoder.js',
    'klik_device.js',
    'klik_dimmer.js',
    'klik_dmx.js',
    'klik_dmx_interface.js',
    'klik_dmx_monitor.js',
    'klik_dmx_table.js',
    'klik_dmx_editor.js',
    'klik_generator.js',
    'klik_highlight.js',
    'klik_hit_tests.js',
    'klik_http_requests.js',
    'klik_hub.js',
    'klik_icons.js',
    'klik_interactions.js',
    'klik_interactions_manager.js',
    'klik_interface.js',
    'klik_interfaces.js',
    'klik_interval.js',
    'klik_load.js',
    'klik_log.js',
    'klik_map.js',
    'klik_map_constants.js',
    'klik_map_drawing.js',
    'klik_map_drawing_functions.js',
    'klik_menus.js',
    'klik_modal.js',
    'klik_mouse.js',
    'klik_node_editor.js',
    'klik_parsers.js',
    'klik_payloads.js',
    'klik_protos.js',
    'klik_priority.js',
    'klik_queries.js',
    'klik_rssi.js',
    'klik_save.js',
    'klik_send.js',
    'klik_sequencer.js',
    'klik_sorting.js',
    'klik_storage.js',
    'klik_sms_table.js',
    'klik_sms_devices.js',
    'klik_tags.js',
    'klik_theme.js',
    'klik_toolbar.js',
    'klik_touch.js',
    'klik_ui.js',
    'klik_power.js',
    'klik_websocket.js',
    'klik_time.js',

    'external/aes-js/index.js', // for vadim's decoder
    'external/colorpicker/color-picker.js', // for the color swatch
    'spectrum/spectrum.js', // for aj's hub

    'klik_xy_pad.js',
    'klik_dmx_player.js',
    'klik_dmx_universe.js',
    'klik_dmx_fixture.js',
    'klik_dmx_sliders.js',
    'klik_dmx_preset.js',
    'klik_pad_target.js',
    'klik_rainbow_player.js',
    'klik_wand.js'
]

const KLIK_STYLES = [
    'klik_style_tagger.css',
    'klik_style_toolbar.css',
    'klik_style_img.css',
    'klik_style_dmx.css',
    'klik_style_wand.css',
    'klik_modal.css',
    'klik_node_editor.css',
    'spectrum/spectrum.css', // for aj's hub
    'external/colorpicker/color-picker.css', // for the color swatch
]

const KLIK_STYLES_MANAGER =  [
    'klik_style_manager.css',
]

const KLIK_SCRIPTS_MANAGER = [
    'klik_calibration.js',
    'klik_database.js',
    'klik_dmx.js',
    'klik_hit_tests.js',
    'klik_models.js',
    'klik_power.js',
    'klik_polygon.js',
    'klik_protos.js',
    'klik_queries.js',
    'klik_rendering.js',
    'klik_sorting.js',
    'klik_time.js',
    'klik_theme.js',
]


var KlikApp = function(uid, name, type, settings=APP_DEFAULT_SETTINGS, debug=APP_DEFAULT_DEBUG) {
    window[uid] = this; // create a global ref for this app using the uid

    klik_debug.init(debug);

    this.version    = APP_VERSION;
    this.build      = APP_BUILD;
    this.date       = APP_DATE;

    this.uid        = uid;
    this.name       = name;
    this.type       = type;
    this.settings   = settings;
    this.debug      = debug;

    this.callbacks  = null; // init callbacks
    this.navigation = [];   // init navigation sections (empty)

    this.get_storage_id = function(version_id) {
        return NAMESPACE_ROOT +'_'+(this.type+'_'+this.name.replace(' ','_')+'_'+version_id).toLowerCase();
    }

    this.storage_id = this.get_storage_id(this.version); // NAMESPACE_ROOT +'_'+(this.type+'_'+this.name.replace(' ','_')+'_'+this.version).toLowerCase();

    this.ws_ip      = null; // if null KlikWebSocket we will use WS_DEFAULT_HOST
    this.ws_port    = null; // if null KlikWebSocket we will use WS_DEFAULT_PORT

    this.nav_ready  = false;
    this.css_ready  = false;

    

    this.lib = (this.type=='overviews') ? '../lib/' : '../../lib/';


    this.title = this.name+ ' v'+this.version +' '+this.build;
    this.ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    this.cout('init'    , ':', this.uid, '::', 'KlikApp');
    this.cout('title'   , ':', this.title);
    this.cout('date'    , ':', this.date);
    this.cout('ios'     , ':', this.ios);
    this.cout('settings', ':', this.settings);
    this.cout('debug'   , ':', this.debug);

    this.init_meta();
    this.init_styles();  // load styles in order
    this.init_scripts(); // load scripts in order

    this.sections_offset = 0;

    document.title = this.title;


    // event listeners
    var self = this;

    self.online = window.navigator.onLine;

    window.addEventListener('offline', function(event) { 
        self.online = false;
        self.update_connection_state();
        if (self.callbacks.on_detect_offline) {
            self.callbacks.on_detect_offline(event);
        }
    });

    window.addEventListener('online' , function(event) {
        self.online = true;
        self.update_connection_state();
        if (self.callbacks.on_detect_online) {
            self.callbacks.on_detect_online(event);
        }
    });

    window.addEventListener('beforeunload', function(event) {
        self.cleanup();
    });


    setTimeout(function() {
        self.update_connection_state();
    }, 500);

    return this;
};


KlikApp.prototype.cout = function() {
    var args = Array.from(arguments);
    args.splice(0,0, this.uid+' >');
    cout.apply(this, args);
}


KlikApp.prototype.update_connection_state = function() {
    this.set_connection_state({
        'network' : this.online,
        'websocket' : KLIK_WS_ENABLE && this.ws.connected,
        'javascript' : KLIK_JS_ENABLE && this.js.connected,
    });

}


// ----------------------------------------------------------------
// cleanup
// ----------------------------------------------------------------
KlikApp.prototype.cleanup = function() {

    if (this.ws) {
        this.ws.cleanup();
    }
}


// ----------------------------------------------------------------
// session
// ----------------------------------------------------------------
KlikApp.prototype.set_session_state = function(state) {
    console.log('session_state', state);
}


// ----------------------------------------------------------------
// connection
// ----------------------------------------------------------------
KlikApp.prototype.set_connection_state = function(state) {
    if (this.bar) {
        if (state.websocket!=null || state.javascript!=null) {
            // klik_toolbar_icon_bluetooth.style.display = (state.websocket) ? 'block' : 'none';
            if (state.websocket || state.javascript) {
                add_class(klik_toolbar_icon_bluetooth, 'on');
                rem_class(klik_toolbar_icon_bluetooth, 'off');
            }
            else {
                add_class(klik_toolbar_icon_bluetooth, 'off');
                rem_class(klik_toolbar_icon_bluetooth, 'on');
            }
        }

        if (state.network!=null) {
            // klik_toolbar_icon_network.style.display = (state.network) ? 'block' : 'none';
            if (state.network) {
                add_class(klik_toolbar_icon_network, 'on');
                rem_class(klik_toolbar_icon_network, 'off');
            }
            else {
                add_class(klik_toolbar_icon_network, 'off');
                rem_class(klik_toolbar_icon_network, 'on');
            }
        }
    }
}


KlikApp.prototype.set_connection = function(host, port) {
    this.ws.cleanup();
    var self = this;
    setTimeout(function() {
        self.init_websocket(host, port);
    }, 300)
}


// ----------------------------------------------------------------
// storage 
// - shared across apps
// - via localStorage
// ----------------------------------------------------------------
KlikApp.prototype.init_storage = function() {
    if (!check_node(NAMESPACE_STORAGE)) {
        return;
    }
    this.storage = new KlikStorage(this.uid);
}


// ----------------------------------------------------------------
// api 
// - only here
// ----------------------------------------------------------------
KlikApp.prototype.init_api = function() {
    if (!check_node(NAMESPACE_API)) {
        return;
    }
    this.api = new KlikApi();

    if (KLIK_API_RESET_ACCESS_TOKEN) {

        var delta_seconds = ((new Date()).getTime()-this.storage.api.time ) / 1000;
        // console.log("delta_seconds", delta_seconds);

        // if its been more than 60 minutes, we reset the access_token
        if (delta_seconds>3600) {
            this.api.access_tokens = { prod:null, staging:null, test:null };  
        }
    }
}



// ----------------------------------------------------------------
// interfaces 
// - only here
// ----------------------------------------------------------------
KlikApp.prototype.init_interfaces = function() {
    if (!check_node(NAMESPACE_INTERFACES)) {
        return;
    }
    this.interfaces = new KlikInterfacesModalView();
}



// ----------------------------------------------------------------
// save / load config
// - per app, using a storage_id specific to each app
// - via localStorage
// ----------------------------------------------------------------
KlikApp.prototype.save_config = function(data) {
    localStorage.setItem(this.storage_id, JSON.stringify({ 
        config : data
    }));
}


KlikApp.prototype.load_config = function(allow_older_versions=false, versions_allowed=[]) {
    // this.cout(this.storage_id, localStorage.getItem(this.storage_id));

    var self = this;

    var load_config_data = function(id) {
        var data = JSON.parse(localStorage.getItem(id));
        if (data && data.config) { 
            if (self.callbacks.on_config_loaded) {
                self.cout('config', ':', 'loaded from', id);
                self.callbacks.on_config_loaded(data.config);
            }
            return true;
        }
        else {
            return false;
        }
    }

    if (load_config_data(this.storage_id)){
        return;
    }

    if (allow_older_versions) {
        self.cout('config', ':', 'allowing old presets', versions_allowed);

        for (var i in versions_allowed) {
            if (load_config_data(self.get_storage_id(versions_allowed[i]))) {
                return;
            }
        }
    }

    // dit not find any valid config in storage
    // so we load the defaults
    self.cout('config', ':', 'not found for', this.storage_id);
    if (self.callbacks.on_config_missing) {
        self.callbacks.on_config_missing();
    }
    
}


KlikApp.prototype.load_config_defaults = function() {
    if (this.callbacks.on_config_missing) {
        this.callbacks.on_config_missing(false); // will recreate config from default, without ui initialization
    }
}


// ----------------------------------------------------------------
// meta
// ----------------------------------------------------------------
// <meta name="apple-mobile-web-app-status-bar-style" content="default">
// <meta name="apple-mobile-web-app-capable"  content="yes" />
// <meta name="apple-mobile-web-app-title" content="Klik Manager" />
// <meta name="apple-touch-fullscreen" content="yes" />
// <link rel="apple-touch-icon" href="../lib/img/icon-app.png"/>
// <link rel="apple-touch-startup-image" href="../lib/img/icon-app.png"/>

KlikApp.prototype.init_meta = function() {
    add_node(document.head, 'meta', { 
        name: 'viewport', 
        id: 'viewport',
        content: 'user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height' 
    });

    add_node(document.head, 'meta', {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'default'
    });

    add_node(document.head, 'meta', {
        name: 'apple-mobile-web-app-capable',
        content:'yes'
    });

    add_node(document.head, 'meta', {
        name: 'apple-mobile-web-app-title',
        content: 'Klik Tech'
    });

    add_node(document.head, 'meta', {
        name: 'apple-touch-fullscreen',
        content: 'yes'
    });

    add_node(document.head, 'link', {
        rel: 'apple-touch-icon',
        href: '../../lib/img/icon-app.png'
    });

    add_node(document.head, 'link', {
        rel: 'apple-touch-startup-image',
        href: '../../lib/img/icon-app.png'
    });
}


// ----------------------------------------------------------------
// navigation
// ----------------------------------------------------------------


function first_char_upper(phrase) {
    var words = phrase.split(' ');
    for (var j in words) {
        words[j] = words[j].charAt(0).toUpperCase() + words[j].slice(1);
    }
    return words.join(' ');
}
            

KlikApp.prototype.create_navigation = function(layout) {
    var navigation = [];
    for (var key in layout) {
        var items = layout[key];

        var entry = {
            title: first_char_upper(key),
            content:[]
        };

        for (var i in items) {
            var url = (key+' '+items[i]).split(' ').join('_')+'.html';
            var label = first_char_upper(items[i]);

            entry.content.push( {
                _u: url,
                _l: label
            });
        };
        navigation.push(entry);
    }
    return navigation;
}


KlikApp.prototype.add_navigation = function(nav_data=null) {
    var nav = nav_data || this.navigation;

    this.navigation.radiogroups = [];

    // create navigation sections with titles and buttons (toggles)
    var sections = [];
    for (var i=0; i<nav.length; i++) {

        var id = nav[i].id || i; // provided id or index starting at 0

        var section = null;
        if (nav[i].title) {
            section = this.add_navigation_section_with_title(id, nav[i].title);
        }
        else {
            section = this.add_navigation_section_with_title(id);
        }

        if (nav[i].style) {
            section.style.cssText += nav[i].style;
        }

        if (nav[i].class) {
            add_class(section, nav[i].class);
        }

        sections.push(section);

        if (nav[i].content) {
            for (var j=0; j<nav[i].content.length; j++) {
                this.add_navigation_item(sections[i], nav[i].content[j], j);
            }
        }
    }

    // mark all navigation sections as 'loaded'
    for (var i=0; i<sections.length; i++) {
        setTimeout(function(idx) { 
            add_class(sections[idx], 'loaded'); 
        }, 100 * i , i);
    }

    this.nav_ready = true;
    this.sections_offset += sections.length;
    return sections;
}


KlikApp.prototype.append_navigation = function(nav, callbacks=null) {
    var sections = [];
    for (var i=0; i<nav.length; i++) {

        var id = nav[i].id || (i+this.sections_offset); // provided id or index 

        sections[i] = this.add_navigation_section_with_title(id, nav[i].title);

        for (var j=0; j<nav[i].content.length; j++) {
            var item = this.add_navigation_item(sections[i], nav[i].content[j], j);
            if (callbacks) {
                for (var cb_name in callbacks) {

                    if (cb_name=='oninput') {
                        if (nav[i].content[j]._t=='textarea') {
                            item[cb_name] = callbacks[cb_name];
                            // console.log(cb_name);
                        }
                    }
                    else {
                        item[cb_name] = callbacks[cb_name];
                        // console.log(cb_name);
                    }
                    
                }
            }
        }
        setTimeout(function(index) { 
            add_class(sections[index], 'loaded'); 
        }, 100*i, i);

    }
    this.sections_offset += sections.length;
    return sections;
}


KlikApp.prototype.add_navigation_section_with_title = function(section_id, title=null) {
    var section = add_node(klik_navigation, 'div', {_c:'klik_section',  _i:'section_'+section_id}); // section_1
    if (title) {
        add_node(section, 'label', {_l:title, _i: section.id+'_title'}); // section_1_title
    }
    return section;
}


KlikApp.prototype.add_navigation_item = function(section, item, item_index=null) {
    var button = null;
    // if no id is provided we create one based on the section and button ids
    if (!item.id) {
        if (!item._i) {
            if (item_index!=null) {
                item._i = section.id+'_button_'+item_index;
            }
            else {
                item._i = section.id+'_button_'+Utils.generate_uid();
            }
        }
        item.id = item._i; // important
    }

    // add callbacks
    item._callbacks = {
        onclick     : this.uid+'.navigation_content_onclick(event)',
        onmouseover : this.uid+'.navigation_content_onmouseover(event)',
        onmouseout  : this.uid+'.navigation_content_onmouseout(event)',
    }

    // if a type is provided, we use that type
    if (item._t) {
        button = add_node(section, item._t, item); 
    }
    else { // if no type is provided we create a button with a cog icon
        button = add_node(section, 'button', item);
        add_node(button, 'span', {class:'icon'} );
    }
    return button;
}


KlikApp.prototype.init_navigation = function() {
    if (!check_node('klik_navigation')) {
        return;
    }

    if (!this.navigation) {
        return;
    }

    if (this.navigation.length==0) {
        // when no nav is provided we attempt to load nav 
        // from predefined layouts 
        var key = this.name.toLowerCase();
        var nav_layout = APP_NAVIGATION_LAYOUT[key];
        if (nav_layout) {
            this.navigation = this.create_navigation(nav_layout);
        }
    }

    // update menu for the toolbar
    var domain = this.type.toLowerCase();
    var domain_nav = this.create_navigation(APP_NAVIGATION_LAYOUT[domain]);
    APP_NAVIGATION_MENU[domain] = [];
    for (var i in domain_nav) {
        var item = domain_nav[i];
        for (var j in item.content) {
            APP_NAVIGATION_MENU[domain].push(item.content[j]._u);
        }
    }

    klik_navigation.style.paddingBottom = 50;

    this.add_navigation();
    this.are_you_ready();

    return this;
}


// set title and enable buttons
KlikApp.prototype.set_section_offline = function(section_id, title_string) {
    by_id('section_'+section_id+'_title').innerHTML = title_string;
    var nodes = by_id('section_'+section_id).childNodes;
    for (var j=0;j<nodes.length; j++) {
        var node = nodes[j];
        if (node.nodeName=='BUTTON') {
            node.style.opacity = 0.3;
            node.disabled = true;
        }
    }
}


// set title and disable buttons
KlikApp.prototype.set_section_online = function(section_id, title_string) {
    by_id('section_'+section_id+'_title').innerHTML = title_string;
    var nodes = by_id('section_'+section_id).childNodes;
    for (var j=0;j<nodes.length; j++) {
        var node = nodes[j];
        if (node.nodeName=='BUTTON') {
            node.style.opacity = 1.0;
            node.disabled = false;
        }
    }
}


KlikApp.prototype.are_you_ready = function() {
    if (this.nav_ready && this.css_ready) {
        try {
            klik_modal_init();
            klik_modal_close();
        }
        catch(e) {
            
        }

        add_class(document.body, 'loaded'); // mark as loaded, css will adjust ui

        setTimeout(function() {
            add_class(klik_toolbar, 'filters'); // delay filters
        }, 500);
    }
}


KlikApp.prototype.navigation_content_onmouseover = function(event) {
    var node = event.target;
    if (this.callbacks.on_app_over) {
        this.callbacks.on_app_over(event);
    }
}


KlikApp.prototype.navigation_content_onmouseout = function(event) {
    var node = event.target;
    if (this.callbacks.on_app_out) {
        this.callbacks.on_app_out(event);
    }
}


KlikApp.prototype.navigation_content_onclick = function(event) {

    var node = event.target;
    if (this.callbacks.on_app_click) {
        try {
            this.callbacks.on_app_click(event);
        }
        catch(e) {
            console.log('exception', e);
        }
    }
    
    // check for special attributes
    // _u = url
    // _f = function
    // _a = arguments (string, number, array, object)

    if (node.getAttribute('_u')) {
        var url = node.getAttribute('_u');
        document.location = url;
    }
    else if (node.getAttribute('_f')) {
        var func = node.getAttribute('_f');

        // console.log('---------', typeof(func), func);
 
        if (node._a && typeof(node._a)=='object') {
            window[func](node._a); // pass dict or array
        }
        else {
            if (node.getAttribute('_a')) {
                window[func](node.getAttribute('_a')); // pass string or numbers
            } 
            else {
                window[func](event) // pass the onclick event
            }
        }
    }
    
    // check for radio group
    if (node.getAttribute('_radiogroup')) {
        var rg = node.getAttribute('_radiogroup');
        for (var i=0; i<this.navigation.radiogroups[rg].length; i++) {
            rem_class(by_id(this.navigation.radiogroups[rg][i]), 'selected'); 
        }
        add_class(node, 'selected');
    }
  
    // var func = element.getAttribute('func');
    // if (func) {
    //     var url = element.getAttribute('url');

    //     if (func=='klik_load_url') {
    //         document.location = url;
    //     }
    //     else if (window[args]==undefined) {
    //         window[func](args);
    //     }
    //     else {
    //         try {
    //             window[func](window[args]);
    //         }
    //         catch(e) {
    //             window[func](args);
    //         }
    //     }
    // }
}


// ----------------------------------------------------------------
// javascript interface
// ----------------------------------------------------------------
KlikApp.prototype.init_javascript = function() {
    if (!check_node('klik_javascript')) {
        return;
    }

    var interface_name = get_js_interface();

    this.js = js = {
        connected : (interface_name!=null),
        interface : interface_name
    }
}


// ----------------------------------------------------------------
// websocket interface
// ----------------------------------------------------------------
KlikApp.prototype.init_websocket = function(host=null, port=null, protocol=null) {
  
    if (!check_node('klik_websocket')) {
        console.log("klik_websocket node does not exist")
        return;
    }

    if (!this.callbacks) {
        this.callbacks = {};
    }

    this.try_again = false;

    this.ws = ws = null;

    // automatically reconnect when websocket connection is closed
    var self = this;
    this.callbacks.on_ws_close = function() {
        if (self.try_again) {
            self.ws.cout('reconnecting', ':', 'in 1 second');
            setTimeout(function() {
                self.init_websocket(self.ws_host, self.ws_port, self.ws_protocol);
            }, 1000);
        }
    }

    // setup host, port, protocool
    this.ws_host = host;
    this.ws_port = port;
    this.ws_protocol = protocol;

    // setup socket
    this.ws = new KlikWebsocket(this.ws_host, this.ws_port, this.ws_protocol, this.callbacks);
    this.ws.app_ref = this;

    // this.ws_dmx = new KlikWebsocket(this.ws_host, 9001, 'pixmob-protocol-v0.1.x', this.callbacks);
    // this.ws_dmx.app_ref = this;
}


// ----------------------------------------------------------------
// toolbar
// ----------------------------------------------------------------
KlikApp.prototype.init_toolbar = function(show_ui_items=true) {
    if (!check_node('klik_toolbar')) {
        return;
    }
    this.bar = new KlikToolbar('bar', this.type, this.name, this.settings, this.ios, this, show_ui_items); 
}
    

// ----------------------------------------------------------------
// scripts
// ----------------------------------------------------------------
KlikApp.prototype.init_scripts = function() {

    if (this.name.toLowerCase()==='infrastructure manager') {
       for (var i=0; i<KLIK_SCRIPTS_MANAGER.length; i++) {
            KLIK_LIB.push(KLIK_SCRIPTS_MANAGER[i]);
       }
    }

    if (APP_JQUERY_OK) {
        KLIK_LIB.splice(0,0, APP_JQUERY_UI);
        KLIK_LIB.splice(0,0, APP_JQUERY);
    }
    this.scripts = { files: KLIK_LIB, index: 0 }
    this.next_script();
}


KlikApp.prototype.next_script = function() {
    if (this.scripts.index<this.scripts.files.length) {
        add_node(document.head, 'script', {
            onload: this.uid+'.loaded_script(this)', 
            src: this.lib+this.scripts.files[this.scripts.index++]
        });
    }
    else {
        cout('scripts >', 'loaded', ':', this.scripts.files.length, 'files');
        this.loaded_all_scripts();
    }
}


KlikApp.prototype.loaded_script = function(node) {
    this.next_script();
};


KlikApp.prototype.loaded_all_scripts = function() {
    // setup html elements, this is needed because all init_* methods in this
    // object will check if the node exist before continuing initialization

    add_node(document.body, 'div', {id: NAMESPACE_STORAGE    });
    add_node(document.body, 'div', {id: NAMESPACE_API        });
    add_node(document.body, 'div', {id: NAMESPACE_INTERFACES });
    add_node(document.body, 'div', {id: NAMESPACE_TOOLBAR    });
    add_node(document.body, 'div', {id: NAMESPACE_NAVIGATION });
    add_node(document.body, 'div', {id: NAMESPACE_WEBSOCKET  });
    add_node(document.body, 'div', {id: NAMESPACE_JAVASCRIPT });

    this.init_storage();
    this.init_api();
    this.init_interfaces();
    this.init_navigation();
    this.init_toolbar();
    this.init_websocket(this.ip);
    this.init_javascript()

};


// ----------------------------------------------------------------
// styles
// ----------------------------------------------------------------
KlikApp.prototype.init_styles = function() {
    if (this.name.toLowerCase()==='infrastructure manager') {
       for (var i=0; i<KLIK_STYLES_MANAGER.length; i++) {
            KLIK_STYLES.push(KLIK_STYLES_MANAGER[i]);
       }
    }
    this.styles = { files: KLIK_STYLES, index: 0 }
    this.next_style();
}


KlikApp.prototype.next_style = function() {
    if (this.styles.index<this.styles.files.length) {
        add_node(document.head, 'link', {
            onload: this.uid+'.loaded_style(this)', 
            rel: 'stylesheet',
            href: this.lib+this.styles.files[this.styles.index++]
        });
    }
    else {
        cout('styles >', 'loaded', ':', this.styles.files.length, 'files');
        this.css_ready = true;
        this.are_you_ready();
    }
}


KlikApp.prototype.loaded_style = function(node) {
    this.next_style();
};



// ----------------------------------------------------------------
// el manager to keep track of things
// ----------------------------------------------------------------

KlikInterfaceElements = function(uid, app_uid) {
    window[uid] = this;
    this.uid = uid;
    this.app_uid = app_uid;
    this.cout('init', ':', this.app_uid, '::', 'KlikInterfaceElements');
}


KlikInterfaceElements.prototype.cout = function() {
    var args = Array.from(arguments);
    args.splice(0,0, this.uid+' >');
    cout.apply(this, args);
}


KlikInterfaceElements.prototype.map = function(dict) {
    for (var key in dict) {
        if (window[dict[key].id]){ 
            this[key] = window[dict[key].id]; //console.log(this[key]);
        }
        else {
            console.log('did not find element :', dict[key].id);
        }
    }

    // keep references of the section, section titles
    var id = '';
    for (var i=0; i<window[this.app_uid].navigation.length; i++) {

        id = 'section_'+i;
        this[id] = window[id];

        id = 'section_'+i+'_title';
        this[id] = window[id];
    }
}


// ----------------------------------------------------------------
// debug
// ----------------------------------------------------------------
function cout() {
    var args = Array.from(arguments);
    if (klik_debug.enable) {
        var out = 'v'+APP_VERSION+' > ';
        for (var i=0; i<args.length; i++) {
            if (i==2)  {
                while(out.length<35) {
                    out+=' ';
                }
            }
            out+=args[i]+' ';
        }
        klik_debug.console(out, true);
    }
}


var klik_debug = {
    enable: 1,
};



klik_debug.init = function(state=true) {
    this.enable = state;

    add_node(document.body, 'div', { id:'klik_debug_console', class:'klik_console_line' } );
    // add_node(document.body, 'div', { id:'klik_debug_window' } );
    // add_node(document.body, 'div', { id:'klik_debug_monitor'} );

    if (this.enable) {
        show(klik_debug_console);
        // show(klik_debug_window);
        // show(klik_debug_monitor);
    }
    else {
        hide(klik_debug_console);
        // hide(klik_debug_window);
        // hide(klik_debug_monitor);
    }
}


klik_debug.console = function(data, to_console=KLIK_DEBUG_TO_CONSOLE) {
    if (klik_debug_console && klik_debug_console.style.display!='none') {
        if (typeof(data)!='object') {
            klik_debug_console.innerHTML = data;
        }
    }
    if (to_console) {
        console.log(data);
    }
}


klik_debug.window = function(data, inline_array=true, to_console=KLIK_DEBUG_TO_CONSOLE) {
    var output = '';
    if (inline_array) {
        output = JSON.stringify(data, klik_debug.inline_array, 2);
    }
    else {
        output = JSON.stringify(data, null, 2);
    }

    klik_debug_window.innerHTML = output;

    if (to_console) {
        console.log(output);
    }
}


// klik_debug.inline_array = function(k,v) {
//     if (v instanceof Array) {
//         // return JSON.stringify(v);
//         return JSON.stringify(v).split('"').join('');
//     }
//     return v;
// }

klik_debug.inline_array = function(k, v) {
    if (v instanceof Array && typeof v[0]!='object') {
        return JSON.stringify(v).split('"').join('');
    }  
    return v;
}



// ----------------------------------------------------------------
// lazy accessors
// get / set for text, color, size
// ----------------------------------------------------------------

function klik_text(target, value=null) {
    try {
        if (!value) {
            return target.innerHTML;
        }
        target.innerHTML = value;
    }
    catch(e) {
        // console.log('klik_text error', e);
    }
}


function klik_color(target, value) {
    try {
        if (!value) {
            return target.style.backgroundColor;
        }
        target.style.backgroundColor = value;
    }
    catch(e) {
        // console.log('klik_color error', e);
    }
}


function klik_size(target, value) {
    try{
        if (!value) {
            return {
                width  : target.style.width,
                height : target.style.height
            };
        }
        for (var k in value) {
            target.style[k] = value[k];
        }
    }
    catch(e) {
        // console.log('klik_size error', e);
    }
}



// ----------------------------------------------------------------
// dom utils for creating nodes
// ----------------------------------------------------------------

function check_node(a) {
    var e = document.getElementById(a);
    if (e) {
        window[a] = e;
        return true;
    }
    else {
        return false;
    }
}


function global(node) {
    if (node) {
        if (node.id) {
            window[node.id] = node; 
        }
        else if (node._i) {
            window[node._i] = node;
        }
    }
}


function clear_tabs(group) {
    app.navigation.radiogroups[group] = [];
}


function add_tab(section, item) {
    item._w = 0;
    item._t = 'button';
    item._radiogroup = 'group_'+item._g;

    if (!app.navigation.radiogroups[item._radiogroup]) {
        app.navigation.radiogroups[item._radiogroup] = [];
    }

    if (item.id==undefined) {
        item.id = item._radiogroup+'_tab_'+app.navigation.radiogroups[item._radiogroup].length;
    }

    app.navigation.radiogroups[item._radiogroup].push(item.id);

    node = add_node(section, item._t, item); 
    return node;
}


// a = where to add
// a = element type
// c = item data
function add_node(target, type, data) {
    var node = null;

    // add provided node
    if (type=='node') {
        node = data;
    }
    else if (type=='tab') {
        node = add_tab(target, data);
    }
    else { 
        node = create_node(type, data);
    }

    if (node) {
        global(node);
        insert(target, node); 
    }

    // console.log(node.id);

    return node;
}

function remove_node(target) {
    if (target.parentNode) {
        target.parentNode.removeChild(target);
    }
}


function insert_before(reference_node, new_node) {
    reference_node.parentNode.insertBefore(new_node, reference_node);
}


function insert_after(reference_node, new_node) {
    reference_node.parentNode.insertBefore(new_node, reference_node.nextSibling);
}


function insert(reference_node, new_node) {
    reference_node.appendChild(new_node)
}


function create_node() {
    var args = Array.from(arguments);
    // console.log(args);

    // data
    if (args.length==1) {
        var data = args[0];

        if (data._t || data.type) {
            var type = (data.type) ? data.type : data._t;
            return create_node(type, data);
        }
        else {
            // assuming data is the type, ie : create_node('menu');
            return create_node(data, null);
        }
    }

    // type, data
    else if (args.length==2) {
        var type = args[0];
        var data = args[1];
        var node = document.createElement(type);

        if (data && data._w!=0) {
            add_class(node, 'nav');
        }

        for (var k in data) {

            // _ or _l = label
            if (k=='_' | k=='_l') { 
                node.innerHTML = data[k];
            }

            // {}
            else if (typeof(data[k])=='object') {
                if (k=='_callbacks') {
                    for (var cb in data[k]) {
                        node.setAttribute(cb, data[k][cb]);
                    }
                }
                else {
                    node[k] = data[k]; 
                }
            }

            // _t : type
            // _w : width
            else if (k=='_t' || k=='_w' ) {
               // ignoring those
            }

            // _c : class
            else if (k=='_c' || k=='class') {
                var classes = data[k].split(' ');
                for (var i=0; i<classes.length; i++){
                    add_class(node, classes[i]);
                }
            }
            // _s : style
            else if (k=='_s' || k=='style') {
                node.setAttribute('style', node.style.cssText+' '+data[k] );
            }

            // _i : id
            else if (k=='_i' || k=='id') { 
                node.setAttribute('id', data[k]);  
            }

            // others
            else {
                node.setAttribute(k, data[k]);
            }
        }

        global(node);
        return node;
    }

    console.log('null', args)
    return null;
}


// ----------------------------------------------------------------
// user interface management wrapped in a class
// ----------------------------------------------------------------

KlikInterfaceDescription = function(uid, app_uid) {
    window[uid] = this;

    this.uid = uid;
    this.app_uid = app_uid;
    this.index = 0;
    this.titles = [];
    this.sections = [];
    this.definition = {};
    this.cout('init', ':', this.app_uid, '::', 'KlikInterfaceDescription');
}


KlikInterfaceDescription.prototype.cout = function() {
    var args = Array.from(arguments);
    args.splice(0,0, this.uid+' >');
    cout.apply(this, args);
}  


KlikInterfaceDescription.prototype.set_index = function(i) {
    this.index = i;
}


KlikInterfaceDescription.prototype.current_section = function(i) {
    return this.sections[this.index];
}


KlikInterfaceDescription.prototype.add_element = function() {
    var args = Array.from(arguments);

    switch(args[0]) {
        case 'title':
            this.add_title(args[1]);
            break;

        case 'section':
            this.add_section(args[1]);
            break;

        case 'panel':
            this.add_panel(args[1], args[2]);
            break;

        case 'buttons':
            this.add_buttons(args[1]);
            break;

        case 'tabs':
            this.add_tabs(args[1]);
            break;

        case 'subtitle':
            this.add_subtitle(args[1]);
            break;
    }
}



KlikInterfaceDescription.prototype.add_title = function(title) {
    this.titles.push(ui_pagetitle(title));
}


KlikInterfaceDescription.prototype.add_section = function(title) {
    this.sections[this.index] = ui_section(title);
}


KlikInterfaceDescription.prototype.add_panel = function(name, style) {
    ui_panel(this.current_section(), this.definition, this.index, name, style );
}


KlikInterfaceDescription.prototype.add_buttons = function(data) {
    ui_buttons(this.current_section(), this.definition, this.index, data);
}


KlikInterfaceDescription.prototype.add_tabs = function(data) {
    for (key in data) {
        ui_subtitle_and_tabs(this.current_section(), this.definition, this.index, key , data[key] );
    }
}


KlikInterfaceDescription.prototype.add_subtitle = function(name) {
    ui_subtitle(this.current_section(), this.definition, this.index, name);
}
 


// ----------------------------------------------------------------
// static methods for ui management
// ----------------------------------------------------------------


function ui_pagetitle(title, content=[]) {
    return { 
        title: title
    };
}


function ui_section(title, content=[]) {
    return { 
        title: title, 
        content: content, 
    };
}


function ui_id(type, index, name, extra=null) {
    var id = 'ui_'+type+'_'+index+'_'+name;
    return (extra!=null) ? id+'_'+extra : id;
}


function ui_id_parse(id) {
    var result = { type:null, domain:null, index:null, tab_index:null, id:id} ;
    var parts  = id.split('_');

     // handle things like : ui_button_0_group_1
    if (parts.length>=4) {
        if (parts.length>=2) result.type       =  parts[1]; // 'button'
        if (parts.length>=3) result.index      = +parts[2]; // '0' > str to number
        if (parts.length>=4) result.domain     =  parts[3]; // 'group'
        if (parts.length>=5) result.tab_index  = +parts[4]; // '0' > str to number
    }

    // handle things like : ui_button_all
    else if (parts.length==3) {
        result.type    = parts[1];     // 'button'
        result.domain  = parts[2];     // 'all'
    }
    return result;
}


function ui_panel(section, ui_ref, index, name, style) {
    var id = ui_id('panel', index, name);
    ui_ref[id] = { _t:'div', _i:id , _s:style };
    section.content.push(ui_ref[id]);
}


function ui_button(section, ui_ref, index, name, style) {
    var id = ui_id('button', index, name);
    ui_ref[id] = { _t:'button', _i:id, _l:name, _s:style };
    section.content.push(ui_ref[id]);
}


function ui_buttons(section, ui_ref, index, data) {
    for (var i=0; i<data.names.length; i++) {
        ui_button(section, ui_ref, index, data.names[i], data.style+data.styles[i] );
    }
}


function ui_subtitle(section, ui_ref, index, name) {
    var id = ui_id('subtitle', index, name);
    ui_ref[id] = {_l:name.toUpperCase(), _i:id, _t:'label', _c:'subtitle', _s:'display:none'};
    section.content.push(ui_ref[id]);
}

var klik_ui_tab_offset = 0;


function ui_subtitle_and_tabs(section, ui_ref, index, name, array) {

    // create subtitle
    ui_subtitle(section, ui_ref, index, name);

    // create tabs
    for (var j=0; j<tabs[name].length; j++) {
        var id = ui_id('tab', index, name, j);
        var width = (array[j].toString().length<=2) ? 50 : 104; // small tabs for numbers 0-99
        ui_ref[id] = { 
            _i: id, 
            _t:'tab', 
            _g:'tab_'+(index+1+num_layers*klik_ui_tab_offset), 
            _l: array[j] , 
            _s:'width:'+width+'; height:50; display:none;', 
        }
        section.content.push(ui_ref[id]);
    }
    klik_ui_tab_offset++;
}


// static methods, shortcuts

function show(item, display_custom=null) {
    if (item) {
        if (item.constructor == Array){
            for (var i=0; i<item.length; i++){
                show(item[i]);
            }
        }
        else {
            item.style.display = (display_custom)?display_custom:'';
        }
    }
}


function hide(item) {
    if (item) {
        if (item.constructor == Array){
            for (var i=0; i<item.length; i++){
                hide(item[i]);
            }
        }
        else {
            item.style.display = 'none';
        }
    }
}


function switch_class(node, class_on, class_off) {
    if (has_class(node, class_on)) {
        rem_class(node, class_on);
        add_class(node, class_off);
    }
    else {
        rem_class(node, class_off);
        add_class(node, class_on);
    }
}


function has_class(node, class_name) {
    return node.classList.contains(class_name);
}


function add_class(node, class_name) {
    node.classList.add(class_name);
}


function rem_class(node, class_name) {
    node.classList.remove(class_name);
}


function tog_class(node, class_name) {
    node.classList.toggle(class_name);
}


function by_id(id) {
    return document.getElementById(id); 
}


function by_class(class_name) {
    return document.getElementsByClassName(class_name);
}


function by_tag(tag_name) {
    return document.getElementsByTagName(tag_name);
}
