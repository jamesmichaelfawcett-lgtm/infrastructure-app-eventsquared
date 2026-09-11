// by JSR <jsr@pixmob.com>

var payload_bump_green = [0xe0, 0x00, 0xff, 0x00, 0x00];
var payload_bump_red   = [0xe0, 0x00, 0x00, 0xff, 0x00];
var payload_bump_blue  = [0xe0, 0x00, 0x00, 0x00, 0xff];
var payload_bump_black = [0xe0, 0x00, 0x00, 0x00, 0x00];

// activate bookmark (22), friender (8), tag (4 valeurs possibles, to find)
// python ble_cmd_generator_js.py --data [rssi 35][bookmark 127][simple-pro +rgb 255 255 255][multi-tracking-short +i 1 +t 22 8 ] --format js

// with BRO
// rssi 35 : [0x52, 0x23, 0xc4, 0x7f, 0xe1, 0x24, 0xff, 0xff, 0xff, 0x4e, 0x01, 0x16, 0x08, 0xff, 0xff]
// rssi 40 : [0x52, 0x28, 0xc4, 0x7f, 0xe1, 0x24, 0xff, 0xff, 0xff, 0x4e, 0x01, 0x16, 0x08, 0xff, 0xff]
var payload_activate_bookmark = [0x52, 0x23, 0xc4, 0x7f, 0xe1, 0x24, 0xff, 0xff, 0xff, 0x4e, 0x01, 0x16, 0x08, 0xff, 0xff]

// program a bookmark event of id 0x112233 to the tag `JSR1`, confirm with blue, while programming the tag, it will pulse red:
// python ble_cmd_generator_js.py --data [id2 +b64 JSR2][micro-pro +rgb 255 0 0][tx +type TAG  +data [bookmark-event +id 112233 +reconfirmation 0 +priority 0 +rgb 0 0 255]] --format js 
// python ble_cmd_generator_js.py --data [id3 +b64 JSR1][micro-pro +rgb 255 0 0][tx +type TAG  +data [bookmark-event +id 112233 +reconfirmation 0 +priority 0 +rgb 0 0 255]] --format js 
// python ble_cmd_generator_js.py --data [id2 +b64 nUxu][micro-pro +rgb 255 0 0][tx +type TAG  +data [bookmark-event +id 112233 +reconfirmation 0 +priority 0 +rgb 0 0 255]] --format js 
// python ble_cmd_generator_js.py --data [id2 +b64 oOpJ][micro-pro +rgb 255 0 0][tx +type TAG  +data [bookmark-event +id 112233 +reconfirmation 0 +priority 0 +rgb 0 0 255]] --format js 

// with GPS
// JSR1 : [0x41, 0x24, 0x75, 0xe4, 0xf0, 0x01, 0xce, 0x28, 0xc6, 0x11, 0x22, 0x33, 0x5a, 0x00, 0x00, 0xf1]
// JSR2 : [0x41, 0x24, 0x76, 0xe4, 0xf0, 0x01, 0xce, 0x28, 0xc6, 0x11, 0x22, 0x33, 0x5a, 0x00, 0x00, 0xf1]
// nuXu : [0x41, 0xe5, 0xee, 0xe4, 0xf0, 0x01, 0xce, 0x28, 0xc6, 0x11, 0x22, 0x33, 0x5a, 0x00, 0x00, 0xf1]
// oOpJ : [0x41, 0xea, 0x49, 0xe4, 0xf0, 0x01, 0xce, 0x28, 0xc6, 0x11, 0x22, 0x33, 0x5a, 0x00, 0x00, 0xf1]

// JSR1 in hex64 : 25 24 75
// JSR2 in hex64 : 25 24 76

// var payload_bump_green_JSR1 = [0x42, 0x25, 0x24, 0x75, 0xe0, 0x00, 0x66, 0x00, 0x00];
// var payload_bump_green_JSR2 = [0x42, 0x25, 0x24, 0x76, 0xe0, 0x00, 0x66, 0x00, 0x00];
// var payload_bump_green_nUxu = [0x41, 0x4c, 0x6e, 0xe0, 0x00, 0x66, 0x00, 0x00];
// var payload_bump_green_oOpJ = [0x41, 0xea, 0x49, 0xe0, 0x00, 0x66, 0x00, 0x00];

// var payload_program_JSR1 = [0x41, 0x24, 0x75, 0xe4, 0xf0, 0x01, 0xce, 0x28, 0xc6, 0x11, 0x22, 0x33, 0x5a, 0x00, 0x00, 0xf1]
// var payload_program_JSR2 = [0x41, 0x24, 0x76, 0xe4, 0xf0, 0x01, 0xce, 0x28, 0xc6, 0x11, 0x22, 0x33, 0x5a, 0x00, 0x00, 0xf1]
// var payload_program_nUxu = [0x41, 0x4c, 0x6e, 0xe4, 0xf0, 0x01, 0xce, 0x28, 0xc6, 0x11, 0x22, 0x33, 0x5a, 0x00, 0x00, 0xf1]
// var payload_program_oOpJ = [0x41, 0xea, 0x49, 0xe4, 0xf0, 0x01, 0xce, 0x28, 0xc6, 0x11, 0x22, 0x33, 0x5a, 0x00, 0x00, 0xf1]

// to swith a pixel to a tag
// with BRO
// python ble_cmd_generator_js.py --data [id3 +b64 6_fd][change-type +type 255 +b64 6_fd][simple-pro +rgb 0 200 0] --format js
// python ble_cmd_generator_js.py --data [id3 +b64 nUxu][change-type +type 255 +b64 nUxu][simple-pro +rgb 0 200 0] --format js
// python ble_cmd_generator_js.py --data [id3 +b64 oOpJ][change-type +type 255 +b64 oOpJ][simple-pro +rgb 0 200 0] --format js

// 6_fd : [0x42, 0xeb, 0xf7, 0xdd, 0xfe, 0xff, 0xeb, 0xf7, 0xdd, 0xe1, 0x24, 0x00, 0xc8, 0x00]
// nuXu : [0x42, 0x9d, 0x4c, 0x6e, 0xfe, 0xff, 0x9d, 0x4c, 0x6e, 0xe1, 0x24, 0x00, 0xc8, 0x00]
// oOpJ : [0x42, 0xa0, 0xea, 0x49, 0xfe, 0xff, 0xa0, 0xea, 0x49, 0xe1, 0x24, 0x00, 0xc8, 0x00]

// var payload_switch_to_tag_nUxu = [0x42, 0x9d, 0x4c, 0x6e, 0xfe, 0xff, 0x9d, 0x4c, 0x6e, 0xe1, 0x24, 0x00, 0xc8, 0x00]
// var payload_switch_to_tag_oOpJ = [0x42, 0xa0, 0xea, 0x49, 0xfe, 0xff, 0xa0, 0xea, 0x49, 0xe1, 0x24, 0x00, 0xc8, 0x00]

var get_payload_locate = function(device_b64, rgb) {
    var payload = [];
    if (device_b64!='*') {
        payload.push(0x42);
        var str = base64_to_buffer(device_b64);
        for (var i=0; i<str.length; i++) {
            payload.push(parseInt(str[i], 16));
        }
    }
    var data = [0xe0,  0x00, rgb[1], rgb[0], rgb[2]]; // video, 0x00, g, r, b
    for (var i=0; i<data.length; i++) {
        payload.push(data[i]);
    }
    return payload;
}

var get_payload_program_test = function(device_b64) {
    var payload = [0x41]; // can only use 2 bytes
    var str = base64_to_buffer(device_b64);
    for (var i=1; i<str.length; i++) { // skipping first one
        payload.push(parseInt(str[i], 16));
    }
    var data = [0xe4, 0xf0, 0x01, 0xce, 0x28, 0xc6, 0x11, 0x22, 0x33, 0x5a, 0x00, 0x00, 0xf1]; // program
    for (var i=0; i<data.length; i++) {
        payload.push(data[i]);
    }
    return payload;
}


// program `1` to offset `0`, and glow blue

// python ble_cmd_generator.py  --data [data +offset 0 +data 1][simple-pro +rgb 0 0 100] --format js
// [128, 0, 1, 225, 36, 0, 0, 100]

// python ble_cmd_generator.py  --data [data +offset 0 +data 1 2 3 4][simple-pro +rgb 0 0 100] --format js
// [129, 0, 4, 1, 2, 3, 4, 225, 36, 0, 0, 100]

// [#0 effect/speed 
//      [b7:0]
//      [b6-4:effect-speed]
//      [b3:0]
//      [b2-0:effect-type ]
// [#1 red 1B:0-255]
// [#2 green 1B:0-255]
// [#3 blue 1B:0-255]

// Based on DMX specs for PRO2
// Effect: 0 = blackout,1 = bump, 2 = strobe, 3 = x_fade, 4 = pulse, 5 = pulse_close, 6 = pulse_open, 7 =  background 
// Speed: 0 = fastest_speed, 1 = fast_speed, 2 = normal_speed, 3 = slow_speed , 4 = slowest_speed

// 36 = 0001 0100 = pulse fast_speed
// 4  = 0000 0100 = pulse fastest

var get_payload_program_custom_byte = function(device_b64, offset, value, rgb) {
    var payload = [0x42];

    var str = base64_to_buffer(device_b64);
    for (var i=0; i<str.length; i++)
        payload.push(parseInt(str[i], 16));

    var data = [128, offset, value, 225, 4, rgb[0], rgb[1], rgb[2]]; // 4  = 0000 0100 = pulse fastest
    for (var i=0; i<data.length; i++)
        payload.push(data[i]);

    return payload;
}

var get_payload_program_tag_selector = function(device_b64, selector, rgb) {
    var offset = parseInt(selector.substring(2,4), 16);
    var value  = parseInt(selector.substring(4,6), 16);
    return get_payload_program_custom_byte(device_b64, offset, value, rgb);
}

// python ble_cmd_generator.py  --data [data-match +offset 0 +data 1][simple-pro +rgb 0 0 100] --format js
// 131, 0, 1, 225, 36, 0, 0, 100]

// match pixels with data 0x01 at offset 0
// 0x83 0x00 0x01

// on 2019-05-23 we update the tag selector in the tech app to 
// match the tag_selector that the server now generates : 
// 0x89 0x32 0x00 0x23

// 0x89 : match multi bytes
// 0x32 : size : 001 10010 
//               001    : size 1*2 = 2
//               10010  : offset : 18

var get_tag_selector = function(decimal_value_1, decimal_value_2) {
    var hex = "8932" + ("00"+decimal_value_1.toString(16)).substr(-2) + ("00"+decimal_value_2.toString(16)).substr(-2);
    return hex;
}

var get_random_tag_selector = function() {
    return get_tag_selector(
        Math.floor((Math.random()*255)+1),
        Math.floor((Math.random()*255)+1)
    );
}
 
var get_payload_match_custom_byte = function(offset, value, rgb) {
    var payload = [];
    var data = [131, offset, value, 225, 4, rgb[0], rgb[1], rgb[2]]; // 4  = 0000 0100 = pulse fastest
    for (var i=0; i<data.length; i++)
        payload.push(data[i]);
    return payload;
}

var get_payload_match_selector = function(selector, rgb) {
    var offset = parseInt(selector.substring(2,4), 16);
    var value  = parseInt(selector.substring(4,6), 16);
    return get_payload_match_custom_byte(offset, value, rgb);
}

// python ble_cmd_generator_js.py --data [id3 +b64 oOpJ][change-type +type 255 +b64 oOpJ][simple-pro +rgb 0 200 0] --format js
// var payload_switch_to_tag_nUxu =
// 0x42,
// 0x9d, 0x4c, 0x6e, 
// 0xfe, 0xff, 
// 0x9d, 0x4c, 0x6e, 
// 0xe1, 0x24, 0x00, 0xc8, 0x00]

var get_payload_switch_type = function(device_b64, device_type) {
    var payload = [0x42];

    var str = base64_to_buffer(device_b64);
    for (var i=0; i<str.length; i++)
        payload.push(parseInt(str[i], 16));

    payload.push(0xfe, device_type); // tag : 255, pixel: 1-254

    for (var i=0; i<str.length; i++)
        payload.push(parseInt(str[i], 16));

    var data = [0xe1, 0x24, 0x00, 0xc8, 0x00];
    for (var i=0; i<data.length; i++)
        payload.push(data[i]);

    return payload;
}

function base64_to_buffer(base64) {
    // from websafe to normal
    // websafe : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    // normal  : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    
    base64 = base64.replace("-", "+");
    base64 = base64.replace("_", "/");

    return Array.prototype.map.call(atob(base64), function(c) {
        return c.charCodeAt(0).toString(16);
    });
}

function buffer_to_base64(buffer) {
    var char_codes = buffer.map(function(val) {
        return parseInt(val, 16)
    })
    var base64 = btoa(String.fromCharCode.apply(null, char_codes));
    return base64;
}

function test_base64(string) {
    var buffer = base64_to_buffer(string);
    var base64 = buffer_to_base64(buffer);

    console.log("*", string, buffer, base64);
}

// to swith a tag into a pixel
// with GPS
// python ble_cmd_generator_js.py --data [id3 +b64 6_fd][change-type +type 0 +b64 6_fd][simple-pro +rgb 0 200 0] --format js
// python ble_cmd_generator_js.py --data [id3 +b64 nUxu][change-type +type 0 +b64 nUxu][simple-pro +rgb 0 200 0] --format js
// python ble_cmd_generator_js.py --data [id3 +b64 oOpJ][change-type +type 0 +b64 oOpJ][simple-pro +rgb 0 200 0] --format js
