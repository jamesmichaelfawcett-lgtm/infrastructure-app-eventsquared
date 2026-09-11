function KlikGeneratorException(message) {
   this.message = message;
   this.name = 'KlikGeneratorException';
}

// var tools = require('./klik_decoder');
// var atob = require('atob');
// require('atob');

// function base64_to_array (base64) {
//     // var binary_string =  window.atob(base64);
//     var binary_string =  atob(base64);
//     var len = binary_string.length;
//     var bytes = [];
//     for (var i = 0; i < len; i++) {
//         bytes[i] = binary_string.charCodeAt(i);
//     }
//     return bytes;
// }

//* stolen form the internet
function to_hex_str(array) {
    return array.map(function(byte) {
        return ("00" + (byte & 0xFF).toString(16)).slice(-2)
    }).join(':')
}


function base64_to_array (base64) {
    //* websafe
    base64 = base64.replace("-", "+");
    base64 = base64.replace("_", "/");

    if (typeof window != 'undefined') {
        var binary_string =  window.atob(base64);
        // var binary_string =  atob(base64);
        var len = binary_string.length;
        var bytes = [];
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }

    var buffer = new Buffer(base64, 'base64');
    var result = [];
    var i;
    for (i = 0; i < buffer.byteLength; i++) {
        console.log(buffer[i]);
        result.push(buffer[i]);
    }
    return result;
}


var KlikGenerator = function (local_name='BRO', maximum_size=31, payload_type=0xff) { 
    this.label  = 'gen';
    this.packet = []; 
    this.max_size = maximum_size;
    this.name = local_name;
    this.type = payload_type;
    this.ok = true;
    this.error = [];
    return this;
}


KlikGenerator.prototype.cout = function() {
    var args = Array.from(arguments);
    args.splice(0,0, this.label+' >');
    cout.apply(this, args);
}


KlikGenerator.prototype.build_packet = function() {
    var result = [];
    if (this.packet.length) {
        result.push(this.packet.length + 1);
        result.push(this.type);
        result = result.concat(this.packet);
    }

    if (this.name) {
        result.push(this.name.length + 1);
        result.push(0x09);
        // console.log("%s %d", this.name, this.name.length)
        for (var i = 0; i < this.name.length; i++) {
            result.push(this.name.charCodeAt(i));
        }
    }

    this.packet = result;
    return this;
}


KlikGenerator.prototype.reset = function() {
    this.packet = [];
    this.ok = true;
    this.error = [];
}


KlikGenerator.prototype.get_payload  = function() {
    return this.packet;
}


KlikGenerator.prototype.error = function(message) {
    this.ok = false;
    this.error.push(message);
    console.log('ERROR:' + message);
}


KlikGenerator.prototype.push_all = function() {
    for(var i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] === 'number') {
            this.packet.push(arguments[i]);
        }
        else if (typeof arguments[i] === 'string') {
            for (var c = 0; c < arguments.lenght; c++) {
                this.packet.push(charCodeAt(arguments[i][c]))
            }
        }
        else {
            //* assume and array
            this.packet = this.packet.concat(arguments[i]);
        }
    }
    // console.log(this.packet);
}
/********************************************************************************/

KlikGenerator.prototype.append_command = function(code, data, valid_size, exception_message) {
    if (data.length != valid_size) {
        throw new KlikGeneratorException(exception_message);
        return this;
    }
    this.push_all(code, data);
    return this;
}

/* Selector related *******************************************************************************/

const RSSI_CMD = 0x52;
const ID3_CMD = 0x42;



KlikGenerator.prototype.rssi = function(rssi) {
    this.push_all(RSSI_CMD, rssi);
    return this;
};

KlikGenerator.prototype.id3 = function(base64) {
    this.push_all(ID3_CMD, base64_to_array(base64));
    return this;
}


/* Ids related *******************************************************************************/
const SET_MAC_CMD = 0x43;

KlikGenerator.prototype.set_mac = function(data) {
    this.append_command(SET_MAC_CMD, data, 6, 'must provide 6 entries: B7-B0 for the mac');
    return this;  
}


/* Effect related *******************************************************************************/
var klik_effect = {};
var klik_speed = {};


KlikGenerator.prototype.video = function(red, green, blue, impact=0) { 
    this.push_all(KLIK_VIDEO.command, impact, green, red, blue);
    return this;
};


klik_effect.simple_pro = {};
klik_effect.simple_pro[KLIK_SIMPLE_PRO.effect[0]] = 0;
klik_effect.simple_pro[KLIK_SIMPLE_PRO.effect[1]] = 1;
klik_effect.simple_pro[KLIK_SIMPLE_PRO.effect[2]] = 2;
klik_effect.simple_pro[KLIK_SIMPLE_PRO.effect[3]] = 3;
klik_effect.simple_pro[KLIK_SIMPLE_PRO.effect[4]] = 4;
klik_effect.simple_pro[KLIK_SIMPLE_PRO.effect[5]] = 5;
klik_effect.simple_pro[KLIK_SIMPLE_PRO.effect[6]] = 6;
klik_effect.simple_pro[KLIK_SIMPLE_PRO.effect[7]] = 7;

klik_speed.simple_pro = {};
klik_speed.simple_pro[KLIK_SIMPLE_PRO.speed[0]] = 0;
klik_speed.simple_pro[KLIK_SIMPLE_PRO.speed[1]] = 1;
klik_speed.simple_pro[KLIK_SIMPLE_PRO.speed[2]] = 2;
klik_speed.simple_pro[KLIK_SIMPLE_PRO.speed[3]] = 3;
klik_speed.simple_pro[KLIK_SIMPLE_PRO.speed[4]] = 4;


KlikGenerator.prototype.simple_pro = function(red, green, blue, effect='pulse', speed='normal') {   
    var effect_table = klik_effect.simple_pro;
    var speed_table =  klik_speed.simple_pro;
    
    if (!((effect in effect_table) && (speed in speed_table))) {
        this.error('[simple-pro] effect or speed not defined');
    }

    var fx = (speed_table[speed] << 4) + effect_table[effect];
    var color = [red, green, blue];

    this.push_all(KLIK_SIMPLE_PRO.command, fx, color);

    return this;
};


klik_effect.micro_pro = {};
klik_effect.micro_pro[KLIK_MICRO_PRO.effect[0]] = 0;
klik_effect.micro_pro[KLIK_MICRO_PRO.effect[1]] = 1;
klik_effect.micro_pro[KLIK_MICRO_PRO.effect[2]] = 2;
klik_effect.micro_pro[KLIK_MICRO_PRO.effect[3]] = 3;

klik_speed.micro_pro = {};
klik_speed.micro_pro[KLIK_MICRO_PRO.speed[0]] = 0;
klik_speed.micro_pro[KLIK_MICRO_PRO.speed[1]] = 1;
klik_speed.micro_pro[KLIK_MICRO_PRO.speed[2]] = 2;
klik_speed.micro_pro[KLIK_MICRO_PRO.speed[3]] = 3;

KlikGenerator.prototype.micro_pro = function(red, green, blue, effect='pulse', speed='normal') {    
    var effect_table = klik_effect.micro_pro;
    var speed_table = klik_speed.micro_pro;
    
    if (!((effect in effect_table) && (speed in speed_table))) {
        this.error('[simple-pro] effect or speed not defined');
    }

    var byte1 = (red & 0xf0 );
    byte1 += (green & 0xf0) >> 4;

    var byte2 = (blue & 0xf0 );
    byte2 += (effect_table[effect] & 0x03) << 2;
    byte2 += (speed_table[speed] & 0x03);

    this.push_all(KLIK_MICRO_PRO.command, byte1, byte2)
    return this;
};


/* Tracking related *******************************************************************************/
var tracking_types_mapping = {
    'info':0x02,
    'version':0x03,
    'tracking-status':0x04,
    'mac':0x05,
    'groups':0x06,
    'friends':0x08,
    'friender-config':0xa,
    'data':0x0d,
    'confirmation':0x0d,
    'best-tags':0x13,
    'bookmarks':0x16,
    'bookmarks-debug':0x2f,
    'empty':255
}

const TEMP_TRACKING_CMD = 0x51;
const MULTI_TRACKING_CMD = 0x4f;
const TRACKING_CMD = 0x50;
const TRACKING_CONFIG_CMD = 0xCF;

KlikGenerator.prototype.temporary_tracking = function(type, duration_ms=200) {
    if(!(type in tracking_types_mapping)) {
        this.error('ERROR: invalid tracking type:' + type);
        //FIXME: need an error condition to break the chain
        return this;
    }

    duration_ms = Math.floor(duration_ms/10); //* in chunks of 10ms
    if (duration_ms > 255) { duration_ms = 255; }

    this.push_all(TEMP_TRACKING_CMD, duration_ms, tracking_types_mapping[type]);
    return this;
}


KlikGenerator.prototype.multi_tracking = function(data) {
    this.append_command(MULTI_TRACKING_CMD, data, 8, 'must provide 5 numbers: interval_sec, duration_MSB, duration_LSB, payload1, payload2, payload3, payload4, power');
    return this;
}

KlikGenerator.prototype.tracking = function(data) {
    var duration = data[1]/10;
    var duration_MSB =  (duration >> 8) & 0xff;
    var duration_LSB = duration & 0xff;

    data = [data[0], duration_MSB, duration_LSB, data[2], data[3]];

    //* we are patching here, so the user dont need to split into bytes the interval
    this.append_command(TRACKING_CMD, data, 5, 'must provide 4 numbers: interval_sec, duration in sec, payload, power');
    return this;
}


//* default is [4, 100, 255] ==> 4 burst every 100ms, sequential
KlikGenerator.prototype.config_tracking = function(data) {
    this.append_command(TRACKING_CONFIG_CMD, data, 3, 'must provide 3 numbers: bursts_qty, interval_between_bursts_ms, sequential_flag ');
    return this;
}


/* RX-LEVEL related *******************************************************************************/
const DONOT_WAKEUP_CMD = 0xA3;
const WAKEUP_CMD = 0xA4;
const RX_LEVEL_IF_FASTER_CMD = 0xA2;


KlikGenerator.prototype.wakeup = function(data) {
    if (data.length != 1) {
        throw new KlikGeneratorException('must-provide:0 to not wakeup, 1-255 to wake=up');
    }

    if(data[0] == 0) {
        this.append_command(DONOT_WAKEUP_CMD, [], 0, '0 to not wakeup, 1-255 to wake=up');
        return this;
    }

    this.append_command(WAKEUP_CMD, [], 0, '0 to not wakeup, 1-255 to wake=up');
    return this; 
}


KlikGenerator.prototype.set_rx_level_if_slower = function(data) {
    this.append_command(RX_LEVEL_IF_FASTER_CMD, data, 2, 'must provide 2 numbers: level (1-9), timeout-x-2s');
    return this;  
}


/* Tag related *******************************************************************************/
const CONFIG_TAG_CMD = 0xC1;
const ENABLE_TAG_SERVICE_CMD = 0xC0;
const ENABLE_FRIEND_SERVICE_CMD = 0xF0;
const ENABLE_BOOKMARK_SERVICE_CMD = 0xC4;
const ENABLE_BOOKMARK_OBJECT_SERVICE_CMD = 0xC6;

//* default is ['T']['A']['G'][72][0-> means average][keep tags for 150s][clean up every 20 *100ms][use 30% of current value ]
KlikGenerator.prototype.configure_tags = function(data) {
    this.append_command(CONFIG_TAG_CMD, data, 8, 'must provide 8 entries: name-3-ascii-cahr, rssi_limit, rssi_hold_time=0, keep_alive_duration_sec, clean_interval_ms, rssi_filter');
    return this;  
}

KlikGenerator.prototype.enable_tag_service = function(data) {
    this.append_command(ENABLE_TAG_SERVICE_CMD, data, 1, 'must provide 1 entries: enable');
    return this;  
}

KlikGenerator.prototype.enable_friend_service = function(data) {
    this.append_command(ENABLE_FRIEND_SERVICE_CMD, data, 1, 'must provide 1 entries: enable');
    return this;  
}

KlikGenerator.prototype.enable_bookmark_service = function(data) {
    this.append_command(ENABLE_BOOKMARK_SERVICE_CMD, data, 1, 'must provide 1 entries: enable');
    return this;  
}

KlikGenerator.prototype.enable_bookmark_object_service = function(data) {
    this.append_command(ENABLE_BOOKMARK_OBJECT_SERVICE_CMD, data, 1, 'must provide 1 entries: enable');
    return this;  
}


/* Memory Bank related *******************************************************************************/
const WRITE_DATA_1BYTE_CMD = 0x80;
const WRITE_DATA_XBYTE_CMD = 0x81;
const DATA_GET_CMD = 0x82;
const DATA_MATCH_CMD = 0x83;
const DATA_BIGGER_CMD = 0x84;
const DATA_SMALLER_CMD = 0x85;
const DATA_RANGE_CMD = 0x86;
const DATA_MATCH_BYTES_CMD = 0x89; 



KlikGenerator.prototype.match_single_data = function(data){
    this.append_command(DATA_MATCH_CMD, data, 2, 'must provide 2 values: offset value');
    return this;
}


KlikGenerator.prototype.match_smaller_data = function(data){
    this.append_command(DATA_SMALLER_CMD, data, 2, 'must provide 2 values: offset value');
    return this;
}


KlikGenerator.prototype.match_bigger_data = function(data){
    this.append_command(DATA_BIGGER_CMD, data, 2, 'must provide 2 values: offset value');
    return this;
}
 

KlikGenerator.prototype.match_range_data = function(data){
    this.append_command(DATA_RANGE_CMD, data, 3, 'must provide 2 values: offset value-min value-max');        
    return this;
}


KlikGenerator.prototype.get_data= function(data) {
    this.append_command(DATA_GET_CMD, data, 3, 'must provide 3 values: duration-in-10ms offset size ');
    return this;
}


KlikGenerator.prototype.write_data = function(data) {
    if (data.length > 2) {
        //* multi-byte write
        var payload = [data[0], data.length - 1];   //* offset + size
        payload = payload.concat(data.slice(1))
        this.append_command(WRITE_DATA_XBYTE_CMD, payload, payload.length, '...');
        return this;
    }

    this.append_command(WRITE_DATA_1BYTE_CMD, data, 2, 'must provide 2 value: offset + value');
    return this;
}


//* needs offset , bytes in chunks of 2
KlikGenerator.prototype.match_multiple_data = function(data) {
    //* must be chunks of 2 bytes
    var data_size = data.length - 1;
    if(data_size % 2) {
        throw new KlikGeneratorException('match-multiple data must be 2 byte aligned');
    }

    var first_byte = data[0];
    first_byte |= (data_size/2) << 5;
    data[0] = first_byte;

    this.append_command(DATA_MATCH_BYTES_CMD, data, data.length, '...');
    return this;
}


/* Group related *******************************************************************************/
const GROUP_CMD = 0x55;
const GROUP_ANY_GROUP = 0x56;
const GROUP_RANGE = 0x57;
const GROUP_MATCH_ALL_CMD = 0x58;
const GROUP_PROGRAM_LAYER_AND_GROUPS = 0x59;
const GROUP_PROGRAM_GROUP = 0x5A;
const GROUP_PROGRAM_ACTIVE_LAYER = 0x5B;


KlikGenerator.prototype.group = function(data) { // data[1] : group
    this.append_command(GROUP_CMD, data, 1, 'must provide 1 number : the group to match');
    return this;
}

KlikGenerator.prototype.group_any = function(data) { // data[4] : group1, group2, group3, group4
    this.append_command(GROUP_ANY_GROUP, data, 4, 'must provide 4 numbers : match any groups (up to 4) at active layer, 32 and over are ignored');
    return this;
}

KlikGenerator.prototype.group_range = function(data) { // data[2] : group_min, group_max
    this.append_command(GROUP_RANGE, data, 2, 'must provide 2 numbers : min group and max group');
    return this;
}

KlikGenerator.prototype.group_match_all = function(data) { // data[8] : group1, group2, ... , group8
    this.append_command(GROUP_MATCH_ALL_CMD, data, 8, 'must provide 8 numbers : groups in each layer that you want to match, 32 and over are ignored');
    return this;
}

KlikGenerator.prototype.group_program_layer_and_groups = function(data) { // data[9] : layer, group1, group2, ... , group8
    this.append_command(GROUP_PROGRAM_LAYER_AND_GROUPS, data, 9, 'must provide 9 numbers : the layer (0-7) and 8 consecutive groups (1-31) ex : 7 21 22 23 24 25 26 27 28');
    return this;
}

KlikGenerator.prototype.group_program_group = function(data) { // data[2] : layer, group
    this.append_command(GROUP_PROGRAM_GROUP, data, 2, 'must provide 2 numbers : the layer (0-7) and the group (1-31)');
    return this;
}

KlikGenerator.prototype.group_program_active_layer = function(data) {  // data[1] : layer
    this.append_command(GROUP_PROGRAM_ACTIVE_LAYER, data, 1, 'must provide 1 number from 0 to 7 : the layer to activate');
    return this;
}

/* New *******************************************************************************/
const WAS_CLICKED_CMD = 0x3E;

KlikGenerator.prototype.was_clicked = function(data) {
    this.push_all(WAS_CLICKED_CMD);
    return this;
}

const TX_PAYLOAD_CMD = 0xCE;
KlikGenerator.prototype.set_tx_payload = function(data) {
    //* this command doest start the tx, only set the payload type 253
    //* in most case it is used as TAG, so wi will set it to it
    var types = {'PIX':0, 'TAG':1, 'SPK':2, 'TRK':3, 'MRK':4, 'FLG':5};
    var byte1 = (types['TAG'] << 5 ) | data.length;
    this.push_all(TX_PAYLOAD_CMD, byte1, data);
    return this;
}


const ONE_CLICK_SUSPEND_CMD = 0x3C;
KlikGenerator.prototype.suspend_one_click = function(data) { 
    this.push_all(ONE_CLICK_SUSPEND_CMD, [0x45, 0xFE] );
    return this;
}


/* New *******************************************************************************/
const BOOKMARK_EVENT_SHORT_CMD = 0xCC;
KlikGenerator.prototype.bookmark_event_short = function(args) { 
    // {id:1245, reconfirm:1, priority:0, rgb: [r,g,b], speed:1, effect:2}
    var reconfirm = args.reconfirmation || 1;
    var priority = args.priority || 0;
    var effect = args.speed = 'pulse';
    var speed = args.speed = 'normal';
    var rgb = args.rgb || [255, 0, 0];
    var id = args.id || 1;


    var priority_effect = (reconfirm << 3) | priority;

    var micro_pro = new KlikGenerator().micro_pro(rgb[0], rgb[1], rgb[2], effect, speed);


    this.push_all(BOOKMARK_EVENT_SHORT_CMD, [id>>8, id&0xff, priority_effect, micro_pro.packet[1], micro_pro.packet[2]] );
    return this;
}


// var generator = new KlikGenerator();

// // console.log(module);

// // console.log(generator);
// generator.rssi(12);
// console.log(generator.packet);
// // generator.simple_pro(255, 15, 0);
// generator.simple_pro(255, 15, 0, 'blackout', 'fastest');
// console.log(generator.packet);

// generator.reset();
// console.log(generator.packet);

// generator.rssi(50).simple_pro(1,2,3, 'pulse', 'fast');
// console.log(generator.packet);


// generator.reset();
// generator.id3('1234').rssi(50).simple_pro(1,2,3, 'pulse', 'fast');
// // generator.id3('1234').rssi(50).simple_pro(1,2,3, 'pulse', 'fast');
// // generator.id3('1234').rssi(50).simple_pro(1,2,3, 'pulse', 'fast').temporary_tracking('version', 200);

// console.log('===>>>');
// // generator.data_get(0, 1);
// console.log(generator.packet);
// console.log('===');
// console.log(to_hex_str(generator.packet)); 

// generator.build_packet();

// console.log('===');
// console.log(to_hex_str(generator.packet)); 



// 0c:ff:42:d7:6d:f8:52:32:e1:80:01:02:03:04:09:42:52:4f







//* refenrences

// reference
// KlikGenerator.prototype.wakeup = function(wakeup=true) {
//     if(wakeup) { this.push_all(WAKEUP_CMD); }
//     else { this.push_all(DONOT_WAKEUP_CMD); }
//     return this;  
// }

// reference
// KlikGenerator.prototype.set_rx_level_if_slower = function(level, timeout) {
//     timeout /= 2;
//     if (timeout == 0) { timeout = 1; }

//     this.push_all(RX_LEVEL_IF_FASTER_CMD, level, timeout);
//     return this;  
// }





// reference
// KlikGenerator.prototype.configure_tags_simple = function(rssi_limit=75, keep_alive_duration_sec=150) {
//     return this.configure_tags('TAG', rssi_limit, 0, keep_alive_duration_sec, 10000, 30 );
// }   


// reference
// KlikGenerator.prototype.configure_tags = function(tag_name='TAG', rssi_limit=75, rssi_hold_time=0, keep_alive_duration_sec=150, clean_interval_ms=10000, rssi_filter=30 ) {
//     clean_interval_ms /= 100;
//     var name = [];
//     for (var i = 0; i < tag_name.length; i++) {
//         name.push(charCodeAt(tag_name[i]));
//     }

//     this.push_all(CONFIG_TAG_CMD, name, rssi_limit, rssi_hold_time, keep_alive_duration_sec, clean_interval_ms, rssi_filter); 
//     return this;  
// }




//reference
// KlikGenerator.prototype.multi_tracking = function(payloads=[], interval_sec=15, duration_sec=0xffff, power=7) {
//     //* path the array to for payloads
//     for (var i = payloads.length; i < 4; i++) { 
//         payloads.push('empty'); 
//     }

//     for (var i = 0; i < payloads.length; i++) { 
//         if (payloads[i] in tracking_types_mapping) {
//             payloads[i] = tracking_types_mapping[payloads[i]];
//         }
//         else {
//             this.error('[multi-tracking] unknown payload: ' + payloads[i]);
//             return this;
//         }
//     }

//     this.push_all(MULTI_TRACKING_CMD, interval_sec, duration_sec>>8, duration_sec & 0xff, payloads, power);
//     return this;
// }

//reference
// KlikGenerator.prototype.config_tracking = function(bursts_qty=4, interval_between_bursts=100, sequential_flag=true) {
//     if (interval_between_bursts > 255) {
//         this.error('ERROR: interval too long, limited to 255ms for now')
//         interval_between_bursts = 255; 
//     } 
//     this.push_all(TRACKING_CONFIG_CMD, bursts_qty, interval_between_bursts, sequential_flag);
//     return this;
// }



// reference
// KlikGenerator.prototype.match_multiple_data = function(offset, data) {
//     if(data.length %= 2) {
//         this.error('match-multiple data must be 2 byte aligned');
//         return this;
//     }

//     this.push_all(DATA_MATCH_BYTES, offset, data);
//     return this;
// }


//reference
// KlikGenerator.prototype.data_get = function(offset, size, duration_ms=200) {
//     this.push_all(DATA_GET_CMD, offset, size, duration_ms);
//     return this;
// }

// KlikGenerator.prototype.write_data = function(offset, data) {
//     if (typeof data === 'number') {
//         this.push_all(WRITE_DATA_1BYTE_CMD, offset, data);
//         return this;
//     }
//     this.push_all(WRITE_DATA_XBYTE_CMD, offset, data);
//     return this;
// }

// KlikGenerator.prototype.match_data = function(offset, operation, data1, data2=null) {
//     if(operation == '=') {
//         this.push_all(DATA_MATCH_CMD, offset, data1);
//         return this;
//     }
//     else if(operation == '<') {
//         this.push_all(DATA_SMALLER_CMD, offset, data1);     
//         return this;
//     }
//     else if(operation == '>') {
//         this.push_all(DATA_BIGGER_CMD, offset, data1);      
//         return this;
//     }
//     else if(operation == 'range') {
//         this.push_all(DATA_RANGE_CMD, offset, data1, data2);        
//         return this;
//     }

//     this.error('[MATCH-DATA], unsupported operator:' + operation);
//     return this;
// }