// by JSR <jsr@pixmob.com>

KlikDmxInterface = function(options=null) {
    KlikModule.call(this); // call super constructor

    // defaults
    this.host = '127.0.0.1';
    this.port = 9001;
    this.label = 'dmx';
    this.section = null;
    this.buttons = null;
    this.reconnect = 0;
    this.callbacks = {};

    for (k in options) {
        this[k] = options[k];
    }
    
    // websocket client
    this.ws_counter = 0;
    this.ws = null;

    this.data = {
        usbdmx_in   : null, // physical interfaces ids, such as EN168123 (ENTTEC format)
        usbdmx_out  : null,
        count_in    : 0,    // stats 
        count_out   : 0,
        port_in     : 0,    // ports, 0 means none
        port_out    : 0,
        dmx_in      : [],   // frames
        dmx_out     : [], 
        fps_hw_in   : 0,    // hardware
        fps_hw_out  : 0, 
        fps_sw_in   : 0,    // software
        fps_sw_out  : 0, 
        status_in   : 'no activity',
        status_out  : 'no activity',        
    }

    var self = this;

    if (this.buttons) {
        this.buttons.passthru_enable.onmousedown = function(event) {
            self.set_passthru(1);
        }

        this.buttons.passthru_disable.onmousedown = function(event) {
            self.set_passthru(0);
        }
    }

    // default callbacks, if they have not been set already via the options
    if (!this.callbacks.on_ws_open) {
        this.callbacks.on_ws_open = function(connection) {
            if (self.section) {
                self.section.innerHTML = self.label+' - connected to : '+connection.url;
            }
        }
    }

    if (!this.callbacks.on_ws_message) {
        this.callbacks.on_ws_message = function(data) {
            for (var key in data) {
                self.data[key] = data[key];
            }

            if (data.dmx_in && self.callbacks.on_dmx_in) {
                self.callbacks.on_dmx_in(data);

                if (self.buttons) {
                    if (data.passthru==1) {
                        add_class(self.buttons.passthru_enable, 'selected');
                        rem_class(self.buttons.passthru_disable, 'selected');
                    }
                    else {
                        rem_class(self.buttons.passthru_enable, 'selected');
                        add_class(self.buttons.passthru_disable, 'selected');
                    }
                }
            } 

            if (data.dmx_out && self.callbacks.on_dmx_out) {
                self.callbacks.on_dmx_out(data);
            } 

            if (data.config && self.callbacks.on_config) {
                self.callbacks.on_config(data);
            } 

            if (data.data && self.callbacks.on_data) {
                self.callbacks.on_data(data);
            } 

            if (data.echo && self.callbacks.on_echo) {
                self.callbacks.on_echo(data);
            } 
        }
    }

    if (!this.callbacks.on_ws_close) {
        this.callbacks.on_ws_close = function() {
            if (self.section) {

                if (self.reconnect) {
                    self.section.innerHTML = self.label+' - unable to connect : reconnecting in 1 sec';
                }
                else {
                    self.section.innerHTML = self.label+' - unable to connect : please reload the page';
                }
            }

            self.ws = null;

            if (self.reconnect) {
                setTimeout(function() {
                    self.connect();
                }, 1000);
            }
        }
    }

    this.connect();
}


KlikDmxInterface.prototype = Object.create(KlikModule.prototype);
KlikDmxInterface.prototype.constructor = KlikDmxInterface;


KlikDmxInterface.prototype.connect = function() {
    this.ws = new KlikWebsocket(this.host, this.port, 'no-protocol', this.callbacks, false);
    this.section.innerHTML = this.label+' - connecting ...';
}


KlikDmxInterface.prototype.set_passthru = function(state) {
    this.ws.send({
        passthru:state
    }); 
}


KlikDmxInterface.prototype.send = function(data) {

    if (this.ws == null) {
        return;
    } 

    // assuming that any array is dmx
    if (data.length) {
        this.ws.send({dmx_out:data}); 
    }
    else {
        this.ws.send(data); 
    }
}


