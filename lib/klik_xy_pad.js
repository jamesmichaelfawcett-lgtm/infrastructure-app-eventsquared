// by VK <vk@pixmob.com

function ensure_0_to_255(value) {
    if(value > 255) { value = 255; }
    else if(value < 0) { value = 0; }
    return value;
}


KlikXYPad = function(options=null) {
    KlikModule.call(this); // call super constructor

    this.label = 'xy_pad';
    this.container = null;

    this.dim = { width : window.innerWidth, height : 200 };
    
    this.on_move_callbacks = [];
    this.on_pressed_released_callbacks = [];
    this.on_draw_callbacks = [];

    this.strokes_color = ['#00f', '#0ff', '#0f0', '#ff0', '#f00', '#f0f', '#fff']
    this.current_stroke = '1';
    this.strokes = {};

    this.pressed = false;
    this.draw_on_pad = false;

    for (k in options) { this[k] = options[k]; }

    this.dim_subset = {offset : {x : 0, y : 0}, dim : this.dim };   
    this.dim_current = {offset : {x : 0, y : 0}, dim : this.dim };   

    this.original_title = by_id(this.container.parentElement.id+'_title').innerHTML;

    this.init();
}


KlikXYPad.prototype = Object.create(KlikModule.prototype);
KlikXYPad.prototype.constructor = KlikXYPad;


KlikXYPad.prototype.enable_draw = function(draw) {
    this.draw_on_pad = draw;
}


KlikXYPad.prototype.enable_zoom = function(zoom) {
    if(zoom) {
        this.set_to_subset_pad();
        this.set_subset = null;
        this.update_canvas();
    }
    else {
        this.set_to_full_pad_size();
        this.update_canvas();
        this.set_subset = null;
    }
}


KlikXYPad.prototype.set_to_full_pad_size = function() {
    this.dim_current = { offset: {x : 0, y : 0}, dim : this.dim };
    console.log('use original pad:', this.dim_current)
}


KlikXYPad.prototype.set_to_subset_pad = function() {
    console.log('set subset', this.dim_subset, 'to', this.dim_current); 
    this.dim_current = this.dim_subset; 
}


KlikXYPad.prototype.set_subset_pad = function(offset, dim) {
    console.log('use pad, from ', this.dim_subset, 'to', { offset : offset, dim : dim }); 
    this.dim_subset = { offset : offset, dim : dim }; 
} 


KlikXYPad.prototype.init = function(data) {
    this.canvas = document.createElement('canvas'); 
    this.canvas.width = this.dim.width;
    this.canvas.height = this.dim.height;
    this.canvas.id = this.label;

    this.dim_subset = {offset: {x : 0, y : 0}, dim : this.dim}   
    this.dim_current = {offset: {x : 0, y : 0}, dim : this.dim}  

    var that = this;

    this.canvas.addEventListener("mousedown", function (event){
        that.pressed = true; 
        if(that.set_subset) {
            that.set_subset = 'offset'
            that.dim_subset.offset = { x : event.offsetX, y : event.offsetY };
            that.dim_subset.dim = {width : 0, height : 0};
            console.log('set-offset:', that.dim_subset.offset, that.dim_subset)
        }
        else {
            for(var i = 0; i < that.on_pressed_released_callbacks.length; i++) {
                // stop updating only if one has triggered, to prevent multiple selection
                if(that.on_pressed_released_callbacks[i](event.offsetX, event.offsetY, 'pressed')) { 
                    break; 
                }
            }
        }
    });

    this.canvas.addEventListener("mouseup", function (e) {
        // console.log('mouseup');
        that.get_next_stroke();
        that.pressed = false;
        if(that.set_subset) {
            that.set_subset = null
            var w = e.offsetX - that.dim_subset.offset.x;
            var h = e.offsetY - that.dim_subset.offset.y; 
            that.set_subset_pad(that.dim_subset.offset, { width:w, height:h})
            that.set_subset = null
        } 
        else {
            for(var i = 0; i < that.on_pressed_released_callbacks.length; i++) {
                // stop updating only if one has triggered, to prevent multiple selection
                if(that.on_pressed_released_callbacks[i](event.offsetX, event.offsetY, 'released')) { 
                    break; 
                }
            }
        }        
    });

    this.canvas.addEventListener("mousemove", function(e) {
        if (that.pressed) { 
            that.draw(e, '#f00'); 
            for(var i = 0; i < that.on_move_callbacks.length; i++) {
                // stop updating only if one has triggered, to prevent multiple selection
                if(that.on_move_callbacks[i](event.offsetX, event.offsetY, false)) {
                    break; 
                }
            }            
        }
        else { that.draw(e, '#00f'); }
    });
   
    var container = this.container.appendChild(this.canvas);
    //needd to capture the keypress
    this.canvas.setAttribute('tabindex', '1');

    this.ctx = document.getElementById(this.label).getContext('2d');
}


KlikXYPad.prototype.add_callback = function(where, callback) {
    this[where].push(callback);
}


KlikXYPad.prototype.get_current_stroke = function() {
    // create a new route/stroke if doesnt exist, otherwise return it
    var route = this.strokes[this.current_stroke];

    if (route == undefined) { 
        this.strokes[this.current_stroke] = {color:this.strokes_color[parseInt(this.current_stroke) - 1], coord:[[]]}; 
        route = this.strokes[this.current_stroke];
        route.next_stroke = 0;
        console.log('add-route:', route.color);
    }

    // create next stroke, in case it was not yet created
    if (route.coord[route.next_stroke] == undefined) { 
        route.coord[route.next_stroke] = [];        
    }

    return  route.coord[route.next_stroke];
}


KlikXYPad.prototype.get_next_stroke = function() {
    var stroke = this.get_current_stroke();

    // don't create new strokes if the current one is empty
    if(stroke.length == 0) { return stroke; }

    this.strokes[this.current_stroke].next_stroke += 1;

    return this.get_current_stroke();
}


KlikXYPad.prototype.draw_subset = function() {
    if(!(this.dim_current.offset.x == 0  &&
        this.dim_current.offset.y == 0 &&
        this.dim_current.dim.width == this.dim.width &&
        this.dim_current.dim.height == this.dim.height)) {
            return;
    }
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.lineWidth = "1";
    this.ctx.strokeStyle = '#fff';
    this.ctx.rect(this.dim_subset.offset.x, this.dim_subset.offset.y, this.dim_subset.dim.width, this.dim_subset.dim.height);
    this.ctx.stroke();
    this.ctx.restore();
}


KlikXYPad.prototype.draw_target = function(x, y, color='#fff') {
    const size = 50;    
    const half_size = size/2;
    this.ctx.save();
    this.ctx.beginPath();

    this.ctx.lineWidth = "2";
    this.ctx.strokeStyle = color;
    this.ctx.lineCap="round";
    //vertical
    this.ctx.moveTo(x - half_size, y);
    this.ctx.lineTo(x + half_size, y);
    //horizontal
    this.ctx.moveTo(x, y - half_size);
    this.ctx.lineTo(x, y + half_size);
    this.ctx.stroke();
    this.ctx.restore();
}


KlikXYPad.prototype.draw_strokes = function() {
    var keys = Object.keys(this.strokes);

    this.ctx.save();
    for (var k = 0; k < keys.length; k++) {
        var route = this.strokes[keys[k]]

        for (var stroke = 0; stroke < route.coord.length; stroke++) {
            if( route.coord[stroke].length == 0) { continue; }

            if( route.coord[stroke].length == 1) {
                this.ctx.fillStyle = '#0ff'
                this.ctx.fillRect(route.coord[stroke][0][0], route.coord[0][1], 10, 10);             
                continue;
            }

            this.ctx.beginPath(); 
            this.ctx.lineWidth = "2";

            this.ctx.strokeStyle = route.color;
            var pos = this.full_canvas_to_view_position(route.coord[stroke][0][0], route.coord[stroke][0][1])
            this.ctx.moveTo(pos.x, pos.y);    

            for(var i = 1; i < route.coord[stroke].length; i++) {
                var pos = this.full_canvas_to_view_position(route.coord[stroke][i][0], route.coord[stroke][i][1]);
                this.ctx.lineTo(pos.x, pos.y);
            }       

            this.ctx.stroke();          
        }
    }
    this.ctx.restore();
}


KlikXYPad.prototype.add_stroke = function(x, y) {
    this.get_current_stroke();
    this.get_current_stroke().push([x, y]);
}


KlikXYPad.prototype.erase_strokes = function() {
    this.strokes[this.current_stroke].coord = [];
    this.strokes[this.current_stroke].next_stroke = 0;
    this.clear_canvas();
    this.draw_strokes();    
}


KlikXYPad.prototype.set_active_color_pad = function(active) {
    this.current_stroke = active;
}


KlikXYPad.prototype.clear_canvas = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); 
}


KlikXYPad.prototype.full_canvas_to_view_position_x = function(x){
    x = x - this.dim_current.offset.x;
    x = x / this.dim_current.dim.width;
    x = x * this.dim.width;
    return x;
}


KlikXYPad.prototype.full_canvas_to_view_position_y = function(y){
    y = y - this.dim_current.offset.y;
    y = y / this.dim_current.dim.height;
    y = y * this.dim.height;
    return y;
}


KlikXYPad.prototype.view_to_full_canvas_position_x = function(x){
    x = x * this.dim_current.dim.width;
    x = x / this.dim.width;
    x = x + this.dim_current.offset.x
    return x;
}


KlikXYPad.prototype.view_to_full_canvas_position_y = function(y){
    y = y * this.dim_current.dim.height;
    y = y / this.dim.height;
    y = y + this.dim_current.offset.y
    return y; 
}

KlikXYPad.prototype.view_to_full_canvas_position = function(x, y) {
    return { 
        x : this.view_to_full_canvas_position_x(x), 
        y : this.view_to_full_canvas_position_y(y)
    };
}


KlikXYPad.prototype.full_canvas_to_view_position = function(x, y) {
    return {
        x : this.full_canvas_to_view_position_x(x),
        y : this.full_canvas_to_view_position_y(y)
    };
}


KlikXYPad.prototype.update_canvas = function() {
    this.clear_canvas();
    this.draw_strokes();
    this.draw_subset();

    for(var i = 0; i < this.on_draw_callbacks.length; i++) {
        this.on_draw_callbacks[i]();
    }
}


KlikXYPad.prototype.draw = function(event, target_color) {
    // console.log('+++++++++++++++++++++++++++++');
    this.update_canvas();

    var x = event.offsetX;
    var y = event.offsetY;

    this.draw_target(x,  y, target_color)

                // var tilt_raw = Math.floor((y/this.canvas.height)*255.0);
                // var pan_raw = Math.floor((x/this.canvas.width)*255.0);
                // // pan_raw = 255 - pan_raw;

                // var tilt = Math.floor((this.view_to_full_canvas_position_y(y)/this.canvas.height)*255.0);
                // var pan = Math.floor((this.view_to_full_canvas_position_x(x)/this.canvas.width)*255.0);

                // tilt = ensure_0_to_255(tilt);
                // pan = ensure_0_to_255(pan);

                // pan = 255 - pan;
                // console.log('x:%d/%d  y:%d/%d  dmx: %d %d  scaled: %d %d',x, this.canvas.width, y, this.canvas.height,  tilt_raw, pan_raw, tilt, pan);

    if(this.set_subset == 'offset') {
        var w = x - this.dim_subset.offset.x;
        var h = y - this.dim_subset.offset.y; 

        this.ctx.save();
        this.ctx.strokeStyle = '#ff0';
        this.ctx.rect(this.dim_subset.offset.x, this.dim_subset.offset.y, w, h);
        this.ctx.stroke();
        this.ctx.restore();
        return;
    }

    if(this.draw_on_pad && this.pressed) { 
        var pos = this.view_to_full_canvas_position(x, y);
        this.add_stroke(pos.x, pos.y);
    }    
}

