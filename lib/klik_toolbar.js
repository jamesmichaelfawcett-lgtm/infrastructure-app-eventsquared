// by JSR <jsr@pixmob.com>



const AUTHORIZED_INTERFACES = {
    'ble': {},
    // 'dmx': {},
    // 'uart': {},
    // 'osc': {},
    // 'midi': {},
    // 'jit': {},
    // 'node v4': {},
    // 'hub v2': {}
};

const KLIK_TOOLBAR_AUTOHIDE = false;


if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'; // back off, I got this...
}


// history navigation
// function navigate_reload(delay=1000) {
//     setTimeout(function() {
//         app.cout('reloaded');
//         window.location = window.location;
//     }, delay);
// }


function navigate(where) {
    switch(where) {
        case 'back':
            window.history.back();
            break;

        case 'forward':
            window.history.forward();
            break;

        case 'home':
        default :
            if (go_home[tech.type]) {
                window.location = go_home[tech.type];
            }
            break;
    }
}


var go_home = {
    'overviews' : null,
    'klik'      : '../_.html',
    'pixmob'    : '../_.html',
    'prototypes': '../_.html',
}

// toolbar hiding on scroll
var toolbar_state = 1;

function klik_hide_toolbar() {
    if (!KLIK_TOOLBAR_AUTOHIDE) {
        return; 
    }
    
    toolbar_state = 0;
    klik_send({statusBar:0});
    add_class(klik_toolbar, 'hidden');

    if (check_node('klik_search')) {
        add_class(klik_search, 'no_toolbar');
    }

    if (klik_debug.enable) {
        hide(klik_debug_console);
    }
}


function klik_show_toolbar() {
    toolbar_state = 1;
    klik_send({statusBar:1});
    rem_class(klik_toolbar, 'hidden');

    if (check_node('klik_search')) {
        rem_class(klik_search, 'no_toolbar');
    }

    if (klik_debug.enable) {
        show(klik_debug_console);
    }
}


function layout_grid() {
    switch_class(klik_toolbar_icon_grid, 'on', 'off');
}


function layout_list() {
    switch_class(klik_toolbar_icon_list, 'on', 'off');
}


function preferences_network() {
    // klik_modal_open(null, function() {
    //     tech.interfaces.setup_modal_view('network');
    // });
}


function preferences_bluetooth() {
    // klik_modal_open(null, function() {
    //     tech.interfaces.setup_modal_view('bluetooth');
    // });
}


// KlikToolbar Object

// setup the application toolbar (top bar with menus or icons)
KlikToolbar = function(uid, type, name, settings, ios, app_ref, ui_items_visible=true) {

    // local and global references to this instance
    var self = window[uid] = this;

    this.app_ref = app_ref;

    // init
    this.uid        = uid;
    this.type       = type;
    this.name       = name;
    this.settings   = settings;
    this.ios        = ios;
    this.menu       = { type:this.type, id:'klik_toolbar_menu' }

    // used for limiting the ui rebuilds
    this.timeout = null;


    function add_icon(icon_class, callback=null, extra=null) {
        var conf = {
            id:'klik_toolbar_icon_'+icon_class, 
            class:'klik_toolbar_icon '+icon_class
        } 
        if (callback) {
            conf.onclick = callback;
        }
        if (extra) {
            conf.class += ' '+extra;
        }
        add_node(klik_toolbar, 'img', conf);  
    }

    // if (this.type=='pixmob') {
    //     add_icon('pixmob', null, 'logo');
    // }
    // else {
    //     add_icon('klik', null, 'logo');
    // }

    if (this.name!='Overview') {
        add_icon('left'     , 'navigate("back")' );
        add_icon('home'     , 'navigate("home")');
        add_icon('right'    , 'navigate("forward")' );
    }
    else {
        add_icon('klik', null, 'logo');
    }

    if (this.name=='Infrastructure Manager') {
        add_icon('refresh', 'klik_page_refresh()');
    }

    if (this.settings) {
        add_icon('config', 'toggle(klik_toolbar_settings)');
    }

    // bluetooth and network icons
    add_icon('bluetooth', 'preferences_bluetooth()', 'off');
    add_icon('network', 'preferences_network()', 'off');

    // layouts
    // add_icon('grid', 'layout_grid()', 'on');
    // add_icon('list', 'layout_list()', 'on');

    add_node(klik_toolbar, 'node', this.add_menu(this.menu) );

    // adding settings
    if (this.settings) {
        add_node(klik_toolbar, 'div', { id:'klik_toolbar_settings' } );
        this.add_settings(this.name);
        hide(klik_toolbar_settings);
    }

    try {

        if (this.ios) {

            if (check_node('klik_search')) {
                add_class(klik_search, 'ios');
            }

            if (name!=='Infrastructure Manager') {
                add_class(document.body, 'ios');
            }

            add_class(klik_toolbar, 'ios');
            add_class(klik_toolbar_settings, 'ios');

            add_class_to_all('klik_toolbar_icon', 'ios');
            add_class_to_all('klik_toolbar_menu', 'ios');
        }
    }
    catch(e) {
        setTimeout(function() {
            tech.cout('exception', e)
        }, 1000);
    }


    window.addEventListener("scroll", function(e) {
        // tech.cout(this.scrollY);

        e.preventDefault();

        if (tech.ios) {
            if (this.scrollY>=65) {
                if (toolbar_state==1) {
                    klik_hide_toolbar();
                }
            }
            else if (this.scrollY<=20) {
                if (toolbar_state==0) {
                    klik_show_toolbar();
                }
            }
        }
        else {
            if (this.scrollY>=50) {
                if (toolbar_state==1) {
                    klik_hide_toolbar();
                }
            }
            else if (this.scrollY<=10) {
                if (toolbar_state==0) {
                    klik_show_toolbar();
                }
            }
        }

    }, false);


    // // var fixed = document.getElementById('fixed');
    // klik_toolbar.addEventListener('touchmove', function(e) {
    //     e.preventDefault();
    // }, false);

    klik_menu_select_text(by_id(this.menu.id), name)
}


KlikToolbar.prototype.cout = function() {
    var args = Array.from(arguments);
    args.splice(0,0, this.uid+' >');
    cout.apply(this, args);
}


function klik_toolbar_update_checkboxes() {

    // update the checkbox to
    $('.klik_cb').each(function(index, element) {
        var cboxes = $(this)[0].children;

        for (var i=0; i<cboxes.length; i++) {
            var parts = cboxes[i].name.split('_');

            var flag_name = parts[parts.length-1];
            var key = parts[0];
            for (var j=1; j<parts.length-1; j++) {
                key+='_'+parts[j];
            }

            for (var conf_key in custom_settings.layer_flags) {
                if (key==conf_key) {
                    var val =  null;
                    if (flag_name==FLAG_NAME_VISIBLE) {
                        val = custom_settings.layer_flags[conf_key][FLAG_INDEX_VISIBLE] = Number(layer_flags[key].master[FLAG_INDEX_VISIBLE]);
                        set_stats();
                    }
                    else if (flag_name==FLAG_NAME_LOCK) {
                        val = custom_settings.layer_flags[conf_key][FLAG_INDEX_LOCK] = Number(layer_flags[key].master[FLAG_INDEX_LOCK]);
                    }
                    cboxes[i].checked = val;
                    break;
                }
            }
        }
    });
}


// only update checkboxes once, event if this function is being abused
KlikToolbar.prototype.update = function() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(klik_toolbar_update_checkboxes, 100);
}


KlikToolbar.prototype.set_param = function(param, value) {
    this.cout('set_param', ':', param, value);

    if (app.api) {
        var api = app.api;

        // changing environment
        if (param=='environment') {

            // remember env and event
            var old_env = api.env;
            var old_event = api.event;

            // set new env
            api.env = value;

            result = api.get_token(function(){

                // load the events for this environment
                // force refresh = not using the bufferent events

                var load_buffered_events = false;

                api.get_all_events(function(data) {

                    // clear all events from existing menu
                    klik_menu_clear(klik_toolbar_settings_event);
                    // $('#klik_toolbar_settings_event').find('option').remove();

                    // repopulate
                    for (var i=0; i<data.length; i++) {
                        var option = document.createElement('option');
                        option.text = data[i].id;
                       
                        // always make sure at least the 
                        // first event is selected
                        if (i==0) {
                            option.selected = true;
                            api.event = data[i].id;
                        }

                        // then try to select the same 
                        // event as the last one
                        if (data[i].id==old_event) {
                            option.selected = true;
                            api.event = data[i].id;
                        }

                        klik_toolbar_settings_event.add(option);
                    };

                    app.storage.save_api_data();

                }, load_buffered_events);
            });

            if (!result) {
                api.env = old_env;
                this.cout('cancel', ':', 'staying in environment', api.env);
            }
        }

        if (param=='event') {
            api.event = value;
            app.storage.save_api_data();
            location.reload();
        }

        this.update_connection();
    }
    else {
        this.cout('no api');
    }
}


KlikToolbar.prototype.reload_interfaces = function() {
    this.cout('refresh', ':', 'reloading interfaces (not yet)');
}


KlikToolbar.prototype.reload_events = function(buffered=false) {
    if (!app.api) {
        this.cout('no api');
        return;
    }

    app.api.get_all_events(function(data) {
        
        klik_menu_clear(klik_toolbar_settings_event);

        for (var i=0; i<data.length; i++) {
            var option = document.createElement('option');
            option.text = data[i].id;
            klik_toolbar_settings_event.add(option);
        };

        klik_menu_select_value(klik_toolbar_settings_event, app.storage.api.event, false);

        // if we have new events we store them
        if (buffered==false) {
            app.storage.save_api_data();
        }

    }, buffered);
}


KlikToolbar.prototype.add_settings = function(module_name) {
    // console.log('add_settings module_name', JSON.stringify(module_name) );

    var scope    = 'klik_toolbar_settings_';
    var callback = 'klik_toolbar_settings_onclick(event)';
    var style    = 'width:100%; text-align:left;';

    if (module_name=='Infrastructure Manager') {
        var html = '<input type="range" min="0" max="1" step="0.05" value="'+map_opacity+'" onchange="set_map_opacity(event)"></input>';  
        html += klik_toolbar_create_checkboxes(KlikDeviceManager.toolbars);
        html += '<div class="klik_line"></div>'; 
        html += klik_toolbar_create_checkboxes(KlikDeviceManager.layers);
        html += '<div class="klik_line"></div>'
        html += klik_toolbar_create_checkboxes(KlikDeviceManager.supported_types);
        html += '<div class="klik_line"></div>';
        html += klik_toolbar_create_checkboxes(KlikDeviceManager.windows);

        klik_toolbar_settings.innerHTML = html;

        klik_toolbar_update_checkboxes();

        if (app.callbacks.on_app_ready) {
            app.callbacks.on_app_ready();
        }
    }
    else { 

        function get_dropdown_environments() {
            var data = [];
            var keys = Object.keys(app.api.environments);
            for (var i=0; i<keys.length; i++) {
                data.push({_i:scope+'env_'+keys[i], _l:keys[i]} )
            }
            return data;
        }

        var sections = {
            'Session' : [
                { _i:scope+'session_details', _l:'details' },
                { _i:scope+'session_login', _l:'log in' },
            ],
            'User' : [
                { _i:scope+'user_name', _l:'name' },
                { _i:scope+'user_role', _l:'role' },
            ],
            'dropdown:Environment' : get_dropdown_environments(),
            'dropdown:Event' : [],
            'Interfaces': []
        }

        for (k in AUTHORIZED_INTERFACES) {
            sections.Interfaces.push ({_i:scope+'interface_'+k  , _l:'no '+k.toUpperCase()} );
        }


        var self = this;

        for (var key in sections) {
            var settings = sections[key];

            // add section
            var section = add_node(klik_toolbar_settings, 'div', { _c:'klik_section'});

            var is_menu = false;
            if (key.match('dropdown')) {
                key = key.split(':')[1];
                is_menu = true;
            }

            // add label
            var label = add_node(section, 'label', { _l:key, _c:'small' });

            // add refresh button (only for Event and Interfaces)
            // console.log(key);

            if (key=='Event' || key=='Interfaces' ) {
                var btn = add_node(label, 'img', { 
                    _i:(scope+key+'_refresh').toLowerCase(), 
                    _c:'klik_toolbar_icon refresh sidebar'
                });

                btn.onclick = function(event) {

                    if (event.target.id=='klik_toolbar_settings_event_refresh') {
                        self.reload_events(false);
                    }

                    if (event.target.id=='klik_toolbar_settings_interfaces_refresh') {
                        self.reload_interfaces();
                    }
                }
            }

            if (is_menu) {
                // add dropdown menu
                var drop_down = add_node(section, 'select', {_i:scope+key.toLowerCase() ,_c:'dropdown'});
                for (var i=0; i<settings.length; i++) {
                    var option = document.createElement('option');
                    option.text = settings[i]._l;
                    drop_down.add(option);
                }
                drop_down.onchange = function(event) {
                    var param = event.target.id.substring(scope.length);
                    var value = event.target.value;
                    self.set_param(param, value);
                }
            }
            else {
                for (var i=0; i<settings.length; i++) {
                    Object.assign(settings[i], {_c:'small', _s:style, onclick:callback});
                    add_node(section, 'button', settings[i]);
                }
            }
        } 


        if (module_name=='Access Control Passive') {
            if (app.settings) {
                var section1 = add_node(klik_toolbar_settings, 'div', { _c:'klik_section' });
                add_node(section1, 'button', { _c:'small', _s:style, onclick:callback, _i:scope+'button_reset', _l:'reset bouncer' });
            }
        }

        else if (module_name=='Infrastructure Monitor' || module_name=='Tags Cleaner') {
            if (app.settings) {
                klik_monitor_populate_sidebar(scope, style);

                // var section1 = add_node(klik_toolbar_settings, 'div', { _c:'klik_section' });
                // add_node(section1, 'button', { _c:'small', _s:style, onclick:'show(config)', _i:scope+'button_data', _l:'show data' });
                // add_node(section1, 'button', { _c:'small', _s:style, onclick:'hide(config)', _i:scope+'button_data', _l:'hide data' });
            }
        }


        setTimeout(function() { 
            if (app.api) {
                var api = app.api;

                var getting_token = api.get_token(function(){

                    // when we dont have any buffered events
                    // we make sure we get events from the server
                    const load_buffered_events = (api.get_all_buffered_events().length!=0) ;

                    self.reload_events(load_buffered_events);

                    if (app.callbacks.on_app_ready) {
                        app.callbacks.on_app_ready();
                    }
                },);


                if (!getting_token) {
                    // console.log('not getting the token');
                    if (app.callbacks.on_app_ready) {
                        app.callbacks.on_app_ready();
                    }
                }
            }
        }, 100);
        

        setTimeout(function() { 
            self.update_connection();
        }, 1000);    
    }
   
}


var klik_toolbar_settings_onclick = function(event) {
    if ( 
        event.target.id == 'klik_toolbar_settings_session_details' ||
        event.target.id == 'klik_toolbar_settings_session_login' ||
        event.target.id == 'klik_toolbar_settings_user_name' ||
        event.target.id == 'klik_toolbar_settings_user_role' ) {

        klik_modal_open(event, klik_toolbar_on_modal_open);
        return;
    }

    for (var k in AUTHORIZED_INTERFACES) {
        if ( event.target.id == 'klik_toolbar_settings_interface_'+k) {
            klik_modal_open(event, function(evt) {
                tech.interfaces.setup_modal_view(k);
            });
            return;
        }
    }

    // console.log('unhandled');

    klik_modal_open(event);
}


var klik_toolbar_on_modal_open = function(event) {
    var scope = 'klik_toolbar_settings_';
    var target = event.target.id;

    switch (target) {
        case (scope+'session_details'): {
            tech.api.setup_modal_view('session_details');
            break;
        };

        case (scope+'session_login'): {
            tech.api.setup_modal_view('session_login');
            break;
        };

        case (scope+'user_name'): {
            tech.api.setup_modal_view('user_name');
            break;
        };

        case (scope+'user_role'): {
            tech.api.setup_modal_view('user_role');
            break;
        };

        default: {
            // console.log('no data found for', target)
            break;
        }
    }
}


KlikToolbar.prototype.update_connection = function() {
    if (app.ws) {
        klik_toolbar_settings_interface_ble.innerHTML = 'BLE ' +app.ws.host + ':' +app.ws.port;
    }

    if (app.ws_dmx) {
        klik_toolbar_settings_interface_dmx.innerHTML = 'DMX ' +app.ws_dmx.host + ':' +app.ws_dmx.port;
    }

    if (app.ws_uart) {
        klik_toolbar_settings_interface_uart.innerHTML = 'UART ' +app.ws_uart.host + ':' +app.ws_uart.port;
    }

    if (app.ws_osc) {
        klik_toolbar_settings_interface_osc.innerHTML = 'OSC ' +app.ws_osc.host + ':' +app.ws_osc.port;
    }

    if (app.api){
        if (app.api.env) {
            klik_menu_select_value(klik_toolbar_settings_environment, app.api.env, false);
        }

        if (app.api.user) {
            klik_toolbar_settings_user_name.innerHTML = app.api.user;
        }

        if (app.api.role) {
            klik_toolbar_settings_user_role.innerHTML = app.api.role;
        }
    }
}


KlikToolbar.prototype.add_menu = function(menu) {
    // this central dropdown menu in the toolbar

    var n = create_node('select', {id:menu.id, class:'klik_toolbar_menu', onchange : 'location=this.value' });

    if (menu.type=='overviews') {
        add_node(n, 'option', { value:'_.html'                   , _:'Overview'      });
        add_node(n, 'option', { value:'./klik/_.html'            , _:'Klik'          });
        add_node(n, 'option', { value:'./pixmob/_.html'          , _:'PixMob'        });
        add_node(n, 'option', { value:'./prototypes/_.html'      , _:'Prototypes'    });
    }
    else if (menu.type=='klik') {
        add_node(n, 'option', { value:'../_.html'                , _:'Overview'      });
        add_node(n, 'option', { value:'./_.html'                 , _:'Klik'          });
        add_node(n, 'option', { value:'../pixmob/_.html'         , _:'PixMob'        });
        add_node(n, 'option', { value:'../prototypes/_.html'     , _:'Prototypes'    });
    }
    else if (menu.type=='pixmob') {
        add_node(n, 'option', { value:'../_.html'                , _:'Overview'      });
        add_node(n, 'option', { value:'../klik/_.html'           , _:'Klik'          });
        add_node(n, 'option', { value:'./_.html'                 , _:'PixMob'        });
        add_node(n, 'option', { value:'../prototypes/_.html'     , _:'Prototypes'    });
    }       
    else if (menu.type=='prototypes') {
        add_node(n, 'option', { value:'../_.html'                , _:'Overview'      });
        add_node(n, 'option', { value:'../klik/_.html'           , _:'Klik'          });
        add_node(n, 'option', { value:'../pixmob/_.html'         , _:'PixMob'        });
        add_node(n, 'option', { value:'./_.html'                 , _:'Prototypes'    });
    }


    var items = APP_NAVIGATION_MENU[menu.type];

    for (var i in items) {
        var name = items[i].split('.')[0].split('_');
        for (var j in name) {
            name[j] = first_char_upper(name[j]);
        }
        name = name.join(' ');
        add_node(n, 'option', {value:items[i] , _:name});
    }
    return n;
}


var custom_settings = {
    layer_flags:{}
};


var klik_config_flags = [
    ['lock'     , 0 ],  // name, defaults
    ['visible'  , 1 ],  
    // ['update'   , 1 ], 
    // ['test'     , 0 ],
    // ['debug'    , 0 ],
    // ['log'      , 1 ],
];


 // create checkbox and initialized custom_settings with default values
 // assuming that we havent fetched the database config yet.
function klik_toolbar_create_checkboxes(array) {
    var html = '';
    for (var i=0; i<array.length; i++) {
        var defaults = [];
        html += "<div class='klik_cb'>";
        for (var j=0; j<klik_config_flags.length; j++) {

            var key = klik_config_flags[j][0];
            var val = klik_config_flags[j][1];
            var name = array[i]+"_"+key;

            defaults.push(val);
            html += "<input type='checkbox' ";
            if (val) {
                html += " checked "; 
            }

            if (key=='lock') {
                html += " hidden "; // currently dont want to see the lock buttons 
            }

            html += "onchange='klik_toolbar_settings_change(event)' name='"+name+"'/>";
            
        }
        html += array[i]+'</div>';
        // we use defaults
        // console.log('toolbar : initializing with defaults ' + array[i]+'.master : '+defaults);
        custom_settings.layer_flags[array[i]] = defaults;
    }
    return html;
}


function klik_toolbar_settings_change(e) {
    var parts = e.target.name.split('_');
    var key = null;
    var flag_name = parts[parts.length-1];

    if (flag_name==FLAG_NAME_VISIBLE || flag_name==FLAG_NAME_LOCK ) {
        key = parts[0];
        for (var i=1; i<parts.length-1; i++) {
            key+='_'+parts[i];
        }
    }
    else {
        return;
    }

    var value =  Number(e.target.checked);

    if (!custom_settings.layer_flags[key]) {
        custom_settings.layer_flags[key] = [0,0]; // init array
        console.log('just initialized custom_settings.layer_flags with key:', key);
    }

    if (flag_name==FLAG_NAME_VISIBLE) {
        custom_settings.layer_flags[key][FLAG_INDEX_VISIBLE] = value;
        klik_update_visible(key, 'master',  value);
    }
    else if (flag_name==FLAG_NAME_LOCK) {
        custom_settings.layer_flags[key][FLAG_INDEX_LOCK] = value;
        klik_update_lock(key, 'master', value);
    } 
    
    // console.log(JSON.stringify(custom_settings, klik_debug.inline_array, 2));
    klik_save_custom_settings();
}

function klik_save_custom_settings() {
    if (items.configs[0]) {
        lock = 1;
        items.configs[0].custom.settings = custom_settings;
        set_infrastructure(items.configs[0]);
        // console.log('saved custom settings');
    }
    else {
        console.log('not saving custom settings, no config available');
    }
}

