// by JSR <jsr@pixmob.com>

var programming_tag = false;
var current_device_type = null;
var closest_tag = null;
var closest_pixel = null;


function klik_touchpoint_configure(event) {
    var touchpoint = (get('highlighted-touchpoint') ||  get('selected-touchpoint') );
    if (touchpoint) {
        klik_modal_open({
            module:'device',
            data: touchpoint
        })
    }
}

function klik_tag_configure(event) {
    var tag = (get('highlighted-tag') ||  get('selected-tag') );
    if (tag) {
        klik_modal_open({
            module:'device',
            data: tag
        })
    }
}

function klik_tag_disable_notifications(event) {
    var tag = (get('highlighted-tag') ||  get('selected-tag') );
    if (tag) {
        tag.custom.notifications = 0;
    }
    set_infrastructure(tag);
}

function klik_tag_enable_notifications(event) {
    var tag = (get('highlighted-tag') ||  get('selected-tag') );
    if (tag) {
        tag.custom.notifications = 1;
    }
    set_infrastructure(tag);
}


function klik_stop_broadcasting() {
    programming_tag = false;
    current_device_type = null;
    klik_locked_device_id = null;

    klik_send_state({
        broadcast : 0,
    });
}

function klik_stop() {
    programming_tag = false;
    current_device_type = null;
    klik_locked_device_id = null;

    // stop everything
    klik_send_state({
        filter    : 0, 
        report    : 0, 
        scan      : 0, 
        broadcast : 0,
    });

    // blackout some pixels
    setTimeout(function() {
        klik_send_state({broadcast:1});
        klik_send_payload(payload_bump_black, 'GPS'); // blackout tags

        setTimeout(function() {
            klik_send_payload(payload_bump_black, 'BRO'); // blackout pixels

            setTimeout(function() {
                klik_send_state({broadcast:0});

            }, 200);
        }, 200);
    }, 200);

}


function klik_identify(device_type) {
    programming_tag = false;

    klik_send_state({
        filter    : 0, 
        report    : 0, 
        scan      : 0, 
        broadcast : 1,
    });

    if (device_type=='tags') {
        klik_send_payload(get_payload_locate('*', [100,0,0] ), 'GPS') // locate tags = red
    }

    else if (device_type=='pixels') {
        klik_send_payload(get_payload_locate('*', [0,0,160] ), 'BRO') // locate pixels = blue
    }
}


function klik_identify_device(device) {
    programming_tag = false;

    klik_send_state({
        filter    : 0, 
        report    : 0, 
        scan      : 0, 
        broadcast : 1,
    });

    var b64 = device.id.substring(3);

    if (device.type=='tag') {
        klik_send_payload(get_payload_locate(b64, [0,127,0] ), 'GPS') // locate tags = red
    }

    else if (device.type=='pixel') {
        klik_send_payload(get_payload_locate(b64, [0,127,0] ), 'BRO') // locate pixels = blue
    }
}


// function klik_lock_current_device() {
//     if (current_device_type) {
//         klik_lock(current_device_type)
//     }
// }


// function klik_lock(device_type) {

    // klik_send_state({
    //     filter    : 0, 
    //     report    : 0, 
    //     scan      : 0, 
    //     broadcast : 1,
    // });

    // if (device_type=='tags') {
    //     device = closest_tag;   
    //     klik_locked_device_id = device.b64;
    //     console.log('locking tag:', klik_locked_device_id);
    //     setTimeout(function() {
    //         klik_send_payload(get_payload_locate(device.b64, [100,100,0]),'GPS');
    //     }, 100);     
    // }
    // else if (device_type=='pixels') {
    //     device = closest_pixel;   
    //     klik_locked_device_id = device.b64;
    //     console.log('locking pixel:', klik_locked_device_id);
    //     setTimeout(function() {
    //         klik_send_payload(get_payload_locate(device.b64, [100,100,0]),'BRO');
    //     }, 100); 
    // }
    // else {
    //     console.log('unable to lock on device');
    // }
// }


const KLIK_SEARCH_MODE_CLOSEST  = 1;
const KLIK_SEARCH_MODE_FRIENDLY = 2;

var klik_search_mode = KLIK_SEARCH_MODE_FRIENDLY;

function klik_closest(device_type) {
    klik_search_mode = KLIK_SEARCH_MODE_CLOSEST
    programming_tag = false;
    current_device_type = device_type;
    var state = {
        filter : 0,
        report : 'fast',
        scan   : 1 ,
        broadcast : 1,
    }
    klik_send_state(state);
}


// close pixel that emit friendly packets
function klik_friendly(device_type) {
    klik_search_mode = KLIK_SEARCH_MODE_FRIENDLY
    programming_tag = false;
    current_device_type = device_type;
    var state = {
        filter : 0,
        report : 'fast',
        scan   : 1 ,
        broadcast : 1,
    }
    klik_send_state(state);
}


function klik_convert(device_type) {
    programming_tag = true;
    if (device_type=='tags' && closest_tag) {
        var payload = get_payload_switch_type(closest_tag.b64, 0x01); //  // switching a tag to a pixel
        klik_send_payload(payload, 'GPS');
    }
    else if (device_type=='touchpoints' && closest_pixel) {
        console.log("not doing anythign with the touchpoint");
    }
    else if (device_type=='pixels' && closest_pixel) {
        var payload = get_payload_switch_type(closest_pixel.b64, 0xFF);  // switching a pixel to a tag
        klik_send_payload(payload, 'BRO');
    }
    else {
        console.log('no device detected')
    }
}

function klik_activate(device_type) {
    programming_tag = true;
    if (device_type=='tags') {
        klik_send_payload(payload_activate_bookmark, 'GPS');
    }
    else if (device_type=='pixels') {
        klik_send_payload(payload_activate_bookmark, 'BRO');
    }
}


// klik_tags

function klik_tags_program(location_id) {
    if (klik_locked_device_id) {
        programming_tag = true;

        // program tag with id, and glow blue
        var feedback = [0,0,100];
        var location = parseInt(location_id)
        var payload = get_payload_program_custom_byte(klik_locked_device_id, 0, location, feedback); // id3, offset, value, rgb feedback
        
        klik_send_payload(payload, 'GPS');
    }
}

function klik_tags_program_selector(selector, device_id) {
    programming_tag = true;

    // program tag with id, red when reseting the selector (830000),  glow cyan otherwise
    var feedback = (selector=='830000') ? [100,0,0] : [0,100,100];
    var payload = get_payload_program_tag_selector(device_id, selector, feedback); // id3, selector, rgb feedback
    
    klik_send_payload(payload, 'GPS');
}

function klik_tags_match(location_id) {
    programming = false;

    // match tag with id, and glow pink
    var feedback = [100,0,100];
    var location = parseInt(location_id)
    var payload = get_payload_match_custom_byte(0, location, feedback); // offset, value, rgb feedback
    
    klik_send_payload(payload, 'GPS');
}

function klik_tags_match_selector(selector) {
    programming = false;

    // match tag with id, and glow pink
    var feedback = [100,0,100];
    var payload = get_payload_match_selector(selector, feedback); // selector, rgb feedback
    
    console.log(payload)
    
    klik_send_payload(payload, 'GPS');
}

function klik_get_friendly_device(data) {
    if (data.devices) {
        // console.log('looking for a device that is really close and also emitting FRI packets in the last 2 seconds');

        var closest = { rssi: -127 };
        for (var i in data.devices) {
            var dev = data.devices[i];

            if (dev.rssi!=127 && dev.rssi>-45 && dev.rssi>closest.rssi) {

                var valid = false;
                
                // accept only friender, because it is initiated on click
                if (dev.name.substring(0,3)=='FRI') {
                    valid = true;
                }

                // could also accept other devices only based on localname
                else if (current_device_type=='tags' && dev.name.substring(0,3)=='TAG' ) {
                    valid = true;
                }
                else if (current_device_type=='pixels' && dev.name.substring(0,3)=='PIX' ) {
                    valid = true;
                }

                if (valid) {
                    var time_now = (new Date()).getTime()/1000.;
                    var time_since = time_now - dev.time_updated;
                    if (time_since<2) {
                        closest = dev;
                    }
                }
                
            }
        }

        if (closest.name) {
            var device = closest;
            device.b64 = device.name.substring(3)
            if (current_device_type=='pixels') {
                device.temp_name = 'PIX'+device.b64
            }
            else if (current_device_type=='tags') {
                device.temp_name = 'TAG'+device.b64
            }
            else {
                return;
            }

            if (window.modal_notes) {
                var html = '';
                html += 'scanning for '+current_device_type;
                html += '<br><br>result <span style="color:#00ffb9;">'+device.name+'</span>, RSSI <span style="color:#00ffb9;">'+device.rssi+'</span>';
                html += '<br><br>target <span style="color:#00ffb9;">'+device.temp_name+'</span>';
                html += klik_highlight(JSON.stringify(device, null, 2));
                modal_notes.innerHTML = html;
            }

            device.name = device.temp_name;

            var payload = get_payload_locate(device.b64, [0,100,0] );
            // console.log(device.b64, device.name, device.rssi, payload);

            klik_locked_device_id = device.b64;
            
            if (device.name.substring(0,3)=='TAG') {        
                closest_tag = device;
                if (programming_tag==false) {
                    klik_send_payload(payload,'GPS');
                }
            }
            else if (device.name.substring(0,3)=='PIX') {
                closest_pixel = device;
                if (programming_tag==false) {
                    klik_send_payload(payload,'BRO');
                }
            }
        }
    }
}

function klik_get_closest_device(data) {
    if (data.devices) {
        //klik_debug.console('devices : '+ Object.keys(data.devices).length)

        var closest = { rssi: -127 };

        for (var i in data.devices) {
            if (data.devices[i].rssi>closest.rssi && data.devices[i].rssi!=127) {
                closest = data.devices[i];
            }
        }

        if (closest.name) {
            var device = closest;
            device.b64 = device.name.substring(3)

            if (window.modal_notes) {
                modal_notes.innerHTML = '<h3>'+device.name+'</h3>rssi : ' +device.rssi;
            }

            var payload = get_payload_locate(device.b64, [0,100,0] );
            //console.log(device.b64, device.name, device.rssi, payload)
            
            if (device.name.substring(0,3)=='TAG') {        
                closest_tag = device;
                if (programming_tag==false) {
                    klik_send_payload(payload,'GPS');
                }
            }
            else if (device.name.substring(0,3)=='PIX') {
                closest_pixel = device;
                if (programming_tag==false) {
                    klik_send_payload(payload,'BRO');
                }
            }
        }
        //var payload = get_payload_switch_to_tag(device_b64);
        //console.log(payload)
    }
    else {
        klik_debug.console(data);
    }
}

