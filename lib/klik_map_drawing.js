// by JSR <jsr@pixmob.com, VK <vk@pixmob.com>

var max_rows = 100;
var selected_radius = 24;

function draw_devices_connections(ctx, devices, config) {
    if (!devices.tags && !devices.pixels) {
        return;
    }

    for (var pix_id in devices.pixels) {
        var pix = devices.pixels[pix_id];

        // draw only if pixel is
        // - linked
        // - contain tags
        // - have a recent timestamp
        if ( pix.linked && ('tags' in pix) && ((config.now - pix.timestamp) < config.device_line_timeout) ) { 

            for (var i = 0; i < pix.tags.length; i++) {
                var tag_id = 'TAG' + pix.tags[i].id;
                if (tag_id in devices.tags) {
                    var tag = devices.tags[tag_id];
                    var alpha = 1 - ((config.now - pix.timestamp)/ config.device_line_timeout);
                    draw_line(ctx, pix.x, pix.y, tag.x, tag.y, MapStyle.tracking.line.width, MapStyle.tracking.line.colors[i], alpha);
                }         
            }
        }
    }
}


function draw_device_info(ctx, name, dev) {
    ctx.save();

    ctx.textAlign = 'left'; 
    ctx.fillStyle = MapStyle.tracking.info.color;
    ctx.font = MapStyle.tracking.info.font.size +'px '+MapStyle.tracking.info.font.name;

    var pos = [
        dev.x - dev.radius / 1.8, 
        dev.y - dev.radius / 2.9
    ];

    // add label / name
    ctx.fillText(name, pos[0], pos[1] );

    // add rssi
    pos[1] += MapStyle.tracking.info.font.size ;
    ctx.fillText('rssi ' + dev.rssi, pos[0], pos[1] );

    // add linked
    if (dev.linked){
        pos[1] += MapStyle.tracking.info.font.size ;
        ctx.fillText('linked', pos[0], pos[1] );
    }

    // add device id
    if (dev.name) {
        pos[1] += MapStyle.tracking.info.font.size ;
        ctx.fillText(dev.name, pos[0], pos[1])
    }
    ctx.restore();
}


function draw_device(ctx, name, device, config, type) {
    draw_circle(ctx, device.x, device.y, device.radius, MapStyle.tracking.line.width, MapStyle.tracking[type].color, true); 
    draw_circle(ctx, device.x, device.y, device.radius, MapStyle.tracking.line.width, MapStyle.tracking[type].outline);
    draw_device_info(ctx, type.toUpperCase(), device);

    if ((config.now - device.timestamp) < config.just_received_time ) {
        draw_circle(ctx, device.x, device.y, device.radius, MapStyle.tracking.notification.width, MapStyle.tracking.notification.color);
    }
}


function draw_tag(ctx, name, device, config) {
    draw_device(ctx, name, device, config, 'tag');
}


function draw_touchpoint(ctx, name, device, config) {
    draw_device(ctx, name, device, config, 'touchpoint');
}


function draw_pixel(ctx, name, device, config) {
    draw_device(ctx, name, device, config, 'pixel');
}


function draw_devices(ctx, devices, config) {
    for (var type in devices) {
        for (var id in devices[type] ) {
            var drawing_function = devices[type][id].draw;
            if (drawing_function) {
                drawing_function(ctx, id, devices[type][id], config);
            }
        }
    }    
}


function set_row_xy(index, item) {
    item.row_index = index;
    item.row_height = _RADIUS*2.8;
    item.row_half_height = item.row_height/2;
    item.row_x = 0;
    item.row_y = item.row_height * item.row_index;
}


function set_map_xy(index, item) {
    item.map_index = index;
    item.map_x = 0; // this will come from db
    item.map_y = 0; // this will come from db
}


function set_box(item) {
    // item.left   = item.x - item.width/2;
    // item.right  = item.x + item.width/2;
    // item.top    = item.y - item.height/2;
    // item.bottom = item.y + item.height/2;

    item.left   = item.x - item.width/5;
    item.right  = item.x + item.width/5;
    item.top    = item.y - item.height/5;
    item.bottom = item.y + item.height/5;
}


function draw_list_inside_viewport(v) {
    var scale = viewports[v].scale;

    if (view_content=='attendees' && layer_flags.attendee.master[FLAG_INDEX_VISIBLE]) {
        draw_list_devices(viewports[v].context, items.attendees, scale, get('highlighted-attendee'));
    }
    else if (view_content=='beacons' && layer_flags.beacon.master[FLAG_INDEX_VISIBLE]) {
        draw_list_devices(viewports[v].context, items.beacons, scale, get('highlighted-beacon'));
    }
    else if (view_content=='configs' && layer_flags.config.master[FLAG_INDEX_VISIBLE]) {
        draw_list_devices(viewports[v].context, items.configs, scale, get('highlighted-config'));
    }
    else if (view_content=='hubs' && layer_flags.hub.master[FLAG_INDEX_VISIBLE]) {
        draw_list_devices(viewports[v].context, items.hubs, scale, get('highlighted-hub'));
    }
    else if (view_content=='mobiles' && layer_flags.mobile.master[FLAG_INDEX_VISIBLE]) {
        draw_list_devices(viewports[v].context, items.mobiles, scale, get('highlighted-mobile'));
    }
    else if (view_content=='pixels' && layer_flags.pixel.master[FLAG_INDEX_VISIBLE]) {
        draw_list_devices(viewports[v].context, items.pixels, scale, get('highlighted-pixel'));
    }
    else if (view_content=='registrations' && layer_flags.registration.master[FLAG_INDEX_VISIBLE]) {
        draw_list_devices(viewports[v].context, items.registrations, scale, get('highlighted-registration'));
    }
    else if (view_content=='sentinelles' && layer_flags.sentinelle.master[FLAG_INDEX_VISIBLE]) {
        draw_list_devices(viewports[v].context, items.sentinelles, scale, get('highlighted-sentinelle'));
    }
    else if (view_content=='tags' && layer_flags.tag.master[FLAG_INDEX_VISIBLE]) {
        draw_list_devices(viewports[v].context, items.tags, scale, get('highlighted-tag')); 
    }
    else if (view_content=='touchpoints' && layer_flags.touchpoint.master[FLAG_INDEX_VISIBLE]) {
        draw_list_devices(viewports[v].context, items.touchpoints, scale, get('highlighted-touchpoint')); 
    }
}


function draw_list_devices(ctx, devices, scale, highlighted_dev) {
    for (var i=0; i<devices.length; i++) {
        if (i>=max_rows) {
            return;
        }

        var found_it = true;

        if (search_key) {
            found_it = JSON.stringify(devices[i]).toLowerCase().match(search_key);
        }

        if (found_it) {
            if (highlighted_dev) {
                draw_row_device(ctx, devices[i], scale, highlighted_dev, i==highlighted_dev.row_index );
            }
            else {
                draw_row_device(ctx, devices[i], scale);
            }
            draw_critical(ctx, devices[i], scale);
        }
    }
}


function draw_critical(ctx, dev, scale) {
    if (dev.status && dev.status['status']=='critical') {
        if(dev.status['status_msg'].match('Missed packets high')) {
            // if (klik_render_frame%MAP_FRAMERATE<TWO_HZ) // blink yellow
                draw_device_missed_packets(ctx, dev, scale,  TOLERANCE/scale); 
        }
        else if(dev.status['status_msg'].match('per second high')) {
            // if (klik_render_frame%MAP_FRAMERATE<TWO_HZ) // blink yellow
                draw_device_missed_packets(ctx, dev, scale, TOLERANCE/scale); 
        }
        else {
            // if (klik_render_frame%MAP_FRAMERATE<TWO_HZ) // blink red
                draw_device_emergency(ctx, dev, scale, TOLERANCE/scale);
        }
    }
}


function draw_row_device(ctx, dev, scale, dev_highlighted=null, needs_highlight=false) {
    if (dev.map) {
        draw_device_background  (ctx, dev, scale,'#777');
        draw_device_icon        (ctx, dev, scale, 1.0, false);
        draw_device_border      (ctx, dev, scale);

        if (needs_highlight) {
            draw_device_highlight(ctx, dev_highlighted, scale, TOLERANCE/scale);
        }

        draw_device_data_as_row(ctx, dev, scale, 'text-on-the-right');
    }
}


function get_color(key) {
    if (MapStyle.manager[key]) {
        return MapStyle.manager[key].color;
    }
    else {
        return MapStyle.manager.default.color;
    }
}



// manager drawing functions

function manager_draw_map(ctx, scale) {
    if (layer_flags.map.master[FLAG_INDEX_VISIBLE]) {
        for (var i=0; i<maps.length; i++) {
            if (typeof KLIK_MAP_FILTER_ID !== 'undefined' && KLIK_MAP_FILTER_ID!=null && maps[i].id!=KLIK_MAP_FILTER_ID) { continue; }
            draw_map_image(ctx, maps[i], scale);
            if (layer_flags.map.label[FLAG_INDEX_VISIBLE]) {
                draw_map_label(ctx, maps[i], scale);
            }
            if (i==highlighted.map) {
                draw_map_border(ctx, maps[i], scale);
            }
        }
    }
}


function manager_draw_locations(ctx, scale) {
    if (layer_flags.location.master[FLAG_INDEX_VISIBLE]) {
        for (var i=0; i<locations.length; i++) {
            var loc = locations[i];
            if (typeof KLIK_MAP_FILTER_ID !== 'undefined' && KLIK_MAP_FILTER_ID!=null && loc.map!=KLIK_MAP_FILTER_ID) { continue; }

            if (i==location_index) {
                draw_location_highlighted(ctx, loc, scale);
            }
            
            draw_location(ctx, loc, scale);

            if (layer_flags.location.box[FLAG_INDEX_VISIBLE]) {
                draw_box(ctx, loc, scale);
            }
        }
    }

    var loc = get('highlighted-location');
    if (loc) {
        var map = Utils.get_map(loc.map);

        // if (mouse.test_pts) {
        //     draw_test_pts(ctx, scale, mouse.test_pts, map);
        // }

        if (location_anchor>-1 && layer_flags.location.anchor[FLAG_INDEX_VISIBLE] ) {
            draw_location_anchor(ctx, scale, location_anchor_point, [map.left, map.top] );
            return;
        }
        if (location_segment>-1 && layer_flags.location.segment[FLAG_INDEX_VISIBLE] ) {
            draw_location_segment(ctx, scale, location_segment_points, [map.left, map.top] );
            return;
        }
        if (location_inside>-1 && layer_flags.location.inside[FLAG_INDEX_VISIBLE] ) {
            draw_location_inside(ctx, get('inside-location'), LOC_INSIDE_COLOR_OVER);
            return;
        }

        if (location_around>-1 && layer_flags.location.around[FLAG_INDEX_VISIBLE] ) {
            draw_location_around(ctx, get('around-location'), LOC_INSIDE_COLOR_OVER);
            return;
        }
    }
}


function manager_draw_locations_labels(ctx, scale) {
    for (var i=0; i<locations.length; i++) {
        if (typeof KLIK_MAP_FILTER_ID !== 'undefined' && KLIK_MAP_FILTER_ID!=null && locations[i].map!=KLIK_MAP_FILTER_ID) { continue; }
        if (layer_flags.location.label[FLAG_INDEX_VISIBLE]) {
            draw_location_label(ctx, locations[i], scale);
        }
    }
}


function manager_draw_device_type(ctx, scale, options, type) {
    if (layer_flags[type].master[FLAG_INDEX_VISIBLE]) {
        var devices = items[type+'s'];

        var color = get_color(type);
        var tol = TOLERANCE/scale;

        for (var i=0; i<devices.length; i++) {
            var dev = devices[i];
            if (dev.map && (typeof KLIK_MAP_FILTER_ID === 'undefined' || KLIK_MAP_FILTER_ID==null || dev.map==KLIK_MAP_FILTER_ID)) {

                if (i==index[type]) {
                    draw_device_rssi(ctx, dev, scale, selected_radius, true );
                }

                if (options.glow) {
                    draw_device_glow(ctx, dev, scale);
                }

                if (options.notify) {
                    if (klik_render_frame%MAP_FRAMERATE<(TWO_HZ) &&
                        devices[i].status && 
                        devices[i].status['status']=='critical' &&
                        layer_flags.notification.master[FLAG_INDEX_VISIBLE] &&
                        layer_flags[type].status[FLAG_INDEX_VISIBLE]
                    ) 
                    {
                        draw_device_background(ctx, devices[i], scale, color);
                        draw_device_border    (ctx, devices[i], scale);
                    }
                    else {
                        draw_device_background(ctx, devices[i], scale, color); 
                        draw_device_icon      (ctx, devices[i], scale, 1.0, false);
                        draw_device_border    (ctx, devices[i], scale);  
                    }
                }
                else {
                    draw_device_background(ctx, dev, scale, color);
                    draw_device_icon      (ctx, dev, scale, 1.0, false);
                    draw_device_border    (ctx, dev, scale);
                }

                if (i==highlighted[type]) {
                    draw_device_highlight(ctx, get('highlighted-'+type), scale, tol);
                }
    
                if (layer_flags[type].label[FLAG_INDEX_VISIBLE]) {
                    draw_device_label(ctx, dev, scale, options.name); // if options.name is false we dont draw the name
                }
            }
        }
    }
}


function manager_draw_counters(ctx, scale) {
    var offsets = {
        live   : 0,
        system : 0,
        manual : 0,
        mobile : 0,
    }

    var draw_live   = layer_flags.live_counter.master[FLAG_INDEX_VISIBLE];
    var draw_system = layer_flags.system_counter.master[FLAG_INDEX_VISIBLE];
    var draw_manual = layer_flags.manual_counter.master[FLAG_INDEX_VISIBLE];
    var draw_mobile = layer_flags.mobile_counter.master[FLAG_INDEX_VISIBLE];

    var gap = 18;
    var total = draw_live + draw_system + draw_manual + draw_mobile;
    var offset_adjust = -gap*(total-1);
    var offset = 0;

    if (draw_live) {
        offsets.live = offset++ * 2*gap + offset_adjust;
        for (var i=0; i<locations.length; i++) {
            draw_location_counter(ctx, locations[i], scale, [offsets.live/scale,0], klik_counters_colors.live, null); 
        }
    }

    if (draw_system) {
        offsets.system = offset++ * 2*gap + offset_adjust;
        for (var i=0; i<locations.length; i++) {
            var count = '...'
            if (klik_counters[i]) {
                count = klik_counters[i].system;
            }
            draw_location_counter(ctx, locations[i], scale, [offsets.system/scale,0], klik_counters_colors.system, count); 
        }
    }

    if (draw_manual) {
        offsets.manual = offset++ * 2*gap + offset_adjust;
        for (var i=0; i<locations.length; i++) {
            var count = ''
            if (klik_counters[i]) {
                count = klik_counters[i].manual;
            }
            draw_location_counter(ctx, locations[i], scale, [offsets.manual/scale,0], klik_counters_colors.manual, count); 
        }
    }

    if (draw_mobile) {
        offsets.mobile = offset++ * 2*gap + offset_adjust;
        for (var i=0; i<locations.length; i++) {
            var count = '...'
            if (klik_counters[i]) {
                count = klik_counters[i].mobile;
            }
            draw_location_counter(ctx, locations[i], scale, [offsets.mobile/scale,0], klik_counters_colors.mobile, count);
        }
    }
}


function manager_draw_counters_timestamps(ctx, scale) {
    if (!layer_flags.location.label[FLAG_INDEX_VISIBLE]) {
        return;
    }

    var draw_live   = layer_flags.live_counter.master[FLAG_INDEX_VISIBLE];
    var draw_system = layer_flags.system_counter.master[FLAG_INDEX_VISIBLE];
    var draw_manual = layer_flags.manual_counter.master[FLAG_INDEX_VISIBLE];
    var draw_mobile = layer_flags.mobile_counter.master[FLAG_INDEX_VISIBLE];

    if (draw_system | draw_manual | draw_mobile) {
        for (var i=0; i<locations.length; i++) {
            var time = '...';
            for (var j=0; j<items.mobiles.length; j++) {
                if (items.mobiles[j].custom.zone == locations[i].name) {
                    var entries = Utils.clone(items.mobiles[j].custom.history.entries);
                    entries.reverse();
                    for (var k=0; k<entries.length; k++) {
                        var entry = entries[k]
                        if (entry.zone===locations[i].name) {
                            // var time_str = (new Date(entry.time)).toString();
                            // var time_len = time_str.length;
                            // time = time_str.substring(time_len-23,time_len-15)
                            time = new Date(entry.time).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
                            break;
                        }
                    }
                }
            }
            draw_location_timestamp(ctx, locations[i], scale, time);
        }
    }
}


function manager_draw_animation(ctx, scale) {
    for (var i=0; i<items.pixels.length; i++) {
        var dev = items.pixels[i];
        if (dev.map) {

             // temporary replace pixel xy
            var old_x = dev.x;
            var old_y = dev.y;
            var old_label = dev.label;
            var old_dmx = dev.custom.dmx;

            // if (dev.custom.history && dev.custom.history.entries.length>0 && dev.custom.history.config.playback.rate>0) {
            if (dev.custom.history && dev.custom.history.entries.length) {
                
                backup[dev.id] = dev;

                var animate_positions = {manual:1, mobile:1, system:1}

                if (animate_positions.manual) {
                    var pos = dev.custom.history.entries[dev.history_index[0]].pos.manual[1]; // [zone, abs, norm]
                    dev.x = pos[0];
                    dev.y = pos[1];
                    dev.label = 'MAN:'+(dev.history_index[0]+1)+'/'+dev.custom.history.entries.length;
                    dev.custom.dmx = [127,255,0,0,0,0];
                    draw_device_background(ctx, dev, 1.0, '#f00');
                }

                if (animate_positions.mobile) {
                    var pos = dev.custom.history.entries[dev.history_index[0]].pos.mobile[1]; // [zone, abs, norm]
                    dev.x = pos[0];
                    dev.y = pos[1];
                    dev.label = 'MOB:'+(dev.history_index[0]+1)+'/'+dev.custom.history.entries.length;
                    dev.custom.dmx = [127,0,255,0,0,0];
                    draw_device_background(ctx, dev, 1.0, '#0f0');
                }

                if (animate_positions.system) {
                    var pos = dev.custom.history.entries[dev.history_index[0]].pos.system[1]; // [zone, abs, norm]
                    dev.x = pos[0];
                    dev.y = pos[1];
                    dev.label = 'SYS:'+(dev.history_index[0]+1)+'/'+dev.custom.history.entries.length;
                    dev.custom.dmx = [127,0,0,255,0,0];
                    draw_device_background(ctx, dev, 1.0, '#00f');
                }

                // increment and limit index
                dev.history_index[0]++;
                if (dev.history_index[0] >= dev.custom.history.entries.length ) {
                    dev.history_index[0] = 0;
                }
            }

            // restore
            dev.x = old_x;
            dev.y = old_y;
            dev.label = old_label;
            dev.custom.dmx = old_dmx;           
        }
    }
}


function manager_draw(viewport) {
    var scale = viewport.scale;
    var ctx = viewport.context;

    manager_draw_map(ctx, scale);

    manager_draw_locations(ctx, scale);

    manager_draw_device_type(ctx, scale, { name:0, glow:1, notify:1 }, 'tag');
    manager_draw_device_type(ctx, scale, { name:0, glow:1, notify:1 }, 'touchpoint');
    manager_draw_device_type(ctx, scale, { name:1, glow:1, notify:1 }, 'hub');
    manager_draw_device_type(ctx, scale, { name:1, glow:1, notify:1 }, 'beacon');

    manager_draw_device_type(ctx, scale, { name:1, glow:1, notify:1 }, 'pixel');
    manager_draw_device_type(ctx, scale, { name:1, glow:1, notify:1 }, 'registration');
    manager_draw_device_type(ctx, scale, { name:1, glow:1, notify:1 }, 'attendee');
    manager_draw_device_type(ctx, scale, { name:1, glow:1, notify:1 }, 'config');
    manager_draw_device_type(ctx, scale, { name:1, glow:1, notify:1 }, 'sentinelle');
    manager_draw_device_type(ctx, scale, { name:1, glow:1, notify:1 }, 'mobile');

    manager_draw_counters(ctx, scale);
    manager_draw_counters_timestamps(ctx, scale);

    manager_draw_locations_labels(ctx, scale);

    // manager_draw_animation(ctx, scale);
}
