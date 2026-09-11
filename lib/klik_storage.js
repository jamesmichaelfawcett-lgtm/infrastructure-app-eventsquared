// by JSR <jsr@pixmob.com>


KlikStorage = function(app_uid) {
    this.label = 'storage';
    this.app_uid = app_uid;

    this.cout('init', ':', this.app_uid, '::', 'KlikStorage');
    this.load();
    // this.infos(); 
}


KlikStorage.prototype.cout = function() {
    var args = Array.from(arguments);
    args.splice(0,0, this.label+' >');
    cout.apply(this, args);
}  


KlikStorage.prototype.get_default_app_data = function() {
    return {
        version : APP_VERSION,
        build   : APP_BUILD,
        date    : APP_DATE,
        time    : null
    }
}


KlikStorage.prototype.get_default_api_data = function() {
    return  {
        time    : null,
        env     : KLIK_API_DEFAULT_ENV,
        event   : KLIK_API_DEFAULT_EVENT, 
        user    : null,
       
        access_tokens : { 
            prod    : null, 
            staging : null, 
            test    : null,
            demo    : null 
        },

        refresh_tokens : { 
            prod    : null, 
            staging : null, 
            test    : null,
            demo    : null 
        },

        buffered_events : { 
            prod    : [], 
            staging : [], 
            test    : [],
            demo    : [] 
        },

        roles : {

        }
    };
}


KlikStorage.prototype.get_default_websocket_data = function() {
    return { 
        host    : KLIK_WS_DEFAULT_HOST, 
        port    : KLIK_WS_DEFAULT_PORT, 
        protocol: KLIK_WS_DEFAULT_PROTOCOL,
        time    : null,
    };
}


KlikStorage.prototype.infos = function() {
    console.log(this.app);
    console.log(this.api);
    console.log(this.user);
    console.log(this.websocket);
}   


// save everything
KlikStorage.prototype.save = function() {
    this.save_app_data();
    this.save_api_data();
    this.save_websocket_data();
    // this.infos();
    this.cout('save', ':', 'complete');
}


// console.log(this.app.version, 'vs', APP_VERSION);
// console.log(this.app.build, 'vs', APP_BUILD);
// console.log(this.app.date, 'vs', APP_DATE);

// if (this.app.version != APP_VERSION ||
//  this.app.build != APP_BUILD ||
//  this.app.date != APP_DATE) 
// { 
//  // revert to defaults
//  this.default_app_data();
//  return false;
// }


// load everything
KlikStorage.prototype.load = function() {
    this.load_app_data();
    this.load_api_data();
    this.load_websocket_data();

    // console.log(this.app.version, 'vs', APP_VERSION);
    // console.log(this.app.build, 'vs', APP_BUILD);
    // console.log(this.app.date, 'vs', APP_DATE);

    // time since you last saved (in seconds)
    // var t = time_since(this.app.time/1000);
    // console.log('time since', t);


    if (this.app.version !== APP_VERSION || 
        this.app.build !== APP_BUILD || 
        this.app.date !== APP_DATE ) 
    { 
        this.app = this.get_default_app_data();
        this.save_app_data();
    }

    if (this.websocket.host!==KLIK_WS_DEFAULT_HOST || 
        this.websocket.port!==KLIK_WS_DEFAULT_PORT || 
        this.websocket.protocol!==KLIK_WS_DEFAULT_PROTOCOL ) 
    { 
        this.websocket = this.get_default_websocket_data();
        this.save_app_data();
    }
    this.cout('load', ':', 'complete');
}


// localStorage.removeItem(NAMESPACE_APP);
// localStorage.removeItem(NAMESPACE_API);
// localStorage.removeItem(NAMESPACE_WEBSOCKET);


// save app data
KlikStorage.prototype.save_app_data = function() {
    // var stored = JSON.parse(localStorage.getItem(NAMESPACE_APP));
    localStorage.setItem(NAMESPACE_APP, JSON.stringify({
        time    : (new Date()).getTime(),
        version : this.app.version,
        build   : this.app.build,
        date    : this.app.date,
    }));
    this.cout('saved', ':', 'app data');
}


KlikStorage.prototype.save_api_data = function() {
    // var stored = JSON.parse(localStorage.getItem(NAMESPACE_API));
    localStorage.setItem(NAMESPACE_API, JSON.stringify({ 
        time            : (new Date()).getTime(),
        user            : tech.api.user, 
        env             : tech.api.env, 
        event           : tech.api.event, 
        access_tokens   : tech.api.access_tokens,
        refresh_tokens  : tech.api.refresh_tokens,
        buffered_events : tech.api.buffered_events,
        roles           : tech.api.roles,
    }));
    this.cout('saved', ':', 'api data');
}


KlikStorage.prototype.save_websocket_data = function() {
    // var stored = JSON.parse(localStorage.getItem(NAMESPACE_WEBSOCKET));
    localStorage.setItem(NAMESPACE_WEBSOCKET, JSON.stringify({ 
        time    : (new Date()).getTime(),
        host    : this.websocket.host,
        port    : this.websocket.port, 
        protocol: this.websocket.protocol
    }));
    this.cout('saved', ':', 'websocket data');
}


KlikStorage.prototype.load_app_data = function() {
    var data = JSON.parse(localStorage.getItem(NAMESPACE_APP));
    this.app = (data) ? data : this.get_default_app_data();
    this.cout('loaded', ':', 'app data');
}


KlikStorage.prototype.load_api_data = function() {
    var data = JSON.parse(localStorage.getItem(NAMESPACE_API));
    this.api = (data) ? data : this.get_default_api_data();
    this.cout('loaded', ':', 'api data');
}


KlikStorage.prototype.load_websocket_data = function() {
    var data = JSON.parse(localStorage.getItem(NAMESPACE_WEBSOCKET));
    this.websocket = (data) ? data : this.get_default_websocket_data();
    this.cout('loaded', ':', 'websocket data');
}

