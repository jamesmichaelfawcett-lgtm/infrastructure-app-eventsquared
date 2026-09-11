function to_hex(list) {
    var result = [];
    for (var i = 0; i < list.length; i++) {
        var d = list[i].toString(16);
        d = d.length == 1 ? "0" + d : d;
        result.push(d);
    }
    return(result.join(""));
}


String.prototype.toHHMMSS = function (h=':', m=':', s='') {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+h+minutes+m+seconds+s;
}


function find_by_value(value, object) {
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            if (value == object[key]) {
                return key;
            }
        }
    }
    return undefined
}


var klik_aes = {
    key : [0x64, 0xd5, 0xca, 0xbe, 0x2a, 0x89, 0x8c, 0x7b, 0x49, 0x33, 0x29, 0x22, 0x85, 0x19, 0xa3, 0xe9],
    aes : false,

    init : function() { 
        this.aes = new aesjs.AES(this.key); 
    },

    decrypt : function(array) {
        if (this.aes == false) { 
            this.init(); 
        }

        if (array.length != 16) {
            console.log("ERROR: AES encrypted payload must be 16 bytes long, not %d", array.length);
            return [];
        }
        var decrypted = this.aes.decrypt(array);
        var data = [];

        for(var i = 0; i < decrypted.byteLength; i++) { 
            data.push(decrypted[i]); 
        }

        return data;
    }
}


var base_64 = {
    array_to_base64 : function(buffer) {
        var binary = '';
        var bytes = new Uint8Array( buffer );
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
        }

        var result =  window.btoa( binary );
        result = result.replace("+", "-");
        result = result.replace("/", "_");
        return result;
    },

    base64_to_array : function(base64) {
        //* FIXME need to test
        //* websafe
        base64 = base64.replace("-", "+");
        base64 = base64.replace("_", "/");

        var binary_string =  window.atob(base64);
        var len = binary_string.length;
        var bytes = [];
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }   
}


//* Fixme, if we include the checksum in the packet, if it gives 0 it passes
function klik_checksum(data) {
    var checksum = 0;
    for (var i = 0; i < data.length; i++) {
        checksum += data[i];
    }
    checksum = (0x100 - checksum) & 0xff;

    return checksum;
}


function make_number_from_byte_array(data) {
    var result = 0;
    for (var i = 0; i < data.length; i++) {
        result <<= 8;
        result += data[i];
    }

    return result;
}


// TODO : centralize all things related to the commands codes

function klik_get_command_code(name) {
    for (i in klik_decoder_map) {
        if (klik_decoder_map[i].name==name) {
            // console.log(name, i);
            return Number(i);
        }
    }
}


// todo : differenciate pixmob commands from klik commands
var pixmob_decoder_map = {

    // WAND Status - messages from the wand
    // 0x20 : {name:'wand-one-packet-status'       , decoder: 'decode_wand_one_packet_status'},
    // 0x21 : {name:'wand-status'                  , decoder: 'decode_wand_status'},
    // 0x22 : {name:'wand-button'                  , decoder: 'decode_wand_button'},

    // // WAND Control - messages to the wand - todo
    // 0x23 : {name:'wand-full-pro2-fixture'       , encoder: 'encode_wand_full_pro2_fixture'},    // [0]address, [1..22]data
    // 0x24 : {name:'wand-simple-pro2-fixture'     , encoder: 'encode_wand_simple_pro2_fixture'},  // [0]address, [1]fx_speed, [2-3-4]rgb
    // 0x25 : {name:'wand-button-trigger'          , encoder: 'encode_wand_button_trigger'},       // [0]duration (0=stop, 255=25 seconds)
    // 0x26 : {name:'wand-feedback-config'         , encoder: 'encode_wand_feedback_config'},      // [0]interval [1]button_config b0:idle b1:press b2:release
    // 0x27 : {name:'wand-rssi-filter'             , encoder: 'encode_wand_rssi_filter'},          // [0]rssi
    // 0x28 : {name:'wand-mac-filter'              , encoder: 'encode_wand_mac_filter'},           // [0-1-2]mac
    // 0x29 : {name:'wand-save-fixture'            , encoder: 'encode_wand_save_fixture'},         // [0]address, if 0:clear universe starting at 1] [1..22]data
    // 0x2A : {name:'wand-save-current-universe'   , encoder: 'encode_wand_save_current_universe'},
    // 0x2B : {name:'wand-load-fixture'            , encoder: 'encode_wand_load_fixture'},         //  [0: load full dmx-frame from memory] [1-254: load 22 cahnnels from given offset] [255: clear universe and load 0s]"

}


var klik_decoder_map = {
    0x02 : {name:'pix-reset',               decoder: 'reset_packet'},
    0x05 : {name:'pix-mac',                 decoder: 'mac_packet'},
    0x03 : {name:'pix-version',             decoder: 'version_packet'},
    0x04 : {name:'pix-tracking',            decoder: 'tracking_packet'},
    0x06 : {name:'pix-groups',              decoder: 'groups_packet'},
    
    0x09 : {name:'pix-friends',             decoder: 'friender_decoder'},
    0x08 : {name:'pix-friends',             decoder: 'friender_decoder'},
    0x07 : {name:'pix-friends',             decoder: 'friender_decoder'},

    0x0D : {name:'pix-data',                decoder: 'data_packet'},
    0x0E : {name:'pix-confirmation',        decoder: 'confirmation_packet'},

    0x12 : {name:'pix-tags',                decoder: 'tag_decoder'},
    0x13 : {name:'pix-tags-best',           decoder: 'tag_decoder'},
    0x14 : {name:'pix-tags-weight',         decoder: 'tag_decoder'},
    0x15 : {name:'pix-tags-best-weight',    decoder: 'tag_decoder'},
    
    0x16 : {name:'pix-bookmarks',           decoder: 'bookmark_decoder'},
    0x17 : {name:'pix-bookmarks-counter',   decoder: 'bookmark_decoder'},
    0x2F : {name:'pix-bookmarks-debug',     decoder: 'bookmark_decoder'},


    // klik and pixmob share cmd 0x20,  for now just assume its the wand one
    // 0x20 : {name:'pix-serial-number',       decoder: 'serial_number_packet'},

    // Wand commands : 
    // https://docs.google.com/spreadsheets/d/1Q3fHFNwyeWUZE8sMTbNQfRVg-VyS81cZcW8kSlxuois/edit?ts=5a833b63#gid=0

    
    // WAND Status - messages from the wand
    0x20 : {name:'wand-one-packet-status'       , decoder: 'decode_wand_one_packet_status'},
    0x21 : {name:'wand-status'                  , decoder: 'decode_wand_status'},
    0x22 : {name:'wand-button'                  , decoder: 'decode_wand_button'},

    // WAND Control - messages to the wand - todo
    0x23 : {name:'wand-full-pro2-fixture'       , encoder: 'encode_wand_full_pro2_fixture'},    // [0]address, [1..22]data
    0x24 : {name:'wand-simple-pro2-fixture'     , encoder: 'encode_wand_simple_pro2_fixture'},  // [0]address, [1]fx_speed, [2-3-4]rgb
    0x25 : {name:'wand-button-trigger'          , encoder: 'encode_wand_button_trigger'},       // [0]duration (0=stop, 255=25 seconds)
    0x26 : {name:'wand-feedback-config'         , encoder: 'encode_wand_feedback_config'},      // [0]interval [1]button_config b0:idle b1:press b2:release
    0x27 : {name:'wand-rssi-filter'             , encoder: 'encode_wand_rssi_filter'},          // [0]rssi
    0x28 : {name:'wand-mac-filter'              , encoder: 'encode_wand_mac_filter'},           // [0-1-2]mac
    0x29 : {name:'wand-save-fixture'            , encoder: 'encode_wand_save_fixture'},         // [0]address, if 0:clear universe starting at 1] [1..22]data
    0x2A : {name:'wand-save-current-universe'   , encoder: 'encode_wand_save_current_universe'},
    0x2B : {name:'wand-load-fixture'            , encoder: 'encode_wand_load_fixture'},         //  [0: load full dmx-frame from memory] [1-254: load 22 cahnnels from given offset] [255: clear universe and load 0s]"

    0x33 : {name:'reset-color',             decoder: 'reset_color_decoder'},
    
    0x3A : {name:'1-click-config',          decoder: 'one_click_config_decoder'},
    0x3B : {name:'1-click-friender-rgb',    decoder: 'one_click_friender_decoder'},
    0x3C : {name:'suspend-one-click',       decoder: 'suspend_one_click_decoder'},
    0x3D : {name:'not-confirmation',        decoder: 'not_confirmation_decoder'},
    
    0x3E : {name:'clicked',                 decoder: 'clicked_decoder'},
    0x3F : {name:'holding',                 decoder: 'holding_decoder'},
    
    0x4B : {name:'set-confirmation',        decoder: 'set_confirmation_decoder'},
    0x4C : {name:'get-confirmation',        decoder: 'get_confirmation_decoder'},
    0x4D : {name:'set-get-confirmation',    decoder: 'set_get_confirmation_decoder'},
    
    0x41 : {name:'id2',                     decoder: 'id2_decoder'},
    0x42 : {name:'id3',                     decoder: 'id3_decoder'},
    
    0x43 : {name:'set-mac',                 decoder: 'set_mac_decoder'},
    0x44 : {name:'set-serial',              decoder: 'set_serial_number_decoder'},

    0x4E : {name:'multi-tracking-short',    decoder: 'short_multi_tracking_decoder'},
    0x4F : {name:'multi-tracking',          decoder: 'multi_tracking_decoder'},
    0x50 : {name:'tracking',                decoder: 'tracking_decoder'},
    0x51 : {name:'temp-tracking',           decoder: 'temp_tracking_decoder'},

    0x52 : {name:'rssi',                    decoder: 'rssi_decoder'},
    
    0x55 : {name:'group',                   decoder: 'group_decoder'},
    0x56 : {name:'group-any',               decoder: 'group_any_decoder'},
    0x57 : {name:'group-range',             decoder: 'group_range_decoder'},
    0x58 : {name:'group-match-all',         decoder: 'group_match_all_decoder'},
    0x59 : {name:'group-program-all',       decoder: 'group_program_all_decoder'},
    0x5A : {name:'group-program',           decoder: 'group_program_decoder'},
    0x5B : {name:'group-active-layer',      decoder: 'group_active_layer_decoder'},
    
    0x60 : {name:'start-stop-tx',           decoder: 'start_stop_tracking_decoder'},

    0x80 : {name:'data-write',              decoder: 'write_data_decoder'},
    0x81 : {name:'data-multiple-data',      decoder: 'write_multiple_data_decoder'},
    0x82 : {name:'data-get',                decoder: 'get_data_decoder'},
    
    0x83 : {name:'data-match',              decoder: 'match_data_decoder'},
    0x84 : {name:'data-bigger',             decoder: 'match_data_decoder'},
    0x85 : {name:'data-smaller',            decoder: 'match_data_decoder'},
    0x86 : {name:'data-range',              decoder: 'match_range_data_decoder'},
    
    0x87 : {name:'data-add',                decoder: 'add_data_decoder'},
    0x88 : {name:'data-mask',               decoder: 'bit_mask_data_decoder'},
    0x89 : {name:'data-bytes-match',        decoder: 'byte_match_data_decoder'},
    0x8A : {name:'data-modulo',             decoder: 'modulo_data_decoder'},
    
    0x8F : {name:'polling',                 decoder: 'polling_decoder'},
    
    0xA0 : {name:'rx-level',                decoder: 'rx_level_decoder'},
    0xA1 : {name:'rx-level-timeout',        decoder: 'rx_level_timeout_decoder'},
    0xA2 : {name:'rx-faster-level-timeout', decoder: 'rx_faster_level_timeout_decoder'},
    0xA3 : {name:'wakeup',                  decoder: 'wakeup_decoder'},
    0xA4 : {name:'wakeup',                  decoder: 'wakeup_decoder'},
    0xA5 : {name:'rx-patch',                decoder: 'rx_patch_decoder'},
    
    0xB0 : {name:'reset-boot-counter',      decoder: 'reset_boot_counter_decoder'},
    0xB1 : {name:'select-version',          decoder: 'select_by_version_decoder'},
    0xB2 : {name:'factory-reset',           decoder: 'factory_reset_decoder'},
    0xB4 : {name:'reset-bump-counter',      decoder: 'reset_bump_counter_decoder'},
    
    0xB5 : {name:'sleep-on-click-rssi',     decoder: 'go_to_sleep_on_click_decoder'},
    0xB6 : {name:'sleep-on-click-key',      decoder: 'go_to_sleep_on_click_and_key_match_decoder'},
    0xB7 : {name:'set-key',                 decoder: 'set_key_decoder'},
    0xB8 : {name:'match-key',               decoder: 'match_key_decoder'},
    0xB9 : {name:'sleep',                   decoder: 'go_to_sleep_decoder'},
    0xBA : {name:'ble-wakeup',              decoder: 'ble_wakeup_decoder'},
    
    0xBB : {name:'lock',                    decoder: 'lock_decoder'},
    0xBC : {name:'is-locked',               decoder: 'is_locked_decoder'},
    
    0xBE : {name:'set-location',            decoder: 'set_location_decoder'},
    0xBF : {name:'is-location',             decoder: 'is_location_decoder'},
    
    0xC0 : {name:'tag-enable',              decoder: 'tag_enable_decoder'},
    0xC1 : {name:'tag-configure',           decoder: 'tag_configure_decoder'},
    0xC2 : {name:'tag-weight-configure',    decoder: 'tag_configure_weight_decoder'},
    0xC3 : {name:'tag-limit-configure',     decoder: 'tag_configure_limit_decoder'},

    0xC4 : {name:'bookmark-enable',         decoder: 'bookmark_enable_decoder'},
    0xC6 : {name:'bookmark-event',          decoder: 'bookmark_event_decoder'},
    0xC7 : {name:'bookmark-now-enable',     decoder: 'bookmark_enable_decoder'},
    0xC8 : {name:'bookmark-event-object',   decoder: 'bookmark_event_object_decoder'},
    0xC9 : {name:'bookmark-get',            decoder: 'bookmark_get_decoder'},
    0xCA : {name:'bookmark-erase',          decoder: 'bookmark_erase_decoder'},
    0xCB : {name:'bookmark-format',         decoder: 'bookmark_format_decoder'},
    0xCC : {name:'bookmark-event-short',    decoder: 'bookmark_event_short_decoder'},
    
    0xCD : {name:'shedule-tx-payload',      decoder: 'schedule_tx_payload_decoder'},
    0xCE : {name:'set-tx-payload',          decoder: 'set_tx_payload_decoder'},
    0xCF : {name:'tx-config',               decoder: 'tx_configure_decoder'},

    0xE0 : {name:'video',                   decoder: 'video_effect_decoder'},
    0xE1 : {name:'simple-pro',              decoder: 'simple_pro_effect_decoder'},
    0xE4 : {name:'micro-pro',               decoder: 'micro_pro_effect_decoder'},
    0xED : {name:'extensible',              decoder: 'extensible_effect_decoder'},
    0xEE : {name:'pro',                     decoder: 'pro_effect_decoder'},
    
    0xEF : {name:'friender-color',          decoder: 'friender_confirmation_color_decoder'},
    0xF0 : {name:'friender-enable',         decoder: 'friender_enable_decoder'},
    0xF1 : {name:'friender-config',         decoder: 'friender_config_decoder'},
    0xF2 : {name:'friender-add-me',         decoder: 'friender_add_me_decoder'},
    0xF3 : {name:'friender-add',            decoder: 'friender_add_this_decoder'},
    0xF4 : {name:'friender-erase',          decoder: 'friender_erase_this_decoder'},
    0xF5 : {name:'friender-get',            decoder: 'friender_get_decoder'},
    0xF8 : {name:'friender-format',         decoder: 'friender_format_decoder'},
    0xF9 : {name:'friender-config-effect',  decoder: 'friender_effect_config_decoder'},
    0xF9 : {name:'friender-present',        decoder: 'friender_present_decoder'},
    
    0xFE : {name:'change-type',             decoder: 'change_type_decoder'},
}


const KLIK_VIDEO = {
    command : 0xE0,
    effect : [ 'video' ],
    speed  : null,
    probability : null,
    impact : ['off', 'on']
}  

const KLIK_MICRO_PRO = {
    command : 0xE4,
    effect : [ 'pulse', 'pulse-close', 'pulse-open', 'bump' ],
    speed  : [ 'fast', 'normal', 'slow', 'slowest' ],
    probability : null,
}

const KLIK_SIMPLE_PRO = {
    command : 0xE1,
    effect : ['blackout', 'bump', 'strobe', 'x-fade', 'pulse', 'pulse-close', 'pulse-open', 'background' ],
    speed  : ['fastest', 'fast', 'normal', 'slow', 'slowest' ],
    probability : null,
}

const MICRO_EFFECT = {
    'pulse'      : 0,
    'pulse-close': 1,
    'pulse-open' : 2,
    'bump'       : 3
};

const MICRO_SPEED = {
    'fast'       : 0,
    'normal'     : 1,
    'slow'       : 2,
    'slowest'    : 3
};

const PRO_EFFECT = {
    'blackout'   : 0,
    'bump'       : 1,
    'strobe'     : 2,
    'x-fade'     : 3,
    'pulse'      : 4,
    'pulse-close': 5,
    'pulse-open' : 6,
    'background' : 7
};

const PRO_SPEED = {
    'fastest'    : 0,
    'fast'       : 1,
    'normal'     : 2,
    'slow'       : 3,
    'slowest'    : 4
};

const EXTENSIBLE_EFECT = {
    'pulse'              : 0,
    'pulse-close'        : 1,
    'pulse-open'         : 2,
    'fat-pulse'          : 3,
    'strobe'             : 4,
    'fat-strobe'         : 5,
    'fat-close-pulse'    : 6,
    'fat-open-pulse'     : 7,
    'almost-open-pulse'  : 8,
    'almost-close-pulse' : 9,
    'fade-in-and-sustain': 10,
    'bump'               : 254,
    'background'         : 255
};


var KlikBLEPacket = function (payload, name, rssi=0) {
    this.payload = payload ? payload.slice(0) : [];
    this.name = name;
    this.rssi = rssi;
    this.decoded_packet = [];
}


KlikBLEPacket.prototype.get_command_type = function () {
    return this.payload.length ? this.payload[0] : null;
}



KlikBLEPacket.prototype.decode_next_command = function () {
    if (this.payload.length == 0) { 
        if (this.decoded_packet.length == 0) {
            this.decoded_packet.push({type:'empty'});
        }
        return false;
    }

    var type = this.get_command_type();
    var from = type <= 0x31 ? 'pixel' : 'transmitter';

    if (!(type in klik_decoder_map)) {  
        //* consume the packet:
        var result =  {type:'unsupported', raw:this.payload.slice(0) }; 
        this.decoded_packet.push(result);
        this.payload.splice(0, this.payload.length);
        return false;
   
    }

    var result = {};
    result[klik_decoder_map[type].name] = this[klik_decoder_map[type].decoder]();
    this.decoded_packet.push(result);

    return true;
}


KlikBLEPacket.prototype.decode = function() {
    const KNOWN_LOCAL_NAMES = { 'PIX':null, 'TAG':null, 'GPS':null, 'BRO':null, 'REG':null, 'FRI':null, 'WND':null };
    
    var sanity = 0;
    if (!this.name) {
        console.log('ERROR: give me a name');
        return this.decoded_packet;
    }

    // console.log("klik:", this.name, this.payload);
    if(!(this.name.slice(0,3) in KNOWN_LOCAL_NAMES)) { 
        this.decoded_packet.push({type:'unsupported-local-name'});
        // console.log('unsupported-local-name', this.name.slice(0,3));
        return null;
    }

    // check if data is coming from an ipad, if localname contains PAD
    // if that's the case we reverse the payload
    if (this.name.match('PAD')) {
        this.payload.reverse();
    }

    while (this.decode_next_command()) {
        if (sanity++ > 10) {
            //* keep this, in case one of the decoder fail, and does not consume the packet
            console.log('This is INSANE'); 
            console.log(this.payload);
            this.decoded_packet.push({type:'decoder offerflow'});
            return null;
        }         
    }

    // console.log(this.decoded_packet);
    return this.decoded_packet;
}


//* PIXEL SIDE PACKETS *********************************************************************************

KlikBLEPacket.prototype.version_packet = function() {
    var version = "";
    for (var i = 1; i < this.payload.length; i++) {
        version += String.fromCharCode(this.payload[i]);
    }

    //* remove the consumed data from the packet
    this.payload.splice(0, this.payload.length);
    return version;
}


KlikBLEPacket.prototype.reset_packet = function() {
    var result = {};
    var reset = make_number_from_byte_array(this.payload.slice(1, 3));
    var voltage = make_number_from_byte_array(this.payload.slice(3, 5));
    var temperature = this.payload[5];
    var since = make_number_from_byte_array(this.payload.slice(6, 9));
    var bumps = make_number_from_byte_array(this.payload.slice(9, 13));

    result = {reset:reset, voltage:voltage, temperature:temperature, since:since, bumps:bumps};

    this.payload.splice(13, this.payload.length);

    if(this.payload.length) {
        result['friends'] =  this.payload[0];
        result['tags'] =  this.payload[1];
        result['bookmarks'] = this.payload[2];
    }

    //* remove the consumed data from the packet
    this.payload.splice(0, this.payload.length);
    return result;
}


KlikBLEPacket.prototype.tracking_packet = function() {
    // console.log('>>>>>',this.payload);
    var result = { 
        interval:this.payload[1],
        duration:make_number_from_byte_array(this.payload.slice(2,4)),
        type:this.payload.slice(4, 8),
        power:this.payload[8],
        bursts:this.payload[9],
        burst_interval:this.payload[10],
        sequential:this.payload[11]     
    };

    //* remove the consumed data from the packet
    this.payload.splice(0, this.payload.length);
    return result;
}


KlikBLEPacket.prototype.mac_packet = function() {
    var result = { mac:to_hex(this.payload.slice(1, 9))};
    //* remove the consumed data from the packet
    this.payload.splice(0, this.payload.length);
    return result;
}


KlikBLEPacket.prototype.groups_packet = function() {
    var result = { active:this.payload[1], groups:this.payload.slice(2, 2+8) };
    //* remove the consumed data from the packet
    this.payload.splice(0, this.payload.length);
    return result;
}


KlikBLEPacket.prototype.data_packet = function() {
    var result = { offset:this.payload[1], data:this.payload.slice(2, this.payload.length) };
    //* remove the consumed data from the packet
    this.payload.splice(0, this.payload.length);
    return result;
}


KlikBLEPacket.prototype.confirmation_packet = function() {
    var result = this.payload[1];
    //* remove the consumed data from the packet
    this.payload.splice(0, this.payload.length);
    return result;
}


KlikBLEPacket.prototype.serial_number_packet = function() {
    var result = {
        manufacturing:to_hex(this.payload.slice(1, 5)),
        serial_number:'0x' + to_hex(this.payload.slice(5, 9))
    };
    //* remove the consumed data from the packet
    this.payload.splice(0, this.payload.length);
    return result;
}


// def assemble_value(buffer, little_endian=False):
//     result = 0
//     if little_endian:
//         buffer.reverse()
//     for x in buffer:
//         result *= 256
//         result += x
//     return result


function val(buffer) {
    var val = 0;
    for (var x in buffer) {
        val *= 256;
        val += buffer[x];
    }
    return val;
}

function array(buffer, start, end) {
    return buffer.slice(start, end+1);
}

function val_array(buffer, start, end) {
    return val(buffer.slice(start, end+1));
}


// wand_one_packet_status
// size : 15
// ---
// [0: button-status 0=release, 1=pressed, 2=double-click]
// [1: ir-on ]
// [2: dmx-fps]
// [3-4: button press counter]
// [5-6: voltage in mV]
// [7-8: tx interval]
// [9-10: reset qty]
// [11-12-13-14: time since last boot]

KlikBLEPacket.prototype.decode_wand_one_packet_status = function() {
    var p = this.payload.slice(1);
    var result = {
        bluetooth   : p[2],
        infrared    : p[1],
        button      : p[0],
        counter     : val_array(p, 3, 4),
        voltage     : val_array(p, 5, 6)/1000.,
        interval    : val_array(p, 7, 8),
        reset       : val_array(p, 9, 10),
        uptime      : String(val_array(p, 11, 14)).toHHMMSS()
    };
    //* remove the remaining data from the packet
    this.payload.splice(0, this.payload.length);
    return result;
}

// parse_wand_status
// size : 14 
// ---
// [0: dmx-count-since last tx] = ble input is working
// [1-2: tx-interval]
// [3: IR-status 0=off, 1-255=on]
// [4-5: voltage in mv]
// [6-7: reset qty]
// [8-9-10-11: time since last boot]
// [12-13: button press counter]

KlikBLEPacket.prototype.decode_wand_status = function() {
    var p = this.payload.slice(1);
    var result = {
        bluetooth   : p[0],
        interval    : val_array(p, 1, 2),
        infrared    : p[3],
        voltage     : val_array(p, 4, 5)/1000.,
        reset       : val_array(p, 6, 7),
        uptime      : String(val_array(p, 8, 11)).toHHMMSS(),
        counter     : val_array(p, 12, 13),
    };
    //* remove the remaining data from the packet
    this.payload.splice(0, this.payload.length);
    return result;
}


// parse_wand_button
// size : 7
// ---
// [0: button-status 0=release, 1=pressed, 2=double-click]
// [1: ir-on ]
// [2: dmx-fps]
// [3-4: button press counter]
// [5-6: voltage in mV]

KlikBLEPacket.prototype.decode_wand_button = function() {
    var p = this.payload.slice(1);
    var result = {
        button_status: p[0],
        ir_on: p[1],
        dmx_fps: p[2],
        btn_press_counter: val_array(p, 3, 4),
        voltage_mv: val_array(p, 5, 6),
    };
    //* remove the consumed data from the packet
    this.payload.splice(0, this.payload.length);
    return result;
}



KlikBLEPacket.prototype.tag_decoder = function() {
    var result = [];
    var cmd_type = this.payload[0];

    if (this.payload.length == 1) { 
        this.payload.splice(0, this.payload.length);
        return result; 
    }

    this.payload = klik_aes.decrypt(this.payload.slice(1));

    if (klik_checksum(this.payload.slice(0,15)) != this.payload[15]) {
        this.payload.splice(0, this.payload.length);        
        return [{error:'checksum failed'}];
    } 

    for (var i = 0; i < 3; i++) {
        var id = this.payload.slice(0,3);
        var id_number = make_number_from_byte_array(id);
        var b64 = base_64.array_to_base64(id);

        var tag = {id:b64};
        
        if ((cmd_type == 0x12) || (cmd_type == 0x13)) {
            var frequency = (this.payload[3] >> 4) * 3;
            var rssi = (this.payload[3] & 0x0f) * 4 + 11;
            var since = this.payload[4];
            Object.assign(tag, {frequency:frequency, rssi:rssi, since:since});
        }
        else if ((cmd_type == 0x14) || (cmd_type == 0x15)) {
            var weight = make_number_from_byte_array(this.payload.slice(3, 5));
            Object.assign(tag, {weight:weight});
        }
        else {
            console.log('should never happen', cmd_type);
        }

        if (id_number != 0) { result.push(tag); }

        this.payload = this.payload.slice(5);
    }

    //* remove the consumed data from the packet
    this.payload.splice(0, this.payload.length);
    return result;
}


KlikBLEPacket.prototype.bookmark_decoder = function() {
    var result = [];

    if (this.payload.length == 1) { 
        this.payload.splice(0, this.payload.length);
        return result; 
    }

    var bookmark_type = this.payload[0];
    this.payload = klik_aes.decrypt(this.payload.slice(1));

    if (klik_checksum(this.payload.slice(0,15)) != this.payload[15]) {
        this.payload.splice(0, this.payload.length);
        return [{error:'checksum failed'}];
    } 

    if (bookmark_type == 0x16) {
        for (var i = 0; i < 3; i++) {
            var id = this.payload.slice(0,3);
            var id_number = make_number_from_byte_array(id);
            var since = this.payload.slice(3,5);
            since = make_number_from_byte_array(since);
            if (since == 0x7fff) { since = -1; }
            else { since *= 10; }

            if (id_number != 0) {
                result.push({id:id_number, since:since});
            }
            this.payload = this.payload.slice(5);
        }
    }
    else if (bookmark_type == 0x17) {
        for (var i = 0; i < 3; i++) {
            var counter = this.payload[0];
            var id = this.payload.slice(1,3);
            var id_number = make_number_from_byte_array(id);
            var since = this.payload.slice(3,5);
            since = make_number_from_byte_array(since);
            if (since == 0x7fff) { since = -1; }
            else { since *= 10; }

            if (id_number != 0) {
                result.push({id:id_number, counter:counter, since:since});
            }
            this.payload = this.payload.slice(5);
        }       
    }
    else if (bookmark_type == 0x2F) {
        for (var i = 0; i < 3; i++) {
            var id = this.payload.slice(1,3);
            var id_number = make_number_from_byte_array(id);            
            var weight = make_number_from_byte_array(this.payload.slice(3,5));

            if (id_number != 0) {
                result.push({id:id_number, weight:weight});
            }
            this.payload = this.payload.slice(5);
        }       
    }

    //* remove the consumed data from the packet
    this.payload.splice(0, this.payload.length);
    return result;
}


KlikBLEPacket.prototype.friender_decoder = function() {
    var result = [];

    if (this.payload.length == 1) { 
        this.payload.splice(0, this.payload.length);
        return result;
    }

    if (this.payload[0] == 0x08) {
        this.payload = klik_aes.decrypt(this.payload.slice(1));
    }
    else {
        this.payload = this.payload.slice(1);
    }

    if (klik_checksum(this.payload.slice(0,15)) != this.payload[15]) {
        console.log('failed-ck', klik_checksum(this.payload.slice(0,15)), this.payload[15]);
        this.payload.splice(0, this.payload.length);
        return [{error:'checksum failed'}];
    } 

    for (var i = 0; i < 3; i++) {
        var id = this.payload.slice(0,3);
        var id_number = make_number_from_byte_array(id);
        var b64 = base_64.array_to_base64(id);
        var since = this.payload.slice(3,5);
        since = make_number_from_byte_array(since);

        if(since == 0xffff) { since = -1; }
        else { since *= 10; }

        if(id_number != 0) {
            result.push({id:b64, since:since});
        }
        this.payload = this.payload.slice(5);
    }

    //* remove the consumed data from the packet
    this.payload.splice(0, this.payload.length);
    return result;
}


//* BOOKMARKS *********************************************************************************

KlikBLEPacket.prototype.bookmark_event_decoder = function() {
    var id = this.payload.slice(1,4);
    id = make_number_from_byte_array(id);
    // var dummy = this.payload[4];

    var reconfirmation = this.payload[5];
    reconfirmation = reconfirmation >> 3;
    if (reconfirmation == 0) { 
        reconfirmation = 'once';
    }
    else if (reconfirmation < 5) { 
        reconfirmation = [null , 5, 10, 30, 60][reconfirmation]; 
        reconfirmation = '' + reconfirmation + 'sec';
    }
    else if (reconfirmation < 32) {
        reconfirmation = (reconfirmation - 4) * 5;
        reconfirmation = '' + reconfirmation + 'min';
    }   
    else {
        console.log('ERROR');
    }

    var priority = this.payload[5] & 0x03;

    var micro_pro = new KlikBLEPacket([0xe4].concat(this.payload.slice(6,8)), this.name);
    micro_pro = micro_pro.decode()[0]['micro-pro'];

    this.payload.splice(0, 8);
    return {id:id, reconfirmation:reconfirmation, priority:priority, micro_pro:micro_pro };
}


KlikBLEPacket.prototype.bookmark_event_short_decoder = function() {
    var id = this.payload.slice(1,3);
    id = make_number_from_byte_array(id);
    
    var reconfirmation = this.payload[3];
    reconfirmation = reconfirmation >> 3;
    if (reconfirmation == 0) { 
        reconfirmation = 'once';
    }
    else if (reconfirmation < 5) { 
        reconfirmation = [null, 5, 10, 30, 60][reconfirmation]; 
        reconfirmation = '' + reconfirmation + 'sec';
    }
    else if (reconfirmation < 32) {
        reconfirmation = (reconfirmation - 4) * 5;
        reconfirmation = '' + reconfirmation + 'min';
    }   
    else {
        console.log('ERROR');
    }

    var priority = this.payload[3] & 0x03;

    var micro_pro = new KlikBLEPacket([0xe4].concat(this.payload.slice(4,6)), this.name);
    micro_pro = micro_pro.decode()[0]['micro-pro'];

    this.payload.splice(0,6);
    return {id:id, reconfirmation:reconfirmation, priority:priority, micro_pro:micro_pro };
}


KlikBLEPacket.prototype.bookmark_event_object_decoder = function() {
    var id = this.payload.slice(1,4);
    // var dummy = this.payload[4];
    id = make_number_from_byte_array(id);

    var micro_pro = new KlikBLEPacket([0xe4].concat(this.payload.slice(5,7)), this.name);
    micro_pro = micro_pro.decode()[0]['micro-pro'];

    this.payload.splice(0,7);

    return { id:id, micro_pro:micro_pro };
}


KlikBLEPacket.prototype.bookmark_enable_decoder = function() {
    var enable = this.payload[1];

    this.payload.splice(0,2);
    return enable ? true : false;
}


KlikBLEPacket.prototype.bookmark_get_decoder = function() {
    var index = this.payload[1];
    var duration = this.payload[2]*10

    this.payload.splice(0,3);
    return {index:index, duration:duration};
}


KlikBLEPacket.prototype.bookmark_erase_decoder = function() {
    var id = make_number_from_byte_array(this.payload.slice(1, 3))         ;

    this.payload.splice(0,3);
    return id;
}


KlikBLEPacket.prototype.bookmark_format_decoder = function() {
    var b64 = base_64.array_to_base64(this.payload.slice(1, 4));

    this.payload.splice(0,4);
    return b64;
}



KlikBLEPacket.prototype.polling_decoder = function() {
    this.payload.splice(0,1);
    return true;
}


//* TRACKING AND TX *********************************************************************************

KlikBLEPacket.prototype.multi_tracking_decoder = function() {
    var result = { 
        interval:this.payload[1],
        duration:make_number_from_byte_array(this.payload.slice(2,4))*10,
        type:this.payload.slice(4, 8),
        power:this.payload[8]   
    };

    this.payload.splice(0, 9);
    return result;
}


KlikBLEPacket.prototype.short_multi_tracking_decoder = function() {
    var result = { 
        interval:this.payload[1],
        type:this.payload.slice(2, 6),
    };

    this.payload.splice(0, 6);
    return result;
}


KlikBLEPacket.prototype.tracking_decoder = function() {
    var result = { 
        interval:this.payload[1],
        duration:make_number_from_byte_array(this.payload.slice(2,4))*10,
        type:this.payload[4],
        power:this.payload[5]   
    };

    this.payload.splice(0, 7);
    return result;
}


KlikBLEPacket.prototype.temp_tracking_decoder = function() {
    var result = { 
        duration:this.payload[1]*10,
        type:this.payload[2],
    };

    this.payload.splice(0, 6);
    return result;
}


KlikBLEPacket.prototype.start_stop_tracking_decoder = function() {
    var start = this.payload[1];

    this.payload.splice(0, 2);
    return start ? 'start' : 'stop';
}


KlikBLEPacket.prototype.schedule_tx_payload_decoder = function() {
    const name = {0:'PIX', 1:'TAG', 2:'SPK', 3:'TRK', 4:'MRK', 5:'FLG'};

    var tx_as = name[this.payload[1] >> 5];
    if (tx_as == undefined) { tx_as = 'not-supported'; }
    
    var size = this.payload[1] & 0x1f;

    var when = this.payload[2];
    
    var decoded = new KlikBLEPacket(this.payload.slice(3, 3+size), this.name);
    decoded = decoded.decode();

    this.payload.splice(0,3 + size);
    return {as:tx_as, when:when,  payload:decoded};
}


KlikBLEPacket.prototype.set_tx_payload_decoder = function() {
    const name = {0:'PIX', 1:'TAG', 2:'SPK', 3:'TRK', 4:'MRK', 5:'FLG'};

    var tx_as = name[this.payload[1] >> 5];
    if (tx_as == undefined) { tx_as = 'not-supported'; }
    
    var size = this.payload[1] & 0x1f;
    
    var decoded = new KlikBLEPacket(this.payload.slice(2, 2+size), this.name);
    decoded = decoded.decode();

    this.payload.splice(0,2 + size);
    return {as:tx_as, payload:decoded};
}


//* CONFIRMATION *********************************************************************************

KlikBLEPacket.prototype.not_confirmation_decoder = function() {
    var result = this.payload[1];

    this.payload.splice(0, 2);
    return result;
}


KlikBLEPacket.prototype.set_confirmation_decoder = function() {
    var result = this.payload[1];

    this.payload.splice(0, 2);
    return result;
}


KlikBLEPacket.prototype.set_get_confirmation_decoder = function() {
    var result = this.payload[1];

    this.payload.splice(0, 2);
    return result;
}


KlikBLEPacket.prototype.get_confirmation_decoder = function() {
    var result =  this.payload[1]*10;

    this.payload.splice(0, 2);
    return result;
}

//* SELECTORS *********************************************************************************

KlikBLEPacket.prototype.rssi_decoder = function() {
    var rssi = this.payload[1];
    this.payload.splice(0,2);
    return rssi;
}

KlikBLEPacket.prototype.id3_decoder = function() {
    var name = this.payload.slice(1, 4);
    var result = base_64.array_to_base64(name);

    this.payload.splice(0, 4);
    return result;
}


KlikBLEPacket.prototype.id2_decoder = function() {
    var name = this.payload.slice(1, 3);
    // var result = base_64.array_to_base64(name);
    var result = '0x' + to_hex(name);

    this.payload.splice(0, 3);
    return result;
}


KlikBLEPacket.prototype.clicked_decoder = function() {
    this.payload.splice(0, 1);
    return true;
}


KlikBLEPacket.prototype.holding_decoder = function() {
    this.payload.splice(0, 1);
    return true;
}


KlikBLEPacket.prototype.select_by_version_decoder = function () {
    var major = this.payload[1];
    var minor = this.payload[2];
    var fixe = this.payload[3];
    
    this.payload.splice(0, 4);
    return {major:major, minor:minor, fixe:fixe};
}

//* ONE-CLICK *********************************************************************************

KlikBLEPacket.prototype.suspend_one_click_decoder = function() {
    var key = this.payload.slice(1, 3);

    this.payload.splice(0, 3);
    return '0x' + to_hex(key);
}


KlikBLEPacket.prototype.one_click_config_decoder = function() {
    var enable = this.payload[1];
    var progression_rgb = this.payload.slice(2, 2+3);
    var progression_effect = this.payload[5];
    var progression_duration = this.payload[6] * 100;

    this.payload.splice(0, 7);
    return {enable:enable, progression_rgb:progression_rgb, progression_effect:progression_effect, progression_duration:progression_duration};
}


KlikBLEPacket.prototype.one_click_friender_decoder = function() {
    var pulses = this.payload[1];
    var effect = this.payload[2];
    var duration = this.payload[3] * 10;

    this.payload.splice(0, 4);
    return {pulses:pulses, effect:effect, duration:duration};
}


//* COLOR EFFECTS *********************************************************************************

KlikBLEPacket.prototype.tx_configure_decoder = function() {
    var burst = this.payload[1];
    var intervals = this.payload[2] * 10;
    var sequential = this.payload[3];

    this.payload.splice(0, 4);
    return {burst:burst, intervals:intervals, sequential:sequential};
}





KlikBLEPacket.prototype.video_effect_decoder = function () {
    if (this.payload[1] & 0x02) {
        console.log('video-colorwhel');
        this.payload.splice(0, 5);
        return "color-wheel, not decoded";
    }

    var green = this.payload[2];
    var red = this.payload[3];
    var blue = this.payload[4];
    var impact = this.payload[1] & 0x01 ? true : false;

    this.payload.splice(0, 5);
    return {rgb:[red, green, blue], impact:impact };
}




KlikBLEPacket.prototype.extensible_effect_decoder = function () {
    var red = this.payload[1];
    var green = this.payload[2];
    var blue = this.payload[3];
    var effect = find_by_value(this.payload[4], EXTENSIBLE_EFECT);

    var duration = make_number_from_byte_array(this.payload.slice(5, 7));

    this.payload.splice(0, 7);
    return {rgb:[red, green, blue], effect:effect, duration:duration };
}



KlikBLEPacket.prototype.micro_pro_effect_decoder = function () {
    var red    =  this.payload[1] & 0xf0;
    var green  = (this.payload[1] & 0x0f) << 4;
    var blue   =  this.payload[2] & 0xf0;
    var effect = find_by_value((this.payload[2]>>2) & 0x03, MICRO_EFFECT); 
    var speed  = find_by_value(this.payload[2] & 0x03, MICRO_SPEED);

    this.payload.splice(0, 3);
    return {effect:effect, speed:speed, rgb:[red, green, blue] };
}


KlikBLEPacket.prototype.simple_pro_effect_decoder = function () {
    var effect = find_by_value((this.payload[1]) & 0x07, PRO_EFFECT); 
    var speed  = find_by_value((this.payload[1] >> 4) & 0x07, PRO_SPEED);
    var red    =  this.payload[2];
    var green  =  this.payload[3];
    var blue   =  this.payload[4];

    this.payload.splice(0, 5);
    return {effect:effect, speed:speed, rgb:[red, green, blue] };
}


KlikBLEPacket.prototype.pro_effect_decoder = function () {

    if(this.payload[1] & 0x02 ) { 
        this.payload.splice(0, 8);
        return "color-wheel, not decoded";
    }

    if(this.payload[1] & 0x04) {
        this.payload.splice(0, 8);
        return 'commando, not decoded'
    }

    var green  =  this.payload[2];
    var red    =  this.payload[3];
    var blue   =  this.payload[4];
    var fade_in = this.payload[5] >> 3;
    var probability = this.payload[5]  & 0x07;
    var fade_out = this.payload[6] >> 3;
    var sustain = this.payload[6] & 0x07;
    var group = this.payload[7] & 0x07; 
    var impact = this.payload[1] & 0x01 ? true : false;


    this.payload.splice(0, 8);
    return {probability:probability, group:group, rgb:[red, green, blue], fade_in:fade_in, sustain:sustain, fade_out:fade_out, impact:impact };
}



//* MEMORY-BANK *********************************************************************************

KlikBLEPacket.prototype.write_data_decoder = function () {
    var offset = this.payload[1];
    var data = this.payload[2];

    this.payload.splice(0, 3);
    return {offset:offset, data:data};
}


KlikBLEPacket.prototype.write_multiple_data_decoder = function () {
    var offset = this.payload[1];
    var size = this.payload[2];
    var data = this.payload.slice(3, 3 + size);

    this.payload.splice(0, 2 + size);
    return {offset:offset, data:data};
}


KlikBLEPacket.prototype.get_data_decoder = function () {
    var offset = this.payload[2];
    var size = this.payload[3];
    var duration = this.payload[1] * 10;

    this.payload.splice(0, 4);
    return {offset:offset, size:size, duration:duration};
}


KlikBLEPacket.prototype.match_data_decoder = function () {
    var types = {0x83:'equal', 0x84:'bigger', 0x85:'smaller'};
    var type = types[this.payload[0]];

    var offset = this.payload[1];
    var value = this.payload[2];

    this.payload.splice(0, 3);
    return {match_type:type, offset:offset, value:value};
}


KlikBLEPacket.prototype.match_range_data_decoder = function () {
    var offset = this.payload[1];
    var min = this.payload[2];
    var max = this.payload[3];

    this.payload.splice(0, 4);
    return {offset:offset, min:min, max:max};
}


KlikBLEPacket.prototype.add_data_decoder = function () {
    var offset = this.payload[1];
    var value = this.payload[2];
    var operation = this.payload[3]&0x01 ? '-' : '+';
    const SIZES = {1:'8bit', 2:'16bit', 4:'32bit'}
    var size = SIZES[this.payload[3] >> 4];

    this.payload.splice(0, 4);
    return {offset:offset, value:value, operation:operation, size:size};
}


KlikBLEPacket.prototype.bit_mask_data_decoder = function () {
    var offset = this.payload[1] & 0x1f;
    var size = this.payload[1] >> 5;
    size *= 2;
    var mask = this.payload.slice(2, 2+size);

    this.payload.splice(0, 2+size);
    return {offset:offset, size:size, mask:mask};
}


KlikBLEPacket.prototype.byte_match_data_decoder = function () {
    var offset = this.payload[1] & 0x1f;
    var size = this.payload[1] >> 5;
    size *= 2;
    var match = this.payload.slice(2, 2+size);

    this.payload.splice(0, 2+size);
    return {offset:offset, size:size, match:match};
}


KlikBLEPacket.prototype.modulo_data_decoder = function () {
    var offset = this.payload[1] & 0x1f;
    var modulo_offset = this.payload[1] >> 5;
    var value = this.payload[2];

    this.payload.splice(0, 3);
    return {offset:offset, modulo_offset:modulo_offset, value:value};
}

//* TAG *********************************************************************************

KlikBLEPacket.prototype.tag_enable_decoder = function () {
    var enable = this.payload[1];

    this.payload.splice(0, 2);
    return enable;
}


KlikBLEPacket.prototype.tag_configure_decoder = function () {
    var name = this.payload.slice(1, 1+3).map(function (e) {return String.fromCharCode(e)}).join('');
    var rssi_limit = this.payload[4];
    var rssi_hold = this.payload[5];
    var tag_timeout = this.payload[6];
    var frequency_slot_duration = this.payload[7]*100;
    var rssi_filter = this.payload[8];

    this.payload.splice(0, 9);
    return {name:name, rssi_limit:rssi_limit, rssi_hold:rssi_hold, tag_timeout:tag_timeout, frequency_slot_duration:frequency_slot_duration, rssi_filter:rssi_filter};
}


KlikBLEPacket.prototype.tag_configure_weight_decoder = function () {
    var since = this.payload[1];
    var frequency = this.payload[2];
    var touching = this.payload[3];
    var close = this.payload[4];
    var proximity = this.payload[5];
    var around = this.payload[6];
    var far = this.payload[7];

    this.payload.splice(0, 8);
    return {since:since, frequency:frequency, touching:touching, close:close, proximity:proximity, around:around, far:far};
}


KlikBLEPacket.prototype.tag_configure_limit_decoder = function () {
    var touching = this.payload[1];
    var close = this.payload[2];
    var proximity = this.payload[3];
    var around = this.payload[4];

    this.payload.splice(0, 5);
    return {touching:touching, close:close, proximity:proximity, around:around};
}


//* RX Activity *********************************************************************************
KlikBLEPacket.prototype.rx_level_decoder = function () {
    var level = this.payload[1];

    this.payload.splice(0, 2);
    return level;
}


KlikBLEPacket.prototype.rx_level_timeout_decoder = function () {
    var level = this.payload[1];
    var timeout = this.payload[2]*2;

    this.payload.splice(0, 3);
    return {level:level, timeout:timeout};
}


KlikBLEPacket.prototype.rx_faster_level_timeout_decoder = function () {
    var level = this.payload[1];
    var timeout = this.payload[2]*2;

    this.payload.splice(0, 3);
    return {level:level, timeout:timeout};
}

KlikBLEPacket.prototype.wakeup_decoder = function () {
    var type = this.payload[0];

    this.payload.splice(0, 1);
    return type == 0xA4 ? true : false;
}


KlikBLEPacket.prototype.rx_patch_decoder = function () {
    var rx_slot = this.payload[1];
    var win = this.payload[2]*10;
    var interval = this.payload[3]*100;
    var duration = this.payload[4];

    this.payload.splice(0, 5);
    return {slot:rx_slot, window:win, interval:interval, duration:duration};
}


//* Change Type *********************************************************************************

KlikBLEPacket.prototype.change_type_decoder = function () {
    var type = this.payload[1] == 255 ? 'tag' : 'pixel';
    var id = this.payload.slice(2,5);
    var id_number = make_number_from_byte_array(id);
    var b64 = base_64.array_to_base64(id);

    this.payload.splice(0, 5);
    return {type:type, id:b64};
}

//* Group *********************************************************************************
KlikBLEPacket.prototype.group_decoder = function () {
    var group = this.payload[1];

    this.payload.splice(0, 2);
    return group;
}


KlikBLEPacket.prototype.group_any_decoder = function () {
    var groups = this.payload.slice(1,1+4);

    this.payload.splice(0, 5);
    return groups;
}


KlikBLEPacket.prototype.group_range_decoder = function () {
    var min = this.payload[1];
    var max = this.payload[2];

    this.payload.splice(0, 3);
    return {min:min, max:max};
}


KlikBLEPacket.prototype.group_match_all_decoder = function () {
    var groups = this.payload.slice(1, 1+8);

    this.payload.splice(0, 9);
    return groups;
}


KlikBLEPacket.prototype.group_program_all_decoder = function () {
    var layer = this.payload[1];
    var groups = this.payload.slice(2, 2+8);

    this.payload.splice(0, 10);
    return {layer:layer, groups:groups};
}


KlikBLEPacket.prototype.group_program_decoder = function () {
    var layer = this.payload[1];
    var group = this.payload[2];

    this.payload.splice(0, 3);
    return {layer:layer, group:group};
}


KlikBLEPacket.prototype.group_active_layer_decoder = function () {
    var layer = this.payload[1];

    this.payload.splice(0, 2);
    return layer;
}

//* Friender *********************************************************************************

KlikBLEPacket.prototype.friender_enable_decoder = function () {
    var enable = this.payload[1];

    this.payload.splice(0, 2);
    return enable == 255 ? true : false;
}


KlikBLEPacket.prototype.friender_config_decoder = function () {
    var tx_power = this.payload[1];
    var duration = this.payload[2]*100;
    var rssi = this.payload[3];
    var rgb_confirm = this.payload.slice(4, 4+3);;
    var rgb_background= this.payload.slice(7, 7+3);;

    this.payload.splice(0, 10);
    return {rssi:rssi, duration:duration, tx_power:tx_power, rgb_confirm:rgb_confirm, rgb_background:rgb_background};
}


KlikBLEPacket.prototype.friender_add_me_decoder = function () {
    this.payload.splice(0, 1);
    return true;
}


KlikBLEPacket.prototype.friender_add_this_decoder = function () {
    var id = this.payload.slice(1, 1+3);
    var id_number = make_number_from_byte_array(id);
    var b64 = base_64.array_to_base64(id);
    
    this.payload.splice(0, 4);
    return b64;
}


KlikBLEPacket.prototype.friender_erase_this_decoder = function () {
    var id = this.payload.slice(1, 1+3);
    var id_number = make_number_from_byte_array(id);
    var b64 = base_64.array_to_base64(id);
    
    this.payload.splice(0, 4);
    return b64;
}


KlikBLEPacket.prototype.friender_get_decoder = function () {
    var index = this.payload[1];
    var tx_power = this.payload[2];
    var duration = this.payload[3]*10;

    this.payload.splice(0, 4);
    return {index:index, tx_power:tx_power, duration:duration};
}


KlikBLEPacket.prototype.friender_effect_config_decoder = function () {
    var effects = [];

    for(var i = 0; i < 3; i++) {
        var fade_in = this.payload[1 + i*3 + 0]
        var sustain = this.payload[1 + i*3 + 1]
        var fade_out = this.payload[1 + i*3 + 2]
        effects.push({fade_in:fade_in, sustain:sustain, fade_out:fade_out});
    }
    
    this.payload.splice(0, 11);
    return {confirmation:effects[0], background:effects[1], background2:effects[2]};
}


KlikBLEPacket.prototype.friender_format_decoder = function () {
    var id = this.payload.slice(1, 1+3);
    var id_number = make_number_from_byte_array(id);
    var b64 = base_64.array_to_base64(id);
    
    this.payload.splice(0, 4);
    return b64;
}


KlikBLEPacket.prototype.friender_confirmation_color_decoder = function () {
    var rgb = this.payload.slice(1, 1+3);

    this.payload.splice(0, 4);
    return rgb;
}


KlikBLEPacket.prototype.friender_present_decoder = function () {
    var id = this.payload.slice(1, 1+3);
    var id_number = make_number_from_byte_array(id);
    var b64 = base_64.array_to_base64(id);
    
    this.payload.splice(0, 4);
    return b64;
}

//*  STATS and RESET *********************************************************************************

KlikBLEPacket.prototype.reset_boot_counter_decoder = function () {
    this.payload.splice(0, 1);
    return true;
}


KlikBLEPacket.prototype.reset_bump_counter_decoder = function () {
    this.payload.splice(0, 1);
    return true;
}


KlikBLEPacket.prototype.factory_reset_decoder = function () {
    var id = this.payload.slice(1, 1+3);
    var id_number = make_number_from_byte_array(id);
    var b64 = base_64.array_to_base64(id);
    var timeout = this.payload[4];
    var to_factory = this.payload[5] == 255 ? true : false;
    
    this.payload.splice(0, 6);
    return {id:b64, when:timeout, to_factory:to_factory};
}


KlikBLEPacket.prototype.reset_color_decoder = function () {
    var color = this.payload.slice(1, 1+3);
    this.payload.splice(0, 4);
    return color;
}



//*  KEY *********************************************************************************

KlikBLEPacket.prototype.set_key_decoder = function () {
    var key = this.payload.slice(1, 1+3);

    this.payload.splice(0, 4);
    return key;
}


KlikBLEPacket.prototype.match_key_decoder = function () {
    var key = this.payload.slice(1, 1+3);

    this.payload.splice(0, 4);
    return key;
}

//*  TRANSPORT *********************************************************************************
KlikBLEPacket.prototype.go_to_sleep_on_click_decoder = function () {
    var rssi = this.payload[1];
    var key = this.payload.slice(2, 2+3);
    var valid  = true;
    if (key[0] != 0xEA) { valid = false; }
    if (key[1] != 0x5E) { valid = false; }
    if (key[2] != 0xA5) { valid = false; }

    this.payload.splice(0, 5);
    return {rssi:rssi, key:key, valid:valid};
}

KlikBLEPacket.prototype.go_to_sleep_on_click_and_key_match_decoder = function () {
    var key = this.payload.slice(1, 1+3);
    this.payload.splice(0, 4);
    return key;
}

KlikBLEPacket.prototype.go_to_sleep_decoder = function () {
    var on_click = this.payload[1] & 0x80 ? true : false;
    var use_ble_wake = this.payload[1] & 0x02 ? true : false;
    var use_click_wake = this.payload[1] & 0x01 ? true : false;

    var key = this.payload.slice(2, 2+3);

    this.payload.splice(0, 5);
    return { on_click:on_click, use_ble_wake:use_ble_wake, use_click_wake:use_click_wake,  key:key};
}

KlikBLEPacket.prototype.ble_wakeup_decoder = function () {
    this.payload.splice(0, 1);
    return true;
}

//*  LOCKS *********************************************************************************

KlikBLEPacket.prototype.lock_decoder = function () {
    var lock = this.payload[1];

    this.payload.splice(0, 2);
    return lock == 0 ? 'unlock' : 'lock';
}


KlikBLEPacket.prototype.is_locked_decoder = function () {
    this.payload.splice(0, 1);
    return true;
}




//*  LOCATION *********************************************************************************

KlikBLEPacket.prototype.set_location_decoder = function () {
    var location = this.payload[1];

    this.payload.splice(0, 2);
    return location;
}


KlikBLEPacket.prototype.is_location_decoder = function () {
    var location = this.payload[1];

    this.payload.splice(0, 2);
    return location;
}




KlikBLEPacket.prototype.set_mac_decoder = function () {
    var mac = this.payload.slice(1, 1+6);
    var id = this.payload.slice(4, 4+3);
    var id_number = make_number_from_byte_array(id);
    var b64 = base_64.array_to_base64(id);

    this.payload.splice(0, 7);
    return {hex:to_hex(mac), b64:b64};
}



KlikBLEPacket.prototype.set_serial_number_decoder = function () {
    var serial = this.payload.slice(1, 1+3);

    this.payload.splice(0, 4);
    return to_hex(serial);
}
