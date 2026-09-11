// by VK <vk@pixmob.com>, JSR <jsr@pixmob.com

function klik_hex_string_to_array(str) { 
    var result = [];
    while (str.length >= 2) { 
        result.push(parseInt(str.substring(0, 2), 16));
        str = str.substring(2, str.length);
    }
    return result;
}


function klik_array_to_hex_string(arr) {
    return arr.map(function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}


var tracking_random_index = 0;

function klik_parse_tags_packet_from_device(dev, devices, config) {

    // only process only if it starts with PIX or TAG
    if (! 'PIX TAG'.match(dev.name.substring(0,3))) { 
        return;
    }

    var id = dev.name;

    var decoded = (new KlikBLEPacket(dev.payload, id)).decode();

    var dict = id.startsWith('PIX') ? devices.pixels : devices.tags;

    // if the device does not exist create it
    if (!(id in dict)) {
        dict[id] = {
            name: id,
            x: 50 * tracking_random_index++, 
            y: 50, 
            radius: id.startsWith('PIX') ? MapStyle.tracking.pixel.radius : MapStyle.tracking.tag.radius, 
            type: id.slice(0,3), 
            linked: true,
            draw: id.startsWith('PIX') ? config.draw_pixel_function : config.draw_tag_function
        };
    }

    // THIS DID NOT WORK IN THE IPAD
    // because it uses Object.values()
    // see line 77 for the alternative

    // const tags_payload_types = {'pix-tag':null, 'pix-tags-best':null, 'pix-tags-weight':null, 'pix-tags-best-weight':null};
    // for (var chunk = 0; chunk < decoded.length; chunk++) {
    //     if (Object.keys(decoded[chunk]) in tags_payload_types) {  
    //         dict[id].tags = Object.values(decoded[chunk])[0];
    //     }
    // }

    // decoded packet is an array, check if it has tag related payload
    for (var i=0; i<decoded.length; i++) {
        for (var k in decoded[i]) { 
            if ('pix-tag pix-tags-best pix-tags-weight pix-tags-best-weight'.match(k) ){
                dict[id].tags = decoded[i][k];
            }
        }
    }

    dict[id].timestamp = (new Date()).getTime();
    dict[id].rssi = dev.rssi;
}
