// by JSR <jsr@pixmob.com & VK <vk@pixmob.com>


// Object to send BLE with a timeout 

var KlikSendWithTimeout = function(tx_destination, name='BRO', duration=1000) {
    this.payload = null;
    this.duration = null;
    this.tx_destination = tx_destination;
    this.local_name = name;
    this.timer = null;
}


KlikSendWithTimeout.prototype.send = function (payload, name, duration=null) {
    duration = duration || this.duration;
    if (this.timer) {
        clearTimeout(this.timer);
    }

    app.cout('started broadcasting');

    if (this.tx_destination == 'ipad') {
        console.log('KlikSendWithTimeout send', name, payload, duration);
        klik_send_payload(payload, name);    
        var self = this;
        this.timer = setTimeout(function() { 
            self.stop();
        }, duration);
    }
}


KlikSendWithTimeout.prototype.stop = function () {
    clearTimeout(this.timer);
    this.timer = null;

    if (this.tx_destination == 'ipad') {
        console.log('KlikSendWithTimeout stop');
        klik_stop_broadcast();
    }
}


// new : javascript interface

js_message_in  = 0
js_message_out = 0



function native_to_webapp(msg) {
    js_message_in++;
    if (typeof msg=='string') {
        // tech.cout('native_to_webapp', ': ', js_message_in);

        var data = JSON.parse(decodeURIComponent(msg));

        if (ws) {
            // fake websocket callback (for now)
            ws.callbacks.on_ws_message(data);
        }
    }
}


function webapp_to_native(data) {
    js_message_out++;

    // webkit : ios, macos
    if (window.webkit) {
        window.webkit.messageHandlers.klik_protocol.postMessage(JSON.stringify(data));
        return 'webkit';
    }

    // android
    else {
        try {
            AndroidInterface.write( JSON.stringify(data) );
            return 'android';
        }
        catch(e) {
      
        }    
    }
    return null;
}


function get_js_interface() {
    return webapp_to_native({"test":1});
}


function klik_report_start() {
    klik_send_off_state();
    setTimeout(klik_send_state, 500, {report:'fast', scan:1}); 
}   


// generic functions

function klik_send(data) {
    if (KLIK_JS_ENABLE) {
        webapp_to_native(data);
    }
    else if (KLIK_WS_ENABLE && ws) {
        ws.send(data);
    }
    else {
        tech.cout('cannot send via klik_send');
    }
}


function klik_send_command(command) {
    klik_send({
        'command' : command
    });
}


function klik_send_off_state() {
    klik_send_state({
        'filter'    : 0,
        'report'    : 0,
        'scan'      : 0,
        'broadcast' : 0,
        'debug'     : 0,
        'motion'    : 0,
        'location'  : 0
    });
}


function klik_send_state(state) {
    klik_send({
        'state' : state
    });
}


function klik_send_broadcast(payload) {
    klik_send_payload(payload, 'BRO');
}


function klik_send_payload(payload, localname='BRO') {
    if (typeof(payload)=='string') {
        payload = klik_hex_string_to_array(payload);
    }
    if (payload.length==0) {
        return;
    }

    // console.log(payload);

    klik_send({ 
        'payload'   : payload,
        'localname' : localname, 
        'state'     : { 'broadcast' : 1 }
    });
}


function klik_start_broadcast() {
    klik_send_state({
        'broadcast' : 1
    });

    if (ws) {
        ws.cout('broadcast',':','start');
    }
}


function klik_stop_broadcast() {
    klik_send_state({
        'broadcast' : 0
    });

    if (ws) {
        ws.cout('broadcast',':','stop');
    }
}

