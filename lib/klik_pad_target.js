// by VK <vk@pixmob.com

KlikPadTarget = function(options=null) {
    KlikModule.call(this); // call super constructor

    this.pressed = false;
    this.over = false;
    
    this.x = 0;
    this.y = 0;
    
    this.radius = 60;
    this.ctx = null;

    this.color = '#fff';

    for (k in options) { this[k] = options[k]; }

    this.init();
}


KlikPadTarget.prototype = Object.create(KlikModule.prototype);
KlikPadTarget.prototype.constructor = KlikPadTarget;


KlikPadTarget.prototype.init = function() {
    if(this.register_callbacks_on_init) {
        this.register_callbacks_on_init();
    }
}


KlikPadTarget.prototype.on_move = function(x, y, bypass) {
    if (!this.pressed && !bypass) { return false; }
    this.update(x, y, bypass);
    return true;
}


KlikPadTarget.prototype.dmx_move = function(pan, tilt) {
    var x = (pan/255.0)*this.master_pad.canvas.width;
    var y = (tilt/255.0)*this.master_pad.canvas.height;
    // console.log('scalled to:', x,'x', y, this.master_pad.canvas.width, 'x',this.master_pad.canvas.height);
    this.x = x;
    this.y = y;

    this.master_pad.update_canvas();
}


KlikPadTarget.prototype.on_click = function(x, y, up_down) {
    this.pressed = false;
    this.over = false;

    if(!this.is_mouse_over(x, y)) { return false; }
    
    this.over = true;
    
    if(up_down != 'pressed') { return false; }

    this.pressed = true;

    return true;
}



KlikPadTarget.prototype.update = function(x, y, bypass) {
    // bypass is when value are recorded, an not comming from the pad
    if (bypass) {
        // console.log('bypass')
        this.x = x;
        this.y = y;

        var tilt = Math.floor((this.y/this.master_pad.canvas.height)*255.0);
        var pan = Math.floor((this.x/this.master_pad.canvas.width)*255.0);

        if(this.callback) { this.callback(pan, tilt); }
        return;
    }
 
    // we only save the absolute position on the canvas, to not deal with synchronisation
    var pos = this.master_pad.view_to_full_canvas_position(x, y);
    this.x = pos.x;
    this.y = pos.y;

    if(this.callback) { 
        var tilt = Math.floor((pos.y/this.master_pad.canvas.height)*255.0);
        var pan = Math.floor((pos.x/this.master_pad.canvas.width)*255.0);
        this.callback(pan, tilt); 
    }
}


KlikPadTarget.prototype.is_mouse_over = function(x, y) {
    var pos = this.master_pad.full_canvas_to_view_position(this.x, this.y)
    var dx = x - pos.x;
    var dy = y - pos.y;
    var distance  = dx*dx + dy*dy;

    if(distance < this.radius*this.radius) { return true;}
    return false;
}


KlikPadTarget.prototype.draw = function() {
    var pos = this.master_pad.full_canvas_to_view_position(this.x, this.y)
    this.ctx.save();
    this.ctx.lineWidth = '2';
    if(this.over) {  this.ctx.lineWidth = '10'; }
    if(this.pressed) { this.ctx.lineWidth = '20'; }

    this.ctx.beginPath();
    this.ctx.strokeStyle = this.color;
    this.ctx.arc(pos.x, pos.y, this.radius, 0, 2*Math.PI);
    this.ctx.stroke();
    this.ctx.restore();
}












