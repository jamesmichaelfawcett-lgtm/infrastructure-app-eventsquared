// by JSR <jsr@pixmob.com>


const KLIK_CONTENT_USER_ROLE_TITLE = "Roles";
const KLIK_CONTENT_USER_ROLE_NOTES = "\
<div style='text-align:left' class='font_medium'>\
<p><a class='bright'>\'Employee and Partners\'</a> have access to release notes and other sensitive info</p>\
<p><a class='bright'>\'Organizer who can deploy\'</a> has access to hubs and deployments</p>\
<p><a class='bright'>\'Organizer\'</a> has full access to an event</p>\
<p><a class='bright'>\'Content Manager\'</a> manages all event content except attendees</p>\
<p><a class='bright'>\'Onsite Manager\'</a> manages attendees and exhibitors; can override access control rules</p>\
<p><a class='bright'>\'Staff\'</a> manages attendees</p>\
<p><a class='bright'>\'Staff who cannot create\'</a> manages attendees, but can't create new attendees</p>\
<p><a class='bright'>\'Read Only\'</a> can see all content but not modify</p>\
</div>";


// -----------------------------------------------------------------
// constructor
// -----------------------------------------------------------------

KlikApi = function() {
    this.label = 'api';

    this.environments = {
        'prod' : {
            api : 'https://api.klik.co',
            loc : 'https://locator.klik.co'
        },
        'staging' : {
            api : 'https://api.staging.klik.co',
            loc : 'https://locator.staging.klik.co'
        },
        'test' : {
            api : 'https://api.test.klik.co',
            loc : 'https://locator.test.klik.co'
        },
        // 'demo' : {
        //     api : 'https://api.demo.klik.co',
        //     loc : 'https://locator.demo.klik.co'
        // }
    }

    this.logged_in = false;

    this.user  = tech.storage.api.user;
    this.env   = tech.storage.api.env;
    this.event = tech.storage.api.event;

    // just making sure that storage.api is up to date with 
    // the refresh and access tokens
    if (tech.storage.api.refresh_tokens==null) {
        tech.storage.api.refresh_tokens = { prod:null, staging:null, test:null, demo:null };
    }

    if (tech.storage.api.access_tokens==null) {
        tech.storage.api.access_tokens = { prod:null, staging:null, test:null, demo:null };
    }

    if (tech.storage.api.buffered_events==null) {
        tech.storage.api.buffered_events = { prod:[], staging:[], test:[], demo:[] };
    }

    if (tech.storage.api.roles==null) {
        tech.storage.api.roles = {};
    }


    // set access and refresh tokens for all env
    this.refresh_tokens  = tech.storage.api.refresh_tokens; 
    this.access_tokens   = tech.storage.api.access_tokens; 
    this.buffered_events = tech.storage.api.buffered_events; 
    this.roles           = tech.storage.api.roles;

    this.update_roles();

    // allow user to pass some query parameters
    this.parse_query_params(['user', 'pass', 'event', 'env']);

    this.autorun_interval = null;

    this.fetch = {
        infra           : true, // default = true
        locations       : false,
        maps            : false,
        bridges         : false,
        attendees       : false,
        devices         : false,
        sessions        : false,
        config          : false, // event config
        live_stats      : false,
        zone_stats      : false,
        bridges_stream  : false, 
        events_stream   : false, 
    }

    return this;
};


KlikApi.prototype.cout = function() {
    var args = Array.from(arguments);
    args.splice(0,0, this.label+' >');
    cout.apply(this, args);
}  


KlikApi.prototype.setup_modal_view = function(view_type) {

    switch (view_type) {
        case 'session_details' : {
            this.get_session_details();
            break;
        };

        case 'session_login' : {
            this.get_session_login();
            break;
        };

        case 'user_role' : {
            this.get_user_role();
            break;
        };

        case 'user_name' : {
            this.get_user_name();
            break;
        };

        default:
            this.cout('error', ':', 'unable to setup modal view :', view_type);
            break;
    }
}


KlikApi.prototype.get_user_role = function() {
    modal_label.innerHTML = KLIK_CONTENT_USER_ROLE_TITLE;
    modal_notes.innerHTML = KLIK_CONTENT_USER_ROLE_NOTES;
}


KlikApi.prototype.get_user_name = function() {
    modal_label.innerHTML = 'User'; 
    modal_notes.innerHTML = 'in order to change user, you will be logged out first'; 
  
    modal_btn_1.innerHTML = 'Change User';

    var self = this;
    modal_btn_1.onclick = function() {

        // clear ui
        klik_toolbar_settings_user_name.innerHTML = self.user;

        // clear api user and tokens
        app.api.user = null;
        app.api.reset_tokens_and_save();

        // force a page refresh;
        setTimeout(function() {
            console.log("force refresh");
            location.reload();  
        }, 500)
    };

    modal_btn_2.innerHTML = 'Cancel';
    modal_btn_2.onclick = klik_modal_close;
}


KlikApi.prototype.get_session_login = function() {
    var self = this;

    if (this.logged_in) {
        modal_label.innerHTML = 'Session Log Out'; 
        modal_notes.innerHTML = 'if you confirm, you will be logging out of the "'+this.env+'" environment';

        modal_btn_1.onclick = function() {

            // clear ui
            klik_toolbar_settings_user_name.innerHTML = 'no user';
            klik_toolbar_settings_user_role.innerHTML = 'no role';

            // clear data : user, roles, events, tokens
            self.user = null;
            self.roles = {};

            self.buffered_events.prod = [];
            self.buffered_events.staging = [];
            self.buffered_events.test = [];
            self.buffered_events.demo = [];

            self.reset_tokens_and_save();

            // force a page refresh;
            // setTimeout(function() {
            //     location.reload();  
            // }, 500)

            klik_modal_close();
        };
    }
    else {
        modal_label.innerHTML = 'Session Log In';
        modal_notes.innerHTML = 'if you confirm, you will be logging in to the "'+this.env+'" environment';
        
        modal_btn_1.onclick = function() {
            klik_toolbar_settings_user_name.innerHTML = 'new user';
            klik_toolbar_settings_user_role.innerHTML = 'new role';
            klik_modal_close();
        };
    }

    modal_btn_1.innerHTML = 'Confirm';
    modal_btn_2.innerHTML = 'Cancel';
    modal_btn_2.onclick = klik_modal_close;
}


KlikApi.prototype.update_roles = function() {
    if (this.roles['*']) {
        this.role = this.roles['*'];
        this.authorized_events = 'all'; 
    }
    else {
        this.role = this.roles[this.event];
        this.authorized_events = Object.keys(this.roles);
    }
}


KlikApi.prototype.get_session_details = function() {
    modal_label.innerHTML = 'Session Details'; 
    if (!this.logged_in) {
        modal_notes.innerHTML = 'You are not logged in'; 
        return;
    }

    this.update_roles();

    var items = {
        'environment'   : this.env,
        'event'         : this.event,
        'user'          : this.user,
        'role'          : this.role,
        'events loaded' : this.buffered_events[this.env].length,
        'url api'       : this.environments[this.env].api,
        'url locator'   : this.environments[this.env].loc,
        'status'        : '',
    }

    var html = '<div id="session_details" class="font_medium" style="text-align:left; line-height:1.0;">';
    for (k in items) {
        html += '<p>';
        var val = ''+items[k];

        if (val.match('http')) {
            var url = val;
            html += '<div class="bright pad_left">'+k+'</div>';
            html += '<a style="text-decoration:none" href="'+ url+'">'+url+'</a>';
        }
        else if (k == 'status') {
            html += '<div class="font_small" style="margin-left:110px;" id="session_details_status">';
            html += klik_highlight(this.roles);
            html += '</div>';
        }
        else {
            html += '<div class="bright pad_left">'+k+'</div>';
            html += val;
        }
        html += '</p>';
    }
    html += '</div>';

    // load some urls
    for (k in items) {
        var val = ''+items[k];
        if (val.match('http')) {
            klik_http_get(val, null, function(data) {
                by_id("session_details_status").innerHTML += klik_highlight(data); 
            });
        }
    }

    modal_notes.innerHTML = html;
}


KlikApi.prototype.parse_query_params = function(params) {
    for (var i = 0; i < params.length; i++) {
        var val = query_param(window.location, params[i]);
        if (val) {
            this[params[i]]=val;
        }
    }
}


KlikApi.prototype.get_data = function() {
    if (!this.access_tokens[this.env]) {
        return;
    }

    if (this.fetch.maps) {
        this.get_all_maps();
    }

    if (this.fetch.bridges) {
        this.get_all_bridges();
    }

    if (this.fetch.infrastructures) {
        this.get_all_infrastructures();
    }

    if (this.fetch.locations) {
        this.get_all_locations();
    }

    if (this.fetch.attendees) {
        this.get('/attendees/stats');
        this.get_all_attendees();
    }
    
    // if (this.fetch.devices) {
    //     this.get_all_devices();
    // }

    if (this.fetch.sessions) {
        this.get_all_sessions();
    }

    if (this.fetch.config) {
        this.get_config();
    }

    if (this.fetch.live_stats) {
        this.get_live_stats();
    }

    if (this.fetch.zone_stats) {
        this.get_zone_stats();
    }

    if (this.fetch.bridges_stream) {
        this.get_bridges_stream();
    }

    if (this.fetch.events_stream) {
        this.get_events_stream();
    }
}


KlikApi.prototype.autorun = function(interval=3000, environment=null, event=null) {
    if (!tech.online) {
        this.cout('error', ':', 'first connect to the web');
        return
    }

    clearInterval(this.autorun_interval); // clear previous autoruns

    if (environment) {
        this.env = environment;
    }
    if (event) {
        this.event = event;
    }

    this.cout('env   = '+this.env);
    this.cout('event = '+this.event);

    // get data every n seconds
    var self = this;
    this.get_data();
    this.autorun_interval = setInterval(function() { 
        self.get_data();
    }, interval);  

    return this;
}


KlikApi.prototype.get_environment_names = function() { 
    return Object.keys(this.environments)
};


// -----------------------------------------------------------------
// environment urls
// -----------------------------------------------------------------
// url_base    : bridges, events, devices
// url_event   : maps, locations, infrastructures, attendees, sessions
// url_locator : tracking, zones, zone stats, device reports, device events, device stats, bridge steams


KlikApi.prototype.access_token_inline = function() { 
    return 'access_token='+this.access_tokens[this.env];
}


KlikApi.prototype.url_base = function(path) { 
    return this.environments[this.env].api + '/' + path + '?'; 
}

KlikApi.prototype.url_base_with_token = function(path) { 
    return this.url_base(path) + this.access_token_inline(); 
}


KlikApi.prototype.url_event = function(path) { 
    return this.environments[this.env].api + '/events/'+ this.event + path + '?';  
}

KlikApi.prototype.url_event_with_token = function(path) { 
    return this.url_event(path) + this.access_token_inline(); 
}


KlikApi.prototype.url_locator = function(path) { 
    return this.environments[this.env].loc + '/events/'+ this.event + path + '?'; 
}

KlikApi.prototype.url_locator_with_token = function(path) { 
    return this.url_locator(path) + this.access_token_inline(); 
}


// -----------------------------------------------------------------
// token
// -----------------------------------------------------------------

const TOKEN_LIMIT_MILLISECONDS = 3600000 * 10 // using 10 hrs, and 12 hrs is the limit on the server


// 2018-12-12
// - changed authorization to "Bearer access_token" for all requests


// 2018-02-21 
// - changed the mechanics inside the get_token function : 

// 1. always try to use an existing access_token
// 2. if it fails try to use an existing refresh_token to get a new access_token
// 3. if all previous steps fail just ask for user and password

// Notes : 
// Everytime the app restart (when : the main page _.html loads), 
// - we clear all access_tokens
// - but keep the refresh_tokens and use the one for the current env
// - only once this will result in a longer loading period, but no user input will be needed

// to force a reset of all tokens just 
// - set the api.user to null


KlikApi.prototype.set_logged_in = function(value) {
    this.logged_in = value;

    if (check_node('klik_toolbar_settings_session_login')) {
        if (value) {
            klik_toolbar_settings_session_login.innerHTML = 'log out';
        }
        else {
            klik_toolbar_settings_session_login.innerHTML = 'log in';
        }
    }
}


KlikApi.prototype.reset_tokens = function() {
    this.reset_access_tokens();
    this.reset_refresh_tokens();
}


KlikApi.prototype.reset_tokens_and_save = function() {
    this.reset_tokens();
    tech.storage.save_api_data();
}


KlikApi.prototype.reset_access_tokens = function() {
    this.set_logged_in(false);
    this.cout('tokens', ':', 'resetting access tokens');
    this.access_tokens = { prod:null, staging:null, test:null, demo:null };
}


KlikApi.prototype.reset_refresh_tokens = function() {
    this.cout('tokens', ':', 'resetting refresh tokens');
    this.refresh_tokens = { prod:null, staging:null, test:null, demo:null };
}


KlikApi.prototype.get_token = function(callback=null) {

    if (!tech.online) {
        this.cout('error', ':', 'please connect to a network first');
        this.set_logged_in(false);
        return false;
    }

    var credentials = null;

    // 1. user and access token
    if ( this.user && this.access_tokens[this.env] ) {
        this.cout('token', ':', 'using access token :', this.user, this.env);
        
        if (callback) {
            callback();
        }

        this.set_logged_in(true);
        return true;
    }

    // 2. user and refresh token
    if ( this.user && this.refresh_tokens[this.env] ) {

        credentials = {
            'client_id'     : 'zonetuner',
            'grant_type'    : 'refresh_token',
            'refresh_token' : this.refresh_tokens[this.env],
        } 

        this.cout('token', ':', 'using refresh token :', this.user);
    }

    // 3. else , just reset the tokens and prompt the user
    else {

        username = null;
        if (this.user) {
            username = klik_prompt('Please enter a user name valid for the '+ this.env +' environment', this.user);
        }
        else {
            username = klik_prompt('Please enter a user name valid for the '+ this.env +' environment');
        }
        
        if (!username ) {
            return false;
        }

        this.user = username;
        this.refresh_tokens[this.env] = null; 
        this.access_tokens[this.env] = null;

        password = klik_prompt('Please enter the password for '+this.user, true);
        if (!password) {
            return false;
        }
        this.pass = password

        if (!this.user || !this.pass) {
            tech.cout('you need to provide a username and a password');
            return false;
        }


        credentials = {
            'client_id'  : 'zonetuner',
            'grant_type' : 'password', 
            'username'   : 'email:'+this.user, 'password':this.pass, 
        }

        this.cout('getting new token for user :', this.user);
    }

    // console.log(credentials);

    var self = this;

    var login = function(login_credentials) {

        klik_http_post(self.environments[self.env].api + '/login', login_credentials,

            // on success :
            function(result) {
                self.cout('access granted');

                // console.log(result);

                // result.additional_domains
                // result.admin_token
                // result.attendee_domains
                // result.attendee_events
                // result.attendee_token
                // result.domain
                // result.expires_in
                // result.has_password
                // result.is_exhibitor
                // result.is_organizer
                // result.language
                // result.purchaser_events
                // result.roles
                // result.token_type

                // which events can this user access
                self.roles = result.roles;
                self.update_roles();
                
                // tokens
                self.access_tokens[self.env]  = result.access_token;
                self.refresh_tokens[self.env] = result.refresh_token;

                // save 
                tech.storage.save_api_data();

                self.set_logged_in(true);

                if (callback) {
                    callback(result);
                }
            },

            // on fail : 
            function(result) {

                // handle multi factor authentication
                if (result.status == 202) {
                    var data = JSON.parse(result.message);

                    login({
                        client_id    : 'zonetuner',
                        grant_type   : 'one_time_password',
                        mfa_token    : data.mfa_token,
                        method_id    : "" + data.methods[0].id,
                        method_token : klik_prompt('Please enter the code for ' + data.methods[0].name)
                    });
                }
                else if (result.status == 404) {
                    self.cout('error', ':', 'failed to gain access, trying again');
                    self.get_token(callback);
                }
                else {
                    self.cout('error', ':', 'failed to gain access, resetting tokens, starting over');
                    self.reset_tokens_and_save();
                    self.get_token(callback);
                }
            }
        );
    }

    login(credentials);
    return true;
}




// -----------------------------------------------------------------
// configuration
// -----------------------------------------------------------------
// https://api-staging.klik.co/events/DeviceManager/conf/features?access_token...

KlikApi.prototype.get_config = function(callback) {
    this.cout('loading', ':', 'config');

    var url = this.url_event('/conf/features');

    klik_http_get(url, '/config', callback, null, this.get_authorization() );
}


KlikApi.prototype.set_tag_tracking = function(state, callback) {
    klik_http_put(this.url_event('/conf/features'), {'tag_tracking': state}, callback, null, this.get_authorization() );
}


// -----------------------------------------------------------------
// broadcast
// -----------------------------------------------------------------
// POST
// {{base_url}}/events/{{event_id}}/infra/{{infra_id}}
//
// with body: 
// {
//     “payload”: “17070942524f5352560effee00efbe0f2023000000000000”,
//     “duration”: 10,
//     “interval”: 0.1
// }
// uses the local name BROSRV to broadcast a payload 

// deprecated : 

// KlikApi.prototype.broadcast = function(infra_id, payload, duration=10.0, interval=0.1, callback=null) {

//     var data = {
//         'payload': payload,
//         'duration': duration,
//         'interval': interval,
//     }

//     klik_http_post(this.url_event('/infra/'+infra_id), data, function(result) {
//         if (callback) {
//             callback(result); 
//         }
//     }, null, this.get_authorization() );
// }



// {
//     "payload_field" : "a34e1e081317ff",
//     "duration" : 60,
//     "localname" : "BROPADx"
// }

KlikApi.prototype.broadcast = function(infra_id, payload, duration=10.0, localname=null, callback=null) {

    var data = {
        'payload_field': payload,
        'duration': duration
    }

    if (localname) {
        data.localname = localname
    }

    klik_http_post(this.url_event('/infra/'+infra_id), data, function(result) {
        if (callback) {
            callback(result); 
        }
    }, null, this.get_authorization() );
}



// -----------------------------------------------------------------
// ipad as a hub
// -----------------------------------------------------------------
// POST
// {{base_url}}/events/{{event_id}}/tracking
//
// with body: 
// {
//     'beacon': 'mybeacon', 
//     'rssi': 39, 
//     'payload': '08', 
//     'local_name': 'PIXHVBR'
// }
//
// need to hit the locator api
// Payload is hex-encoded value of the 0xFF BLE data, and local_name is just normal ascii text. 

KlikApi.prototype.forwarder = function(beacon_id, packet_from_ipad, callback=null) {
    var data = {
        'beacon': beacon_id, 
        'rssi': 100+packet_from_ipad.rssi,  // ipad RSSI is negative and -90 is far, -20 is close
        'payload': (packet_from_ipad.payload)?klik_array_to_hex_string(packet_from_ipad.payload):"", 
        'local_name': packet_from_ipad.name
    }

    klik_http_post(this.url_locator('/tracking'), data, function(result) {
        if (callback) {
            callback(result); 
        }
    }, null, this.get_authorization() );
}


KlikApi.prototype.filtered_forwarder = function(filter, beacon_id, packet_from_ipad, callback=null) {
    var cmd_code = packet_from_ipad.payload[0];
    var decoder = klik_decoder_map[cmd_code];

    if (!decoder || decoder==undefined) {
        tech.cout('no decoder for cmd_code :', cmd_code)
        return;
    }

    // filter = ['bookmarks', 'friends', 'tags']
    for (var i=0; i<filter.length; i++) {
        if (decoder.name==filter[i]) {
            this.forwarder(beacon_id, packet_from_ipad, callback);
            return;
        }
    }
}


KlikApi.prototype.get_authorization = function() {
    return 'Bearer ' + this.access_tokens[this.env];
} 


// https://api-staging.klik.co/events/project_x/sessions

// -----------------------------------------------------------------
// get
// -----------------------------------------------------------------

KlikApi.prototype.get = function(namespace, callback=null, query=null) {
    
    // define some callbacks
    self = this;

    var on_success = function(data) {
        if (namespace=='/events') {
            self.buffered_events[self.env] = data;
        }

        if (callback) {
            callback(data);
        }

        if (data.length) {
            self.cout('loaded', ':', data.length+' '+namespace );
        }
    }


    var on_failure = function() {
        self.reset_access_tokens(); // if you get something like 'expired access token message' you reset the access_tokens
        self.get_token(callback); // and try again
    }


    this.cout('loading', ':', namespace);

    // url_base : bridges, events, devices
    if (namespace=='/bridges' || namespace=='/events') {
        url = this.url_base(namespace);
    }

    // url_event : maps, locations, infra, attendees, sessions
    else { 
        url = this.url_event(namespace);
    }

    // special case
    url = url.replace('/infrastructures', '/infra')

    if (query) {
        url += query;
    }

    this.url = url;


    klik_http_get(url, namespace, on_success, on_failure, this.get_authorization() );
}



// get all
KlikApi.prototype.get_all_bridges = function(callback) {
    this.get('/bridges', callback );
}


KlikApi.prototype.get_all_events = function(callback, buffered=false) {
    if (buffered) {
        callback(this.buffered_events[this.env]);
        this.cout('events', ':', this.env, '- loaded', this.buffered_events[this.env].length, 'events from buffer');
    }
    else {
        this.cout('events', ':', 'loading events from server');
        this.get('/events', callback, '&managed=true&archived=false');
    }
} 


KlikApi.prototype.get_all_archived_events = function(callback) {
    this.get('/events', callback, '&managed=true&archived=true'); 
} 


KlikApi.prototype.get_all_buffered_events = function() {
   return this.buffered_events[this.env] ;
}


// this was too heavy
// KlikApi.prototype.get_all_devices   = function(callback) { this.get('/devices'   , callback, '&query=DeviceManager' ); }


// get all, by event
KlikApi.prototype.get_all_maps              = function(callback) { this.get('/maps'             , callback, '_lang=fr' ); } // new
KlikApi.prototype.get_all_locations         = function(callback) { this.get('/locations'        , callback ); }
KlikApi.prototype.get_all_infrastructures   = function(callback) { this.get('/infrastructures'  , callback ); }
KlikApi.prototype.get_all_attendees         = function(callback) { this.get('/attendees'        , callback, 'limit=1000' ); }
KlikApi.prototype.get_all_sessions          = function(callback) { this.get('/sessions'         , callback ); }


// get one
KlikApi.prototype.get_map                   = function(id, callback) { this.get('/maps/'+id             , callback); }
KlikApi.prototype.get_location              = function(id, callback) { this.get('/locations/'+id        , callback); }
KlikApi.prototype.get_infrastructure        = function(id, callback) { this.get('/infrastructures/'+id  , callback); }
KlikApi.prototype.get_attendee              = function(id, callback) { this.get('/attendees/'+id        , callback); }
KlikApi.prototype.get_session               = function(id, callback) { this.get('/sessions/'+id         , callback); }



// -----------------------------------------------------------------
// set
// -----------------------------------------------------------------

var conform = {
    bridges         : conform_bridge,
    infrastructures : conform_infrastructure,
    attendees       : conform_attendee,
    locations       : conform_location,
}


KlikApi.prototype.set = function(namespace, data, callback) {
    var obj = {} 
    var url = '';

    // url_base : bridges, events, devices
    if (namespace=='/bridges') {
        url = this.url_base(namespace+'/'+data.addr);
    }

    // url_event : maps, locations, infrastructures, attendees
    else if (namespace=='/locations') {
        url = this.url_event(namespace+'/'+data.name);
    }
    else if (namespace=='/attendees' || namespace=='/infrastructures') {
        url = this.url_event(namespace+'/'+data.id);
    }
    else {
        console.log('cannot set this', namespace, data)
        return;
    }

    obj = conform[namespace.substring(1)](data); // striping the '/', and using it as the key

    url = url.replace('/infrastructures', '/infra');

    klik_http_put(url, obj, callback, function() {
        self.reset_access_tokens();
        self.get_token(callback);
    }, this.get_authorization() );
}


KlikApi.prototype.set_bridge = function(data, callback) {
    this.cout('set_bridge', ':',  data.addr);
    this.set('/bridges', data, callback);
}


KlikApi.prototype.set_infrastructure = function(data, callback) { 
    this.cout('set_infrastructure', ':', data.id);
    this.set('/infrastructures', data, callback);
}


KlikApi.prototype.set_location = function(data, callback) {
    this.cout('set_location', ':', data.name);
    this.set('/locations', data, callback);
}


KlikApi.prototype.set_attendee  = function(data, callback) {
    this.cout('set_attendee', ':',  data.id);
    this.set('/attendees', data, callback);
}


// -----------------------------------------------------------------
// delete
// -----------------------------------------------------------------
// curl 'https://api.klik.co/events/DeviceManager/infra/TAG6666?access_token=


KlikApi.prototype.delete = function(namespace, item, callback) {
    var url = '';

    // locations
    if (namespace=='/locations') {
        url = this.url_event(namespace+'/'+item.name);
    }

    // attendees, maps, infrastructures
    else { 
        url = this.url_event(namespace+'/'+item.id);
    }

    url = url.replace('/infrastructures', '/infra');

    klik_http_delete(url, callback, null, this.get_authorization() );
}


KlikApi.prototype.delete_map            = function(item, callback) { this.delete('/maps'           , item, callback); }
KlikApi.prototype.delete_infrastructure = function(item, callback) { this.delete('/infrastructures', item, callback); }
KlikApi.prototype.delete_location       = function(item, callback) { this.delete('/locations'      , item, callback); }
KlikApi.prototype.delete_attendee       = function(item, callback) { this.delete('/attendees'      , item, callback); }


// -----------------------------------------------------------------
// pairing
// -----------------------------------------------------------------


KlikApi.prototype.pair_user_to_device = function(user_id, device, callback_success=null, callback_error=null) {
    var url = this.url_event('/attendees/'+user_id+'/devices');
    klik_http_post(url, device, callback_success, callback_error, this.get_authorization() );
}


KlikApi.prototype.unpair_user_from_device = function(user_id, device, callback_success=null, callback_error=null) {
    var url = this.url_event('/attendees/'+user_id+'/devices/'+device.id);
    klik_http_delete(url, callback_success, callback_error, this.get_authorization() );
}



// -----------------------------------------------------------------
// add
// -----------------------------------------------------------------


KlikApi.prototype.add = function(namespace, data, callback) {
    var obj = {};
    var url = '';

    if (namespace=='/infrastructures') {
        url = this.url_event('/infra/'+data['id']);
        obj = conform_infrastructure(data);
    }
    else if (namespace=='/locations') {
        url = this.url_event('/locations/'+data['name']);
        obj = conform_location(data);
    }
    else {
        return;
    }

    klik_http_put(url, obj, callback, null, this.get_authorization() );
}


KlikApi.prototype.add_infrastructure = function(data, callback) { this.add('/infrastructures', data, callback); }
KlikApi.prototype.add_location       = function(data, callback) { this.add('/locations', data, callback); }



// -----------------------------------------------------------------
// conforming
// -----------------------------------------------------------------


// Reference
// ---
// writable fields for a user / attendee :
// https://git.pixmob.com/connect/PIXConnectSDK/blob/dev/PixMobConnectSDK/PIXConnectUser.m

function conform_attendee(data)  {

    var authorized = [
        'first_name',
        'last_name',
        'email',
        'city',
        'state',
        'company', 
        'occupation',
        'checked_in',
        'terms_and_conditions_accepted', 
        'opt_out',
        'custom_fields',
        'group'
    ];

    var obj = {};
    for (var key in data) {
        var valid = false;
        for (var i=0; i<authorized.length; i++) {
            if (key===authorized[i]) {
                valid = true;
                continue;
            }
        }
        if (valid && data[key]) {
            obj[key] = data[key];
        }
    }
    return obj;
}


function conform_infrastructure(data)  {
    var obj = {};
    obj.id          = data.id;
    obj.type        = data.type;
    obj.name        = data.name; 
    obj.description = data.description; 
    obj.x           = data.norm[0];
    obj.y           = data.norm[1];
    obj.custom      = data.custom;
    obj.map         = data.map;
   
    if (obj.type=='beacon') {
        obj.mac      = data.mac ; 
        obj.event_id = data.event_id;  
    }
    return obj;
}


function conform_location(data)  {
    var obj = {};
    obj.name         = data.name;
    obj.map          = data.map;
    
    obj.coordinates  = data.coordinates;

    // removed : tag selector is now always decided by the server
    // ---
    // obj.tag_selector = data.tag_selector;

    // temp bugfix for not overwritting the multi language zone names
    // ---
    // obj.display_name = data.display_name; 


    obj.tuning = {};

    var valid_keys = [
        'type',
        'min_certainty', 
        'sample_ratio',
        'samples',
        'stickiness',
        'threshold',
        'timeout',
        // 'beacons',   // beacons are not being used anymore
        // 'tags',      // tags list is specified by the server
    ]

    for (var k in data.tuning) {
        for (var i=0; i<valid_keys.length; i++) {
            if (valid_keys[i]==k) {
                obj.tuning[k] = data.tuning[k];
                continue;
            }
        }
    };

    return obj;
}


function conform_bridge(data)  {
    var obj = {};
    obj.event = data.event;
    return obj;
}



// -----------------------------------------------------------------
// Locator API
// -----------------------------------------------------------------
// GET /events/{event_id}/zones/{zone}/devices
// GET /events/{event_id}/devices/{device_id}/reports
// GET /events/{event_id}/devices/{device_id}/events
// GET /events/{event_id}/devices/stats

KlikApi.prototype.get_devices_in_zone = function(zone_id, callback) {
    klik_http_get(this.url_locator('/zones/'+zone_id+'/devices'), null, callback, null, this.get_authorization() );
}


KlikApi.prototype.get_device_reports = function(device_id, callback) {
    klik_http_get(this.url_locator('/devices/'+device_id+'/reports'), null, callback, null, this.get_authorization() );
}


KlikApi.prototype.get_device_events = function(device_id, callback) {
    klik_http_get(this.url_locator('/devices/'+device_id+'/events'), null, callback, null, this.get_authorization() );
}


KlikApi.prototype.get_devices_stats = function(callback) {
    klik_http_get(this.url_locator('/devices/stats')+'since=60', 'devices_stats', callback, null, this.get_authorization() );
}


KlikApi.prototype.get_zone_stats = function() {
    this.get_devices_stats(function(data) {
        app.callbacks.on_app_data('zone_stats', data);
    });
}




// LIVE STATS - ALL ZONES
// GET /events/{event_id}/zones/stats

KlikApi.prototype.get_live_stats = function(callback) {
    klik_http_get(this.url_locator('/zones/stats'), 'live_stats', callback, null, this.get_authorization() );
}


// LIVE STATS PER ZONE
// GET /events/{event_id}/zones/{zone}/stats

KlikApi.prototype.get_live_stats_per_zone = function(zone_id, callback) {
    klik_http_get(this.url_locator('/zones/'+zone_id+'/stats'), null, callback, null, this.get_authorization() );
}


// BRIDGE STREAM
// GET /events/{event_id}/bridges/stream

KlikApi.prototype.get_bridges_stream = function (callback) { 
    var self = this;
    var source = new EventSource(this.url_locator_with_token('/bridges/stream')+'&fmt=json');
    source.addEventListener('message', function (msg) {
        var data = JSON.parse(msg.data)
        app.callbacks.on_app_data('bridges_stream', data);
        if (callback) {
            callback(data);
        }
    }, false);
}


// DEVICES EVENTS STREAM

// old : locator.klik.co
// GET /events/{event_id}/devices/events/stream

// new : api.klik.co
// GET /events/{event_id}/integrations/event_stream

// types
// tracking.location.enter
// tracking.location.leave

KlikApi.prototype.get_events_stream = function (callback) { 
    var self = this;

    var source = new EventSource(this.url_event_with_token('/integrations/event_stream')+'&event_types=device_report');
    
    // var source = new EventSource(this.url_event_with_token('/integrations/event_stream')+'event_types=device_report,bookmark');
    
    source.addEventListener('message', function (msg) { 
        var data = JSON.parse(msg.data)
        app.callbacks.on_app_data('events_stream', data);
        if (callback) {
            callback(data);
        }
    }, false);
}



// -----------------------------------------------------------------
// not working :
// -----------------------------------------------------------------

// STREAM DEVICE EVENTS
// GET /events/{event_id}/devices/{device_id}/events/stream
// 
// KlikApi.prototype.stream_device_events = function (device_id, callback) { 
//     var self = this;
//     var source = new EventSource(this.url_locator('/devices/'+device_id+'/events/stream')+'types=device_report');  // &limit=10&timelimit=60
//     source.addEventListener('message', function (msg) { 
//         if (callback) 
//             callback(JSON.parse(msg.data));
//     }, false);
// }

// GET DEVICES IN ZONE

// STREAM EVENTS FOR A SPECIFIC ZONE
// GET /events/{event_id}/zones/{zone_name}/events/stream

