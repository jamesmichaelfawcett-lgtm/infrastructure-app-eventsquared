// by VK <vk@pixmob.com> & JSR <jsr@pixmob.com


// static : MapTools

var MapTools = {};

MapTools.init_tracking_maps = function(quantity, target) {
    var div = add_node(target, 'div', {_s:'height:auto'});
    var arr = [];
    var border = (quantity==1) ? 0 : 1;
    var w = 1.0/quantity;
    for (var i=0; i<quantity; i++) {

        arr[i] = new KlikMapTracking({ id:'map_'+i, width:w, adjust:[-2*border,-2*border-30]});
        arr[i].get_canvas().style.left = i*(100*w)+'%';
        arr[i].get_canvas().style.border = border+'px solid #fff';
        arr[i].drawing(true);

        div.appendChild(arr[i].get_canvas());
    }
    return arr;
}


MapTools.init_tracking_infos = function(quantity, target) {
    var style = 'font-size:11; width:50%; height:100; display:none; vertical-align:top; padding:0px; margin-top:4px; margin-right:4px; background-color:#234;'
    var arr = [];
    for (var i=0; i<quantity; i++) {
        arr[i] = add_node(target, 'div', { _s:style});
    }
    klik_ui_adjust_widths(arr);
    return arr;
}


MapTools.init_tracking_menus = function(quantity, target, callback, id, database_maps) {
    var options = [];
    for (var i=0; i<database_maps.length; i++) {
        options[i] = 'map '+i;
    }

    var arr = [];
    for (var i=0; i<quantity; i++) {
        arr[i] = add_node(target, 'select', { _i:id+'_'+i });
        arr[i].addEventListener('change', callback);
        for (var j=0; j<options.length; j++) {
            var item = add_node(arr[i], 'option', { value:options[j], _l: options[j]});
            item.selected = (i==j);
        }
    }
    klik_ui_adjust_widths(arr);
    return arr;
}


// class : KlikMapTracking

function KlikMapTracking(options) {
    this.label = 'map';
    this.counter = 0;

    // from the database
    this.infra = {};
    this.maps = {};
    this.locations = {};

    // authorized devices
    this.whitelist = []; 

    // devices seen so far
    this.devices = { tags:{}, pixels:{} }; 

    // image
    this.image = new Image();
    this.image_loaded  = false;

    // custom canvas
    this.canvas = new KlikCanvas(options.id, '#00ffb9', '#111', options.width, 1.0, options.adjust);

    // selection
    this.selected_id = null;
    this.highlighted_id = null;

    // drawing
    this.draw_timer = null;
    this.draw_config = {
        draw_pixel_function : draw_pixel,
        draw_tag_function : draw_tag, 
    };

    this.current = { index:0, map:null };


    var self = this;

    this.canvas.draw = function() {
        this.clear();
        this.background(0.6);
        self.draw_locations();
        self.draw_devices();
    }

    this.canvas.callbacks = {
        mousemove_element : function(ref, x, y) {
            if (self.hit_test_highlighted(x, y, 'pixels') || 
                self.hit_test_highlighted(x, y, 'tags')) {
                return true;
            }
            self.set_highlighted_device(null);
            return false;
        },

        mousedown_element : function(ref, x, y) {
            if (self.hit_test_selected(x, y, 'pixels') || 
                self.hit_test_selected(x, y, 'tags')) {
                return true;
            }
            self.set_selected_device(null);
            return false;
        },

        mousedrag_element : function(ref, x, y) {
            var dev = self.get_selected_device();
            if (dev) {
                dev.x = x;
                dev.y = y;
            }
        }
    }
}


KlikMapTracking.prototype.cout = function() {
    var args = Array.from(arguments);
    args.splice(0,0, this.label+' >');
    cout.apply(this, args);
}


KlikMapTracking.prototype.draw_locations = function() {
    draw_locations(this.canvas.ctx, this.locations, this.current.map);
}


KlikMapTracking.prototype.draw_devices = function() {

    var config = {
        now:(new Date()).getTime(),
        device_line_timeout: MapStyle.tracking.line.timeout,
        just_received_time: MapStyle.tracking.notification.timeout,
    };

    // position tags
    // - always from the infrastructure positions
    this.set_positions_from_infra('tags');

    // position pixels
    // - manually
    // - via the positions from the database (fixed, manually set in the manager)
    // - using the best 3 tags (triangulation)
    // - using the nearest tag
    // - using the system tracking data (center of a zone)
    switch (tracking) {
        case TRACKING_DATABASE :
            this.set_positions_from_infra('pixels');
            break;

        case TRACKING_TRIANGULATION :
            auto_position_devices(this.devices, config, false); 
            break;

        case TRACKING_NEAREST :
            auto_position_devices(this.devices, config, true); 
            break;

        case TRACKING_SYSTEM :
            // todo
            break;

        case TRACKING_MANUAL :
        default:
            break;
    }

    // draw tags and pixels
    draw_devices_connections(this.canvas.ctx, this.devices, config);
    draw_devices(this.canvas.ctx, this.devices, config);
}


KlikMapTracking.prototype.hit_test_highlighted = function(x, y, type) {
    for (var id in this.devices[type]) {
        if (is_inside_circle(x, y, this.devices[type][id])) {
            this.set_highlighted_device(id);
            return true;
        }
    }
    return false;
}


KlikMapTracking.prototype.hit_test_selected = function(x, y, type) {
    for (var id in this.devices[type]) {
        if (is_inside_circle(x, y, this.devices[type][id])) {
            this.set_selected_device(id);
            return true;
        }
    }
    return false;
}


KlikMapTracking.prototype.set_positions_from_infra = function(type) {
    if (this.infra && this.devices && this.infra[type] && this.devices[type] && this.image) {
        for (var id in this.devices[type]) {
            if (this.infra[type][id]) {
                var pos = absolute_point(
                    this.infra[type][id].x, 
                    this.infra[type][id].y, 
                    this.image
                )
                this.devices[type][id].x = pos[0];
                this.devices[type][id].y = pos[1];
            }
        }
    }
}


KlikMapTracking.prototype.update_whitelist = function(types=['tags', 'pixels']) {
    this.whitelist = [];
    for (var i=0; i<types.length; i++) {
        if (this.infra[types[i]]) {
            this.whitelist = Array.prototype.concat(this.whitelist, Object.keys(this.infra[types[i]]));
        }
    }
}


KlikMapTracking.prototype.load_image = function(image_url) {
    var self = this;
    self.image_loaded = false;
    this.image.onload = function() {
        self.canvas.img = self.image; // once the image has loaded, replace image on the KlikCanvas
        self.image_loaded = true;
        self.recalculate_coords();
    }
    this.image.src = image_url;   
}


KlikMapTracking.prototype.set_current_map_by_index = function(index) {
    if (this.maps) {
        this.current.index = index;
        this.current.map = this.maps[Object.keys(this.maps)[index]];
        this.load_image(this.current.map.image_url);
        // this.load_image(this.current.map.image_url+ '&size=1280')
    }
}


KlikMapTracking.prototype.recalculate_coords = function() {
    if (this.locations && this.canvas.img) {
        for (var id in this.locations) { 
            if (this.locations[id].map == this.current.map.id) {
                this.locations[id].coords = absolute_coords(this.locations[id].coordinates, this.canvas.img);
            }
        }
    }
}


KlikMapTracking.prototype.get_canvas = function() {
    return this.canvas.canvas;
}


KlikMapTracking.prototype.draw = function() {
    this.canvas.draw();
}


KlikMapTracking.prototype.drawing = function(state) {
    clearTimeout(this.draw_timer);
    this.draw_timer = null;
    if (state) { 
        var self = this;
        this.draw_timer = setInterval(function(){
            self.draw();
        }, 100); 
    }
}


KlikMapTracking.prototype.get_selected_device = function() {
    return this.get_device(this.selected_id);
}


KlikMapTracking.prototype.set_selected_device = function(id) {
    this.selected_id = id;
    if (id) {
        var dev = this.get_device(id);
        if (dev && linking) {
            dev.linked = !dev.linked;
        }
        add_class(document.body, 'grab');
    }
    else {
        rem_class(document.body, 'grab');
    }  
}


KlikMapTracking.prototype.get_highlighted_device = function() {
    return this.get_device(this.highlighted_id);
}


KlikMapTracking.prototype.set_highlighted_device = function(id) {
    this.highlighted_id = id;
    if (id) {
        add_class(document.body, 'pointer');
    }
    else {
        rem_class(document.body, 'grab');
        rem_class(document.body, 'pointer');
    } 
}


KlikMapTracking.prototype.get_list_of_devices = function(id) {
    if (id.startsWith('PIX')) { 
        return this.devices.pixels;
    }
    if (id.startsWith('TAG')) { 
        return this.devices.tags; 
    }
    return null;
}


KlikMapTracking.prototype.get_device = function(id) {
    var list = this.get_list_of_devices(id);
    if (list) {
        return list[id];
    }
    return null;
}


KlikMapTracking.prototype.update_device = function(device) {
    if (this.whitelist.includes(device.name)) { 
        if (this.devices && this.draw_config) {
            klik_parse_tags_packet_from_device(device, this.devices, this.draw_config);
        }
    }
}

KlikMapTracking.prototype.update_devices = function(devices) {
    for (var name in devices) {
        this.update_device(devices[name]);
    }
}

