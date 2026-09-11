// by JSR <jsr@pixmob.com>

const _RADIUS = 10;
const USE_SCALING = 1;
const SCALING_SHOW_LOCATION_LABEL = 0.5; // zoomed out
const SCALING_SHOW_DEVICE_LABEL = 2.0;   // zoomed in

var map_opacity = 0.25;

function set_map_opacity(event) {
    map_opacity = event.target.value;
}


// -----------------------------------------------------------------
// debug / tests
// -----------------------------------------------------------------

function draw_test_pt(ctx, scaling, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 0.1+3, 0, TWOPI);
    // ctx.arc(x, y, 0.1+(TOLERANCE/2)/scaling, 0, TWOPI);
    ctx.closePath();
    ctx.save()
    ctx.globalAlpha = 0.5
    ctx.fillStyle = theme.color.main;
    ctx.fill();
    ctx.restore();
}


function draw_test_pts(ctx, scaling, pts, map) {
    for (var i=0; i<pts.length; i++) { 
        draw_test_pt(ctx, scaling, pts[i][0]+map.left, pts[i][1]+map.top);
    }
}


function draw_test_box(ctx, scaling, pts, map) {
    ctx.beginPath();
    ctx.lineWidth = 0.1 + 2/scaling;
    ctx.moveTo(pts[0][0]+map.left, pts[0][1]+map.top);
    ctx.lineTo(pts[1][0]+map.left, pts[1][1]+map.top);
    ctx.lineTo(pts[2][0]+map.left, pts[2][1]+map.top);
    ctx.lineTo(pts[3][0]+map.left, pts[3][1]+map.top);
    ctx.closePath();
    ctx.strokeStyle = BC_MISSED_PACKETS_COLOR
    ctx.stroke();
}


// -----------------------------------------------------------------
// background
// -----------------------------------------------------------------
function draw_background(vp, bgcolor=MAP_BACKGROUND_COLOR) {
    ctx = vp.context;
    ctx.fillStyle = theme.color.background;
    ctx.fillRect(vp.origin[0], vp.origin[1], vp.canvas.width/vp.scale, vp.canvas.height/vp.scale);
}


// -----------------------------------------------------------------
// map
// -----------------------------------------------------------------
function draw_map_image(ctx, map, scaling) {
    ctx.save();
    ctx.globalAlpha = map_opacity;
    ctx.drawImage(map.image, map.left, map.top);
    ctx.restore()
}


function draw_map_label(ctx, map, scaling) {
    ctx.font = get_scaled_font(scaling); //MAP_LABEL_FONT;
    ctx.textAlign = 'left'
    ctx.fillStyle = MAP_LABEL_COLOR
    ctx.fillText(map.name, map.left+0.1+10/scaling, map.top+0.1+10/scaling+get_scaled_font_size(scaling) );
}


function draw_map_border(ctx, map, scaling) {
    ctx.beginPath();
    ctx.lineWidth = MAP_HIGHLIGHT_LINE;
    ctx.moveTo(map.left , map.top);
    ctx.lineTo(map.right, map.top);
    ctx.lineTo(map.right, map.bottom);
    ctx.lineTo(map.left , map.bottom);
    ctx.closePath();
    ctx.strokeStyle = MAP_HIGHLIGHT_COLOR
    ctx.stroke();
}


// -----------------------------------------------------------------
// generic device
// -----------------------------------------------------------------
function draw_device_icon(ctx, dev, scaling, alpha, mask) {
    if (!layer_flags.icon.master[FLAG_INDEX_VISIBLE]) {
        return;
    }

    var map = Utils.get_map(dev.map);
    if (map && dev.image) {
        var pos = [dev.x+map.left, dev.y+map.top];

        ctx.save();
        if (mask) {
            ctx.beginPath();

            if (USE_SCALING) {
                ctx.arc(pos[0], pos[1], (dev.width/2)/scaling, 0, TWOPI);
            }
            else {
                ctx.arc(pos[0], pos[1], (dev.width/2), 0, TWOPI);
            }

            ctx.closePath();
            ctx.clip();
        }
        ctx.globalAlpha = alpha;

        try {
            // ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);

            var dw = dev.width;
            var dh = dev.height;

            if (USE_SCALING) {
                dw /= scaling;
                dh /= scaling;
            }

            ctx.drawImage(dev.image, 0, 0, 
                dev.image.width,
                dev.image.height, 
                pos[0]-dw/2, 
                pos[1]-dh/2,
                dw, dh);
        }
        catch(e) {
            // unable to draw image
        }
        ctx.restore()
    }
    else {
        // console.log('device missing map or image', dev)
    }
}


function draw_device_background(ctx, dev, scaling, color) {
    var map = Utils.get_map(dev.map);
    if (map) {
        var pos = [dev.x+map.left, dev.y+map.top];

        ctx.beginPath();

        if (USE_SCALING)
            ctx.arc(pos[0], pos[1], (dev.width/2)/scaling, 0, TWOPI);
        else
            ctx.arc(pos[0], pos[1], (dev.width/2), 0, TWOPI);

        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }
}

function draw_device_glow(ctx, dev, scaling) {
    if (!layer_flags.glow.master[FLAG_INDEX_VISIBLE]) {
        return;
    }

    var map = Utils.get_map(dev.map);
    if (map) {
        var dmx = [0,0,0,0,0,0,0];

        if (dev.custom.dmx) {
            dmx = dev.custom.dmx
        }

        var rgb1 = 'rgba('+dmx[1]+','+dmx[2]+','+dmx[3]+','+dmx[0]/255+')';
        var rgb2 = 'rgba('+dmx[1]+','+dmx[2]+','+dmx[3]+', 0.0)';

        var pos = [dev.x+map.left, dev.y+map.top];

        // todo : fix Uncaught TypeError : provided double value is non-finite
        try {
            ctx.beginPath();
            ctx.arc(pos[0], pos[1], (dev.width*1.3)/scaling, 0, TWOPI);
            ctx.closePath();

            var grd = ctx.createRadialGradient(pos[0], pos[1], (dev.width/2.)/scaling, pos[0], pos[1], (dev.width*1.3)/scaling ); // x1,y1,radius1,x2,y2,radius2
            grd.addColorStop(0.00, rgb1);
            grd.addColorStop(1.00, rgb2);
            ctx.fillStyle = grd;
            ctx.fill();
        }
        catch(e) {
            // console.log('---', e)
        }

        // var r = _RADIUS*2;
        // var grd = ctx.createRadialGradient(device.x,device.y,5,device.x,device.y,r); // x1,y1,radius1,x2,y2,radius2
        // grd.addColorStop(0,'rgba(255,0,0,0.8)');
        // grd.addColorStop(1.0,'rgba(255,0,0,0.0)');
        // ctx.fillStyle = grd;
        // ctx.fillRect(device.x-r,device.y-r,r*2,r*2);
    }
}


function draw_device_border(ctx, dev, scaling, color) {
    var map = Utils.get_map(dev.map);
    if (map) {
        var pos = [dev.x+map.left, dev.y+map.top];

        ctx.beginPath();
        ctx.arc(pos[0], pos[1], (dev.width/2)/((USE_SCALING)?scaling:1), 0, TWOPI);
        ctx.closePath();

        if (USE_SCALING) {
            ctx.lineWidth = 0.05+1.0/scaling;
        }
        else {
            ctx.lineWidth = 0.05+1.0;
        }
        ctx.strokeStyle = 'white';
        ctx.stroke();
    }
}


function draw_device_data_as_row(ctx, dev, scaling) {
    if (dev) {
        var map = Utils.get_map(dev.map);

        var c = 0;
        var c_width = [180,150,80,80,80,80,80,80];

        if (map) {
            var pos = [dev.x+map.left+_RADIUS+15, dev.y+map.top+4];

            ctx.textAlign = 'left';
            ctx.font = get_scaled_font(scaling); //BC_LABEL_FONT;

            draw_grid_cell(ctx, pos, c_width[c], dev.row_half_height);
            draw_grid_text(ctx, pos, dev.id);

            pos[0]+=c_width[c++];
            draw_grid_cell(ctx, pos, c_width[c], dev.row_half_height);
            draw_grid_text(ctx, pos, dev.label);

            // an attendee
            if (dev.data) {
                for (var i=0; i<4; i++) {
                    pos[0]+=c_width[c++]
                    draw_grid_cell(ctx, pos, c_width[c], dev.row_half_height);
                    if (i<dev.data.devices.length) {
                        draw_grid_text(ctx, pos, dev.data.devices[i].id);
                    }
                }  
            }

            // a beacon, sentinelle, tag, hub
            else {
                c_width = [180,150,120,60,80,300];

                pos[0]+=c_width[c++]
                draw_grid_cell(ctx, pos, c_width[c], dev.row_half_height);
                if (dev.status.last_heard) {
                    date = new Date(dev.status.last_heard * 1000);
                    draw_grid_text(ctx, pos, date.toLocaleString());
                }
                else {
                    draw_grid_text(ctx, pos, 'never heard of it');
                }

                pos[0]+=c_width[c++]
                draw_grid_cell(ctx, pos, c_width[c], dev.row_half_height);
                if (dev.status.battery_mV) {
                    draw_grid_text(ctx, pos, dev.status.battery_mV);
                }
                else {
                    draw_grid_text(ctx, pos, 'no data');
                }

                pos[0]+=c_width[c++]
                draw_grid_cell(ctx, pos, c_width[c], dev.row_half_height);
                draw_grid_text(ctx, pos, dev.status.status);

                pos[0]+=c_width[c++]
                draw_grid_cell(ctx, pos, c_width[c], dev.row_half_height);
                draw_grid_text(ctx, pos, dev.status.status_msg);
            }
        }
    }
}


function draw_grid_cell(ctx, pos, width, half_height) {
    draw_grid_box(ctx, {
        left  : pos[0],
        right : pos[0]+width,
        top   : pos[1]-half_height,
        bottom: pos[1]+half_height
    });
}


function draw_grid_text(ctx, pos, text){
    ctx.fillStyle = theme.color.main;
    ctx.fillText(text, pos[0], pos[1]);
}


function draw_grid_box(ctx, box) {
    box.left    -= 3; // 3
    box.right   -= 5; // 5
    box.top     -= 3; // 3
    box.bottom  -= 5; // 5
  
    path_box(ctx, box);

    ctx.fillStyle = theme.color.middle;
    ctx.fill();

    ctx.strokeStyle = theme.color.dark;
    ctx.lineWidth = 0.5;
    ctx.stroke();
}


function path_box(ctx, box) {
    ctx.beginPath();
    ctx.moveTo(box.left , box.top);
    ctx.lineTo(box.right, box.top);
    ctx.lineTo(box.right, box.bottom);
    ctx.lineTo(box.left , box.bottom);
    ctx.closePath();
}


function draw_device_label(ctx, dev, scaling, draw_name=true) {
    if (scaling<SCALING_SHOW_DEVICE_LABEL) {
        return;
    }

    var map = Utils.get_map(dev.map);
    if (map) {
        var pos = [dev.x+map.left, dev.y+map.top];

        ctx.textAlign = 'center';
        ctx.fillStyle = 'white'; // BC_LABEL_COLOR;

        if (draw_name) {
            ctx.font = get_scaled_font(scaling); // BC_LABEL_FONT;
            ctx.fillText(dev.name, pos[0], pos[1] - 0.1 - (_RADIUS+8)/scaling ); // over the icon
        }

        ctx.font = get_scaled_font(scaling); // '7px Arial';
        ctx.fillText(dev.id  , pos[0], pos[1] + 0.1 + (_RADIUS+8+12)/scaling ); // under the icon

        ctx.font = get_scaled_font(scaling); // BC_LABEL_FONT;
        if (dev.label!='') {
            ctx.fillText(dev.label, pos[0], pos[1] - 0.1 - (_RADIUS+23)/scaling ); // at the very top
        }
    }
}


function draw_device_highlight(ctx, dev, scaling, tol) {
    // if (!dev) {
    //     return;
    // }
    var map = Utils.get_map(dev.map);
    if (map) {
        var left    = dev.left      + map.left;
        var right   = dev.right     + map.left;
        var top     = dev.top       + map.top;
        var bottom  = dev.bottom    + map.top;

        ctx.beginPath();
        ctx.moveTo(-tol+left , -tol+top);
        ctx.lineTo( tol+right, -tol+top);
        ctx.lineTo( tol+right,  tol+bottom);
        ctx.lineTo(-tol+left ,  tol+bottom);
        ctx.closePath();

        ctx.lineWidth = 0.1 + 2/scaling;
        ctx.strokeStyle = theme.color.main;
        ctx.stroke();
    }
}


function draw_device_emergency(ctx, dev, scaling, tol) {
    var map = Utils.get_map(dev.map);
    if (map) {
        var left    = dev.left      + map.left;
        var right   = dev.right     + map.left;
        var top     = dev.top       + map.top;
        var bottom  = dev.bottom    + map.top;

        tol += 2/scaling;

        ctx.beginPath();
        ctx.moveTo(-tol+left , -tol+top);
        ctx.lineTo( tol+right, -tol+top);
        ctx.lineTo( tol+right,  tol+bottom);
        ctx.lineTo(-tol+left ,  tol+bottom);
        ctx.closePath();

        ctx.lineWidth = 0.1 + 2/scaling;
        ctx.strokeStyle = BC_EMERGENCY_COLOR
        ctx.stroke();

    }
}


function draw_device_missed_packets(ctx, dev, scaling, tol) {
    var map = Utils.get_map(dev.map);
    if (map) {
        var left    = dev.left      + map.left;
        var right   = dev.right     + map.left;
        var top     = dev.top       + map.top;
        var bottom  = dev.bottom    + map.top;

        tol += 2/scaling;

        ctx.beginPath();
        ctx.moveTo(-tol+left , -tol+top);
        ctx.lineTo( tol+right, -tol+top);
        ctx.lineTo( tol+right,  tol+bottom);
        ctx.lineTo(-tol+left ,  tol+bottom);
        ctx.closePath();

        ctx.lineWidth = 0.1 + 2/scaling;
        ctx.strokeStyle = BC_MISSED_PACKETS_COLOR
        ctx.stroke();
    }
}


function draw_device_line(ctx, dev, scaling, target) {
    var map = Utils.get_map(dev.map);
    if (map) {
        var pos = [dev.x+map.left, dev.y+map.top];

        ctx.beginPath();
        ctx.lineWidth =  0.1 + 3/scaling; //BC_LINE/scaling;
        ctx.moveTo(pos[0], pos[1]);
        ctx.lineTo(target[0],target[1]);
        ctx.strokeStyle = BC_LINE_COLOR;
        ctx.stroke();
    }
}


function draw_device_link(ctx, dev, scaling, target) {
    var map = Utils.get_map(dev.map);
    if (map) {
        var pos = [dev.x+map.left, dev.y+map.top];

        ctx.beginPath();
        ctx.arc(pos[0], pos[1], BC_LINK_RADIUS/scaling, 0, TWOPI);
        ctx.closePath();
        ctx.fillStyle = BC_LINK_COLOR;
        ctx.fill();
    }
}


function draw_device_rssi(ctx, dev, scaling, rssi_radius, selected, color=BC_RSSI_COLOR) {
    // var r = _RADIUS*2;
    // var grd = ctx.createRadialGradient(device.x,device.y,5,device.x,device.y,r); // x1,y1,radius1,x2,y2,radius2
    // grd.addColorStop(0,'rgba(255,0,0,0.8)');
    // grd.addColorStop(1.0,'rgba(255,0,0,0.0)');
    // ctx.fillStyle = grd;
    // ctx.fillRect(device.x-r,device.y-r,r*2,r*2);
    var map = Utils.get_map(dev.map);
    if (map) {
        var pos = [dev.x+map.left, dev.y+map.top];

        if (selected) {
            color = theme.color.down ;// BC_RSSI_COLOR_DOWN
        }
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], rssi_radius/scaling, 0, TWOPI); //(x,y,r,sAngle,eAngle,counterclockwise);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }
}

// locations
// -----------------------------------------------------------------

var loc_paths = {};


function draw_locations(ctx, locations, map) {
    if (map==undefined) {
        return;
    }
    for (var key in locations) {
        var loc = locations[key];
        if (loc.map==map.id) { // check if this location is on this map
            draw_location(ctx, loc, 1.0, map);
        }
    }
}


function draw_location(ctx, loc, scaling, tracking_map=null) {
    if (loc.coords==undefined || loc.coords.length==0) {
        return;
    }

    var map = Utils.get_map(loc.map);

    if (tracking_map) {
        map = tracking_map;
        map.left = 0;
        map.top = 0;
        theme = {
            loc_segment_color : MapStyle.tracking.location.line.color,
            loc_segment_line : MapStyle.tracking.location.line.width,
        }
    }

    if (map) {
        // draw perimeter
        ctx.beginPath();
        ctx.moveTo(loc.coords[0][0]+map.left, loc.coords[0][1]+map.top);
        for (var i=1; i<loc.coords.length; i++) {
            ctx.lineTo(loc.coords[i][0]+map.left, loc.coords[i][1]+map.top);
        }
        ctx.closePath();

        ctx.strokeStyle = theme.loc_segment_color;
        ctx.lineWidth = 0.1 + theme.loc_segment_line/scaling;
        ctx.stroke();


        // draw anchors only in the manager, not in the tracking map
        if (!tracking_map) {
            ctx.fillStyle = LOC_ANCHOR_COLOR;
            for (var i=0; i<loc.coords.length; i++) {
                ctx.beginPath();
                ctx.arc(loc.coords[i][0]+map.left,
                        loc.coords[i][1]+map.top, 
                        0.1+LOC_ANCHOR_RADIUS/scaling, 0, TWOPI);
                ctx.closePath();
                ctx.fill();
            }
        }
    }
}


function draw_location_highlighted(ctx, loc, scale=1) {
    var map = Utils.get_map(loc.map);
    if (map) {
        // draw lines
        ctx.strokeStyle = theme.loc_highlight_color;
        ctx.lineWidth = 1 + theme.loc_highlight_line/scale;
        ctx.beginPath();
        ctx.moveTo(loc.coords[0][0]+map.left, 
                   loc.coords[0][1]+map.top);

        for (var i=1; i<loc.coords.length; i++) {
            ctx.lineTo(loc.coords[i][0]+map.left,
                       loc.coords[i][1]+map.top);
        }
        ctx.closePath();
        ctx.stroke();
    }
}


function get_scaled_font(scaling, font_size=14) {
    return get_scaled_font_size(scaling, font_size)+ 'px Lucida Grande';
}


function get_scaled_font_size(scaling, font_size=14) {
    return 0.1 + font_size/scaling;
}


function draw_location_label(ctx, loc, scaling) {
    if (scaling<SCALING_SHOW_LOCATION_LABEL) return; // hide when zoomed out too much
    //if (scaling>SCALING_SHOW_DEVICE_LABEL) return;  // hide as soon as we show the devices labels

    var map = Utils.get_map(loc.map);
    if (map && loc.center) {
        ctx.save();

        ctx.font = get_scaled_font(scaling);
        ctx.textAlign = 'center'

        var x = map.left+loc.center[0];
        var y = map.top +loc.center[1];
        var pad = 10;

        var w = ctx.measureText(loc.display_name).width + pad/scaling;
        var h = get_scaled_font_size(scaling) + (pad-2)/scaling;
        var offset = -8/scaling;

        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(x-w/2, y-(h+pad/scaling)/2+offset, w, h);

        ctx.fillStyle = LOC_LABEL_COLOR;
        ctx.fillText(loc.display_name, x, y+offset);

        // ctx.textAlign = 'left'
        // ctx.fillText(loc.display_name,
        //     loc.coords[0][0]+map.left+0.1 + 10/scaling,
        //     loc.coords[0][1]+map.top +0.1 + 10/scaling + get_scaled_font_size(scaling) );

        ctx.restore();
    }
}


function draw_location_timestamp(ctx, loc, scaling, timestamp) {
    if (scaling<SCALING_SHOW_LOCATION_LABEL) return; // hide when zoomed out too much
    //if (scaling>SCALING_SHOW_DEVICE_LABEL) return;  // hide as soon as we show the devices labels

    var font_size = 11;

    var map = Utils.get_map(loc.map);
    if (map && loc.center) {
        ctx.save();
        ctx.font = get_scaled_font(scaling, font_size);
        ctx.textAlign = 'center'

        var x = map.left+loc.center[0];
        var y = map.top +loc.center[1];
        var pad = 10;

        var w = ctx.measureText(timestamp).width + pad/scaling;
        var h = get_scaled_font_size(scaling, font_size) + (pad-2)/scaling;
        var offset = 12/scaling;

        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(x-w/2, y+(h+pad/scaling)/2+offset, w, h);

        ctx.fillStyle = LOC_LABEL_COLOR;
        ctx.fillText(timestamp, x, y+(h+pad/scaling)+offset);
        ctx.restore();
    }
}


function draw_location_anchor(ctx, scaling, position, map_offset) {
    var color, radius;
    if (mouse.is_down) {
        color  = LOC_ANCHOR_COLOR_DOWN;
        radius = 0.1 + LOC_ANCHOR_RADIUS_DOWN/scaling;
    }
    else {
        color  = LOC_ANCHOR_COLOR_OVER;
        radius = 0.1 + LOC_ANCHOR_RADIUS_OVER/scaling;
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(position[0]+map_offset[0], position[1]+map_offset[1], radius, 0, TWOPI);
    ctx.closePath();
    ctx.fill();
}


function draw_location_segment(ctx, scaling, points, map_offset) {
    if (mouse.is_down) {
        ctx.strokeStyle = theme.loc_segment_color_down;
        ctx.lineWidth   = 0.1 + theme.loc_segment_line_down/scaling;
    }
    else {
        ctx.strokeStyle = theme.loc_segment_color_over;
        ctx.lineWidth   = 0.1 + theme.loc_segment_line_over/scaling;
    }

    ctx.beginPath();
    ctx.moveTo(points[0][0]+map_offset[0], points[0][1]+map_offset[1]);
    ctx.lineTo(points[1][0]+map_offset[0], points[1][1]+map_offset[1]);
    ctx.stroke();
}


function draw_location_inside(ctx, loc, color=LOC_INSIDE_COLOR) {
    var map = Utils.get_map(loc.map);
    if (map) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(loc.coords[0][0]+map.left, 
                   loc.coords[0][1]+map.top);

        for (var i=1; i<loc.coords.length; i++) {
            ctx.lineTo(loc.coords[i][0]+map.left,
                       loc.coords[i][1]+map.top);
        }
        ctx.closePath();
        ctx.fill();
    }
}


function draw_location_around(ctx, loc, color=LOC_INSIDE_COLOR) {
    var map = Utils.get_map(loc.map);
    if (map) {
        ctx.beginPath();
        ctx.moveTo(loc.coords[0][0]+map.left, 
                   loc.coords[0][1]+map.top);

        for (var i=1; i<loc.coords.length; i++) {
            ctx.lineTo(loc.coords[i][0]+map.left,
                       loc.coords[i][1]+map.top);
        }
        ctx.closePath();

        ctx.lineWidth = 20;
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}


function draw_location_counter(ctx, loc, scaling, offset=[0,0], color=LOC_ATTENDEES_COLOR, force_value=null) {
    var map = Utils.get_map(loc.map);
    if (map) {
        var s = 2.1 * scaling; // adjust scale circles down a little to keep things readable
        if (loc && loc.center) {
            var pos = [loc.center[0]+map.left+offset[0], loc.center[1]+map.top+offset[1]+(12)/scaling];
            ctx.beginPath();
            ctx.arc(pos[0], pos[1], 36/s, 0, TWOPI); //(x,y,r,sAngle,eAngle,counterclockwise);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            var val = (force_value)?force_value:loc.attendees_count
            if (val!=-1) {
                ctx.font = get_scaled_font(scaling, LOC_ATTENDEES_FONT_SIZE);
                ctx.textAlign = 'center'
                ctx.fillStyle = LOC_ATTENDEES_COLOR_LABEL;
                var val = (force_value)?force_value:loc.attendees_count
                ctx.fillText(val, pos[0], pos[1]+(12/s));
            }
        }
    }
}


function drawStroked(ctx, scaling, pos, text) {
    ctx.font = get_scaled_font(scaling);
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 8/scaling;
    ctx.strokeText(text, pos[0], pos[1]+20);
    ctx.fillStyle = 'white';
    ctx.fillText(text, pos[0], pos[1]+20);
}


// -----------------------------------------------------------------
// generic
// -----------------------------------------------------------------
function calc_box(element) {
    var i;
    var box = {}
    box.left    = 9999;
    box.top     = 9999;
    box.right   = -9999;
    box.bottom  = -9999;

    for (i=0; i<element.coords.length; i++) {
        if (element.coords[i][0]<box.left)   box.left   = element.coords[i][0];
        if (element.coords[i][1]<box.top)    box.top    = element.coords[i][1];
        if (element.coords[i][0]>box.right)  box.right  = element.coords[i][0];
        if (element.coords[i][1]>box.bottom) box.bottom = element.coords[i][1];
    }
    element.box = box;
    element.center = [box.left+(box.right-box.left)/2, box.top+(box.bottom-box.top)/2];
}


function draw_box(ctx, element, scaling) {
    var map = Utils.get_map(element.map);
    if (map) {
        var box = element.box;
        ctx.strokeStyle = 'rgba(255, 0, 0, 1.0)';
        ctx.lineWidth = 2/scaling;
        ctx.beginPath();
        ctx.moveTo(map.left+box.left , map.top+box.top);
        ctx.lineTo(map.left+box.right, map.top+box.top);
        ctx.lineTo(map.left+box.right, map.top+box.bottom);
        ctx.lineTo(map.left+box.left , map.top+box.bottom);
        ctx.closePath();
        ctx.stroke();
    }
}


function draw_circle(ctx, x, y, radius, thickness, color, fill=false) {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = thickness;
    ctx.strokeStyle = ctx.fillStyle = color;
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    (fill) ? ctx.fill() : ctx.stroke();
    ctx.closePath();
    ctx.restore();
}


function draw_rectangle(ctx, x, y, w, h, thickness, color, fill=false) {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = thickness;
    ctx.strokeStyle = ctx.fillStyle = color;  
    x -= w/2;
    y -= h/2;
    ctx.rect(x, y, w, h);
    (fill) ? ctx.fill() : ctx.stroke();
    ctx.closePath();
    ctx.restore();
}
 

function draw_line(ctx, x1, y1, x2, y2, thickness, color, alpha) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';  
    ctx.lineWidth = thickness;
    ctx.globalAlpha = alpha;    
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();  // if you close the path, before stroking, line cap is not applied!!!
    ctx.restore();
}


