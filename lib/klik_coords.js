// by JSR <jsr@pixmob.com & <vk@pixmob.com>


function get_pixel_auto_position(pixel, tags, nearest=false) {

    if (!('tags' in pixel)) { 
        return null;
    }

    var number_of_tags = pixel.tags.length;
    if (number_of_tags == 0) { 
        return null ;
    }

    var x = 0;
    var y = 0;

    if (nearest) {
        var tag = tags['TAG' + pixel.tags[0].id];
        return { x:tag.x, y:tag.y, n:1};
    }
    else {
        var position_scale = [[1], [0.60, 0.40], [0.60, 0.30, 0.10]];
        var total_scale = 0;
        for (var i = 0; i < number_of_tags; i++) {
            var tag_name = 'TAG' + pixel.tags[i].id;

            if (tag_name in tags) {
                var tag = tags[tag_name];
                if (tag) {
                    total_scale += position_scale[number_of_tags-1][i];
                    x += tag.x * position_scale[number_of_tags - 1][i];
                    y += tag.y * position_scale[number_of_tags - 1][i];
                }
            }
        }

        if (total_scale < 1) { // if sometimes the tag position is not there
           x = x / total_scale;
           y = y / total_scale;
        }

        return {x:x, y:y, n:number_of_tags};
    }
}

function auto_position_devices(devices, config, nearest=false) {
    if (!devices.tags || !devices.pixels) {
        return;
    }

    for (var key in devices.pixels) {
        var pixel = devices.pixels[key];

        if ((config.now - pixel.timestamp) > config.device_line_timeout) { 
            continue; 
        }

        var position = get_pixel_auto_position(pixel, devices.tags, nearest);

        if (position) {
            if (position.n == 1) {
                position.y -= 30; // slight offset to not fall on a tag
            }
            pixel.x = position.x;
            pixel.y = position.y ;
        }
    }
}

// scaling depends on which one of the width or height is longer
function get_map_scaling(image) {
    var scaling = {x:1.0, y:1.0};
    if (image) {
        if (image.height>image.width) {
            scaling.x = image.width / image.height;
        }
        else {
            scaling.y = image.height / image.width;
        }
    }
    return scaling;
}

// scale from : normalized 0->1 to 0->imagesize
function absolute_coords(coords, image) {
    var absolute = [];
    var scaling = get_map_scaling(image);
    if (image) {
        for (var i=0; i<coords.length; i++) {    
            absolute.push([
                (coords[i][0] * image.width  ) / scaling.x,
                (coords[i][1] * image.height ) / scaling.y
            ]);
        }
    }
    return absolute;
}

// only one point
function absolute_point(x, y, image) {
    return absolute_coords([[x,y]], image)[0]; // return first point
}

// scale from : 0->imagesize to normalized 0->1
function normalized_coords(coords, image) {
    var normalized = [];
    var scaling = get_map_scaling(image);
    for (var i=0; i<coords.length; i++) {    
        normalized.push([
            (( coords[i][0] ) * scaling.x) / image.width,
            (( coords[i][1] ) * scaling.y) / image.height
        ]);
    }
    return normalized;
}

// normalize only one point
function normalized_point(x, y, image) {
    return normalized_coords([[x,y]], image)[0]; // return first point
}


function klik_coords_offset_scale(coords, offset, scale) {
    if (coords.left && coords.right && coords.top && coords.bottom) {
        return {
            left   : (coords.left   + offset[0]) * scale,
            right  : (coords.right  + offset[0]) * scale,
            top    : (coords.top    + offset[1]) * scale,
            bottom : (coords.bottom + offset[1]) * scale,
        }
    }
    else  {
        var points = [];
        for (var i=0; i<coords.length; i++) {
            points.push([
                (coords[i][0] + offset[0]) * scale,
                (coords[i][1] + offset[1])  * scale,
            ]);
        }
        return points;
    }
}


// LEGACY - commented out on October 18th 2016
// worked with first version of the coordinates systems 

// function get_map_scaling(image) {
//     var scaling = {'factor':1, 'width':1000, 'height':750, 'x':0, 'y':0};
//     if (image.height>image.width) {
//         scaling.factor = 750 / image.height;
//         scaling.width = scaling.factor * image.width;
//         scaling.x = (1000-scaling.width)/2;
//     }
//     else {
//         scaling.factor = 1000 / image.width;
//         scaling.height = scaling.factor * image.height;
//         scaling.y = (750-scaling.height)/2;
//     }
//     return scaling;
// }

// function scale_coords(coords, image) {
//     var new_coords = [];
//     var scaling = get_map_scaling(image);
//     for (var i=0; i<coords.length; i++) {    
//         var new_x = coords[i][0] - scaling.x;
//         var new_y = coords[i][1] - scaling.y;
//         new_x /= scaling.factor;
//         new_y /= scaling.factor;
//         new_coords.push([new_x, new_y]);
//     }
//     return new_coords;
// }

// function revert_coords(coords, image) {
//     var old_coords = [];
//     var scaling = get_map_scaling(image);
//     for (var i=0; i<coords.length; i++) {    
//         var old_x = coords[i][0] * scaling.factor;
//         var old_y = coords[i][1] * scaling.factor;
//         old_x += scaling.x;
//         old_y += scaling.y
//         old_coords.push([old_x, old_y]);
//     }
//     return old_coords;
// }
