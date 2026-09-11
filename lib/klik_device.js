// by JSR <jsr@pixmob.com

function get_device_data(array, id) {
    return Utils.get_item_by_id(array, id);
}


function add_to_dict_if_map(data, dict) {
    for (var i=0; i<data.length; i++) {
        if (data[i].map) {
            var type = data[i].type+'s'; // tag > tags , pixel > pixels
            var id = data[i].id;
            if (!dict[type]) {
                dict[type] = {};
            }
            dict[type][id] = data[i];
        }
    }
}


function add_to_dict(data, dict, key) {
    for (var i=0; i<data.length; i++) {
        dict[data[i][key]] = data[i];
    }
}




// Class : KlikDeviceLock

// original constructor by VK
// var KlikDeviceLock = function(rssi=-40, name_to_search='FRI', tx_name='BRO', found_callback=null, stop_callback=null);

var KlikDeviceLock = function(options=null) {
    KlikModule.call(this); // call super constructor

    // defaults
    this.label = 'lock';
    this.name_to_search = 'FRI';
    this.found_callback = null;
    this.stop_callback = null;
    this.timer = null;
    this.rssi_limit = -40;
    this.currently_locked = null;
    this.locked_id = null;
    this.tx_name = 'BRO';
    this.ble_tx = new KlikSendWithTimeout('ipad', this.tx_name);

    // override defaults with provided options
    for (k in options) {
        this[k] = options[k];
    }
}

KlikDeviceLock.prototype = Object.create(KlikModule.prototype);
KlikDeviceLock.prototype.constructor = KlikDeviceLock;


KlikDeviceLock.prototype.process = function(packet) {
    // dont process if locker is
    // - not running
    // - too far
    // - not right device
    if (!this.is_locking() || 
        (packet.rssi < this.rssi_limit) || 
        (packet.name.search(this.name_to_search) == -1) ) { 
        return; 
    }

    // this.cout('found', ':', this.name_to_search, packet.name, packet.rssi);

    if (this.found_callback) {
        this.found_callback(packet.name);
    }
    
    if (this.currently_locked != packet.name) {
        var name = packet.name.slice(3);
        var generator = new KlikGenerator().id3(name).micro_pro(100, 0,0);
        this.ble_tx.send(generator.packet, this.tx_name, 5000);
    }
    this.currently_locked = packet.name;
}


KlikDeviceLock.prototype.stop = function(){
    this.cout('stop');
    clearTimeout(this.timer);
    this.timer = null;

    this.locked_id = this.currently_locked.slice(3);
    if (this.locked_id.length != 4) { 
        this.locked_id = null; 
    }
    this.currently_locked = null;

    this.ble_tx.stop();

    if (this.stop_callback) {
        this.stop_callback(this.locked_id);
    }
}


KlikDeviceLock.prototype.lock = function(color=[100, 100, 0], duration=3000) {
    if (this.is_locking()) { 
        clearTimeout(this.timer); 
    }
    var self = this;
    this.timer = setTimeout(function() { 
        self.stop(); 
    },  duration);
}


KlikDeviceLock.prototype.show = function(color=[0,200,0], duration=3000) {
    if (!this.locked_id) { 
        return; 
    }
    this.cout('show ' + this.locked_id);
    var generator = new KlikGenerator().id3(this.locked_id).micro_pro(color[0], color[1], color[2]);
    this.ble_tx.send(generator.packet, this.tx_name, 5000);
}


KlikDeviceLock.prototype.is_locking = function() {
    return this.timer ? true : false;
}



// Class : KlikDeviceManager

KlikDeviceManager = function(app_uid) {
    this.label = 'device_manager';
    this.app_uid = app_uid;
    this.cout('init', ':', this.app_uid, '::', 'KlikDeviceManager');
}


KlikDeviceManager.prototype.cout = function() {
    var args = Array.from(arguments);
    args.splice(0,0, this.label+' >');
    cout.apply(this, args);
}  

// one device to track, as a test
KlikDeviceManager.device_to_track = 'PIXI0RL';

// items on the map that can be
// represented as a single point (x,y)
KlikDeviceManager.supported_types = [
    'attendee',
    'beacon',
    'config',
    'hub',
    'mobile',
    'pixel',
    'registration',
    'sentinelle',
    'tag',
    'touchpoint'
];

KlikDeviceManager.windows = [
    'debugger',
    'monitor',
    'console',
];

KlikDeviceManager.toolbars = [
    'toolbar_device',
    'toolbar_menu',
    'toolbar_info',
    'toolbar_layer'
];

KlikDeviceManager.layers = [
    'map',
    'location',
    'live_counter',
    'system_counter',
    'manual_counter',
    'mobile_counter',
    'notification',
    'glow',
    'icon',
];
