// by JSR <jsr@pixmob.com>

KlikMultiView = function(div_id, rows, cols, prefix, framerate, callback) {
    this.rows = rows;
    this.cols = cols;
    this.size = rows*cols;
    this.prefix = prefix;
    this.viewports = [];

    var html = '';
    for (var i=0; i<this.size; i++) {
        html+='<canvas id="'+prefix+(i+1)+'" ></canvas>'
        // html+='<canvas id="'+prefix+(i+1)+'"></canvas>'
    }
    $('#'+div_id).html(html);

    // var toolbar_size = [0, 0];

    var dims = [];
    dims[0] = window.innerWidth /rows;
    dims[1] = window.innerHeight/cols; 
    // console.log('dims ' + dims[0] +' '+ dims[1]);

    for (var i=0; i<this.size; i++) {
        this.viewports.push(new KlikViewport(prefix+(i+1), framerate, callback, dims, i));
    }
}

KlikMultiView.prototype.hide = function() {
    for (var i in this.viewports) {
        $('#'+this.viewports[i].name).hide();
    }
}

KlikMultiView.prototype.fadeIn = function() {
    for (var i in this.viewports) {
        $('#'+this.viewports[i].name).fadeIn();
    }
}

KlikMultiView.prototype.get_index = function(canvas_id) {
    return canvas_id.split('_')[1]-1;
}

KlikMultiView.prototype.start = function(callback) {
    for (var i=0; i<this.viewports.length; i++) {
        this.viewports[i].start(callback);
    }
}

KlikMultiView.prototype.stop = function() {
    for (var i=0; i<this.viewports.length; i++) {
        this.viewports[i].stop();
    }
}

KlikMultiView.prototype.adjust = function() {
    for (var i=0; i<this.viewports.length; i++) {
        this.viewports[i].adjust();
    }
}

KlikMultiView.prototype.zoom = function(index, value, point) {
    this.viewports[index].zoom(value, point);
}

KlikMultiView.prototype.translate = function(index, x, y) {
    this.viewports[index].translate(x, y);
}


KlikViewport = function(canvas_name, framerate, callback, dims, index) {
    this.name       = canvas_name;
    this.selected   = false;
    this.dims       = dims;
    this.canvas     = by_id(canvas_name);
    this.context    = this.canvas.getContext('2d');
    this.offset     = $('#'+canvas_name).offset();
    this.framerate  = framerate;
    this.callback   = callback;
    this.scale      = 1;
    this.origin     = [0,0];
    this.index      = index; 

    // detects retina displays
    // if (window.devicePixelRatio) {
    //     console.log('window.devicePixelRatio:',  window.devicePixelRatio);
    // }
}

KlikViewport.prototype.stop = function() {
    clearInterval(this.interval);
    this.context.clearRect(this.origin[0], this.origin[1], 
    this.canvas.width/this.scale, this.canvas.height/this.scale);
}

KlikViewport.prototype.start = function(callback) {
    this.set_framerate(this.framerate);
    this.adjust(callback);
}

KlikViewport.prototype.adjust = function(callback) {
    // this.canvas.width  = this.dims[0]; // window.innerWidth;
    // this.canvas.height = this.dims[1]; // window.innerHeight;

    this.canvas.width  = window.innerWidth; //- 16;
    this.canvas.height = window.innerHeight; // - 16;

    // var ios = navigator.userAgent.match(/(iPad|iPhone|iPod)/g);

    // if  (ios && window.navigator.standalone && (window.innerWidth>window.innerHeight)) {
    //     this.canvas.width  = window.innerHeight;
    //     this.canvas.height = window.innerWidth;
    //     klik_debug.console('** w:'+this.canvas.width +' h:'+this.canvas.height);
    // }
    // else {
    //     this.canvas.width  = window.innerWidth;
    //     this.canvas.height = window.innerHeight;
    //     klik_debug.console('w:'+this.canvas.width +' h:'+this.canvas.height);
    // }
    this.reset();

    if (callback) {
        callback(this.index);
    }
}

KlikViewport.prototype.zoom = function(value, point) {
    var pt = [point[0]-this.canvas.offsetLeft, point[1]-this.canvas.offsetTop];
    var temp  = this.scale*value;
    if ( (temp>SCALE_MIN) && (temp<SCALE_MAX) ) {
        this.context.translate(this.origin[0], this.origin[1]);
        this.origin[0] -= pt[0]/temp - pt[0]/this.scale;
        this.origin[1] -= pt[1]/temp - pt[1]/this.scale;
        this.context.scale(value, value);
        this.context.translate(-this.origin[0], -this.origin[1]);
        this.scale = temp;
    } 
    // console.log(pt[0]/temp - pt[0]/this.scale, pt[1]/temp - pt[1]/this.scale)
}

KlikViewport.prototype.reset = function() {
    this.scale = 1;
    this.origin = [0,0];
    this.context.setTransform(1, 0, 0, 1, 0, 0); // reset to identity matrix
}

KlikViewport.prototype.translate = function(x, y) {
    this.context.translate(this.origin[0], this.origin[1]);
    this.origin[0] -= x;
    this.origin[1] -= y;
    this.context.translate(-this.origin[0], -this.origin[1]);
}

KlikViewport.prototype.set_framerate = function(fps) {
    this.framerate = fps;
    clearInterval(this.interval);
    if (fps!=0) {
        clearInterval(this.interval);
        this.interval = setInterval(this.callback, 1000.0/this.framerate)
    }
}
