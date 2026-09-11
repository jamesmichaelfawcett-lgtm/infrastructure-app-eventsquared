// by JSR <jsr@pixmob.com>

// global ref to facilitate using websocket
// inside the global static functions
var ws = null;
var js = null; 

KlikWebsocket = function(host, port, protocol, callbacks=null, create_global_ref=true) {
    this.label     = 'ws';
    this.host      = (host) ? host : tech.storage.websocket.host;
    this.port      = (port) ? port : tech.storage.websocket.port;
    this.protocol  = (protocol) ? protocol : tech.storage.websocket.protocol;
    this.callbacks = callbacks;
    this.hostport  = "ws://"+this.host+":"+this.port+'/';
    this.connected = false;

    this.cout('connecting', ':', this.host+':'+this.port);

    if (this.protocol=='no-protocol') {
        this.ws = new WebSocket(this.hostport);
    }
    else if (this.protocol) {
        this.ws = new WebSocket(this.hostport, this.protocol);
    }
    else {
        this.ws = new WebSocket(this.hostport);
    }

    var self = this;

    if (create_global_ref==true) {
        ws = this; // bind to global ws and to self (for callbacks)
    }

    this.ws.onopen = function() {
        self.cout('connected', ':', self.host+':'+self.port);
        self.cout('protocol', ':', self.protocol);

        self.connected = true;
        if (create_global_ref) {
            self.app_ref.update_connection_state();
        }

        if (self.callbacks && self.callbacks.on_ws_open) {
            self.callbacks.on_ws_open(this);
        }

        // this is dangerous, it was sending all info in clear

        // var data = {
        //     app : tech.storage.app,
        //     api : tech.storage.api,
        //     user : tech.storage.user,
        //     websocket : tech.storage.websocket,
        // }

        // self.send({
        //     debug: data
        // });
    }
    
    this.ws.onclose = function() {
        self.cout('terminated', ':', this.url, this.protocol);
        self.connected = false;
        if(create_global_ref) {
            self.app_ref.update_connection_state();
        }
        if (self.callbacks && self.callbacks.on_ws_close) {
            self.callbacks.on_ws_close(this);
        }
    }

    this.ws.onerror = function (error) {
        self.cout('error', ':', this.url, this.protocol, JSON.stringify(error, null, 0));
        self.connected = false;
        if(create_global_ref) {
            self.app_ref.update_connection_state();
        }
        if (self.callbacks && self.callbacks.on_ws_error) {
            self.callbacks.on_ws_error(error);
        }
    }

    this.ws.onmessage = function (event) {
        // console.log(event.data);

        var data = self.parse(event.data)

        if (data.cmd=='whoareyou') {
            self.callback_whoareyou(data);
        }
        else if (data.cmd=='backup') {
            self.callback_backup(data);
        }
        else if (self.callbacks.on_ws_message) {
            self.callbacks.on_ws_message(data);
        }
        else {
            self.cout('message', event.data);
        }
    }
}


KlikWebsocket.prototype.cout = function() {
    var args = Array.from(arguments);
    args.splice(0,0, this.label+' >');
    cout.apply(this, args);
}


KlikWebsocket.prototype.cleanup = function(object) {
    this.ws.onclose = function () {}; // disable onclose handler first
    this.ws.onmessage = function () {}; // disable onclose handler first
    this.ws.onerror = function () {}; // disable onclose handler first
    this.callbacks = null; // this will disable the reconnect handler
    this.close();
}


KlikWebsocket.prototype.close = function() {
    this.ws.close(1000, "deliberate disconnection");
}


// take an object, stringify it and send it
KlikWebsocket.prototype.send = function(object) {
    if (this.ws.readyState==1) {
        this.ws.send(JSON.stringify(object));
    }
    else {
        // console.log('unable to send ' + JSON.stringify(object));
    }
}

// receive a json formatted string, return an object
KlikWebsocket.prototype.parse = function(json) {
    return JSON.parse(json)
}

KlikWebsocket.prototype.callback_whoareyou = function(data_in) {
    console.log(data_in)
    var data_out = {
        request: data_in,
        response: {
            timestamp   : new Date().getTime(),
            application : 'test-app',
            user        : 'vadim'
        }
    }
    this.send(data_out);
}

KlikWebsocket.prototype.callback_backup = function(data_in) {
    console.log(data_in)
    var data_out = {
        request: data_in,
        response: {
            data: [0,1,2,3]
            // timestamp   : new Date().getTime(),
            // locations   : contextual_storage.locations,
            // beacons     : contextual_storage.beacons,
            // sentinelles : contextual_storage.sentinelles,
            // hubs        : contextual_storage.hubs
        }
    }
    this.send(data_out);
}
