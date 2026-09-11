// by JSR <jsr@pixmob.com>

Klik = { Manager:{} }

Klik.Manager.Bridge = function(index, label) {
    this.index = index;
    this.label = label;
    
    // from api:
    this.addr = null;
    this.event = null;
    this.stats = null;
    return this;
}


Klik.Manager.Map = function(index, label) {
    this.index = index;
    this.label = label;
    this.offset = [0,0];

    // from api : 
    this.id = null;
    this.name = null;
    this.image_url = null;
    this.event_id = null;
}


Klik.Manager.Location = function(index, label, shape, center) {
    var half_width  = 60;
    var half_height = 60;
    this.index = index;
    this.label = label;
    this.map_offset = [0,0];
    this.coords = [];
    this.box = {};
    this.tag_selector = null;

    if (shape=='square') {
        this.coords = [
            [-half_width,-half_height],
            [ half_width,-half_height],
            [ half_width, half_height],
            [-half_width, half_height]
        ];
    }
    else if (shape=='circle') {
        this.coords = [];
        var radius = 60;
        var steps = 8;
        for (var i = 0; i < steps; i++) {
            this.coords.push([
                radius*Math.cos(TWOPI*i/steps),
                radius*Math.sin(TWOPI*i/steps) ]);
        }
    }

    if (center) {
        for (var i=0; i<this.coords.length; i++) {
            this.coords[i][0]+=center[0];
            this.coords[i][1]+=center[1];
        }
    }
    this.attendees_count = 0;

    // from api :
    this.name = 'no_name';
    this.map = 'no_map';
    this.display_name = 'no_display_name';
    this.coordinates = []; // will get recalculated
    this.tuning =  {
        'type': 'multi', 
        'timeout': 300,
        'threshold': "far",   // for beacons was immediate (possibles values: immediate, near, far)
        'min_certainty': 0.0, // for beacons was 0.8
        'samples': 60, 
        'sample_ratio': 0.2, 
        'stickiness': 60, 
        'beacons': [],
        'tags': [],
    }
}


// generic device
Klik.Manager.Device = function(index, label) {
    this.index = index;
    this.label = '';
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.left = 0; 
    this.right = 0;
    this.top = 0;
    this.bottom = 0;
    this.start = [0,0];
    this.image_url = '../../lib/img/icon-square.png';
    this.image = new Image();

    // from api :
    this.id = this.mac = Utils.generate_fake_mac();
    this.type = 'no type';
    this.name = 'no name';
    this.description = 'no description';
    this.event_id = '';
    this.map = '';
    this.norm = [null,null]; // normalized , in api its not .norm , but .x and .y
    this.status = {};
    this.custom = {};
    this.history_index = [0,1]; // current, next
}


Klik.Manager.Attendee = function(index, label) {
    Klik.Manager.Device.apply(this,arguments)
    this.image_url = '../../lib/img/icon-attendee.png';
    this.image.src = this.image_url;
    this.name = 'ATTENDEE';
    this.type = 'attendee';
    this.description = 'no description';
}


// XBEE devices
Klik.Manager.Hub = function(index, label) {
    Klik.Manager.Device.apply(this,arguments)
    this.image_url = '../../lib/img/icon-hub.png';
    this.image.src = this.image_url;
    this.name = 'HUB';
    this.type = 'hub';
    this.description = 'no description';
}


Klik.Manager.Beacon = function(index, label) {
    Klik.Manager.Device.apply(this,arguments)
    this.image_url = '../../lib/img/icon-beacon.png';
    this.image.src = this.image_url;
    this.name = 'BEACON';
    this.type = 'beacon';
    this.description = 'no description';
}


Klik.Manager.Config = function(index, label) {
    Klik.Manager.Device.apply(this,arguments)
    this.image_url = '../../lib/img/icon-config.png';
    this.image.src = this.image_url;
    this.name = 'CONFIG';
    this.type = 'config';
    this.description = 'no description';
}


Klik.Manager.Tag = function(index, label) {
    Klik.Manager.Device.apply(this,arguments)
    this.image_url = '../../lib/img/icon-tag.png';
    this.image.src = this.image_url;
    this.name = 'TAG';
    this.type = 'tag';
    this.description = 'no description';
    // this.id = 'TAG0003';
}


Klik.Manager.Touchpoint = function(index, label) {
    Klik.Manager.Device.apply(this,arguments)
    this.image_url = '../../lib/img/icon-touchpoint.png';
    this.image.src = this.image_url;
    this.name = 'TOUCHPOINT';
    this.type = 'touchpoint';
    this.description = 'no description';
    // this.id = 'TPT0003';
}


Klik.Manager.Pixel = function(index, label) {
    Klik.Manager.Device.apply(this,arguments)
    this.image_url = '../../lib/img/icon-pixel.png';
    this.image.src = this.image_url;
    this.name = 'PIXEL';
    this.type = 'pixel';
    this.description = 'no description';
    // this.id = 'PIX0003';
}


Klik.Manager.Sentinelle = function(index, label) {
    Klik.Manager.Device.apply(this,arguments)
    this.image_url = '../../lib/img/icon-sentinelle.png';
    this.image.src = this.image_url;
    this.name = 'SENTINELLE';
    this.type = 'sentinelle';
    this.description = 'no description';
    // this.id = 'SEN0003';
}


Klik.Manager.Mobile = function(index, label) {
    Klik.Manager.Device.apply(this,arguments)
    this.image_url = '../../lib/img/icon-mobile.png';
    this.image.src = this.image_url;
    this.name = 'MOBILE';
    this.type = 'mobile';
    this.description = 'no description';
    // this.id = 'MOB0003';
}


Klik.Manager.Registration = function(index, label) {
    Klik.Manager.Device.apply(this,arguments)
    this.image_url = '../../lib/img/icon-registration.png';
    this.image.src = this.image_url;
    this.name = 'REGISTRATION';
    this.type = 'registration';
    this.description = 'no description';
    // this.id = 'REG0003';
}

