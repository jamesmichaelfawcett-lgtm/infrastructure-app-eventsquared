// by JSR <jsr@pixmob.com


// ble_* static functions

function ble_set_effect(ble_interface, effect, speed, color, pixel_uid=null, duration=2000) {
    var generator = new KlikGenerator();

    if (pixel_uid) {
        if (pixel_uid.length==5 && pixel_uid[0]=='+') { // check if format is +1234, but only send 1234
            generator.id3(pixel_uid.substring(1)).simple_pro(color[0], color[1], color[2], effect, speed);
        }
    }
    else {
        generator.simple_pro(color[0], color[1], color[2], effect, speed);
    }
    
    ble_interface.send(generator.packet, 'BRO', duration);
}




// dmx_* static functions

function dmx_stop_signal(dmx_interface) {
    var dmx_values = [];
    while (dmx_values.length<34) {
        dmx_values.push(0);
    }
    dmx_interface.send(dmx_values);
}


function dmx_set_effect(dmx_interface, effect, speed, color, pixel_uid=null) {
    var dmx_values = [];

    if (DMX_PRO2_EFFECTS[effect]==undefined) {
        console.log('effect not supported, use one of the following effects:', Object.keys(DMX_PRO2_EFFECTS));
        return;
    }

    if (DMX_PRO2_SPEEDS[speed]==undefined) {
        console.log('speed not supported, use one of the following speeds:', Object.keys(DMX_PRO2_SPEEDS));
        return;
    }

    // pro 2.0
    Array.prototype.push.apply(dmx_values, [255, DMX_PRO2_EFFECTS[effect], DMX_PRO2_SPEEDS[speed], 0]);
    Array.prototype.push.apply(dmx_values, color); 
    Array.prototype.push.apply(dmx_values, [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
 

    // pro 2.5 extension
    if (pixel_uid!=null) {
        dmx_values[0] = 160 // enable target by id

        var str = pixel_uid.toString();
        while (str.length<8) {
            str = '0'+str;
        }

        var uid = [
            parseInt(str[0]+str[1]), 
            parseInt(str[2]+str[3]), 
            parseInt(str[4]+str[5]), 
            parseInt(str[6]+str[7])
        ]
        
        Array.prototype.push.apply(dmx_values, uid); // 4 uid bytes
        Array.prototype.push.apply(dmx_values, [0,0,0,0,0,0,0,0]); // 8 data bytes
    }

    if (dmx_values.length) {
        while(dmx_values.length<100) { // for some reason the wash 3.5 does not like short packets
            dmx_values.push(0)
        }

        dmx_interface.send(dmx_values);
    }
}

