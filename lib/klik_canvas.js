// by JSR <jsr@pixmob.com>

// this is a better way to do the canvas + zoom thing
// its better because it does not constently redraw, 
// and it also handles transformation in a smarter way

// important : this is not currently used in the Klik Manager
// but our goal is to eventually use it

var KlikCanvas = function(name, style_highlight, style_background, width, height, add_pixels=[0,0], load_test_map=false) {
    this.lib_folder = '../../lib';
    this.name = name;

    this.style  =  {
        margin : 0, 
        padding : 0,
        background : style_background, 
        highlight : style_highlight,
    }

    this.zoom_range     = [0.1, 10];
    this.zoom_scale     = 1.0;
    this.point_last     = null;
    this.point_start    = null;
    this.dragged        = false;

    this.scale = [width, height];
    this.add_pixels = add_pixels;
   
    this.canvas = document.createElement("canvas");
    this.canvas.id = this.name;
    this.canvas.style.background = this.style.background;
    this.canvas.style.padding    = this.style.padding;
    this.canvas.style.margin     = this.style.margin;

    if (load_test_map) {
        this.img  = this.add_image(this.lib_folder+'/img/map-bright.png');
    }
    this.ball = this.add_image(this.lib_folder+'/img/icon-tag.png');

    this.element_is_highlighted = false;
    this.element_is_selected = false;


    // to override
    this.callbacks = { 
        mousemove_element : function(view, x, y) {
            console.log('you need to override "mousemove_element"'); 
            return false;
        },
        mousedown_element : function(view, x, y) {
            console.log('you need to override "mousedown_element"'); 
            return false;
        },
        mousedrag_element : function(view, x, y) {
            console.log('you need to override "mousedrag_element" : ', x, y); 
        }
    };

    var self = this;

    setTimeout(function(){
        self.adjust_canvas();
        self.draw(); 
    }, 50);


    // disable scrolling of the whole page
    // as we handle all zooming within this object
    // klik_disable_panning();


    // mouse events
    this.mousedown = function(event) {
        document.body.style.userSelect = 'none';
        self.point_last[0] = event.offsetX || (event.pageX - self.canvas.offsetLeft);
        self.point_last[1] = event.offsetY || (event.pageY - self.canvas.offsetTop);
        self.point_start = self.ctx.transformedPoint(self.point_last[0], self.point_last[1]);
        self.dragged = false;

        if (self.callbacks.mousedown_element)
            self.element_is_selected = self.callbacks.mousedown_element(self, self.point_start.x, self.point_start.y);
    };

    this.mousemove = function(event) {
        self.point_last[0] = event.offsetX || (event.pageX - self.canvas.offsetLeft);
        self.point_last[1] = event.offsetY || (event.pageY - self.canvas.offsetTop);
        self.dragged = true;

        var pt = self.ctx.transformedPoint(self.point_last[0], self.point_last[1]);

        if (self.callbacks.mousemove_element) {
            self.element_is_highlighted = self.callbacks.mousemove_element(self, pt.x, pt.y );
        }

        if (self.point_start) {
            if (self.element_is_selected && self.callbacks.mousedrag_element) {
                self.callbacks.mousedrag_element(self, pt.x, pt.y);
            }
            else {
                self.ctx.translate(pt.x-self.point_start.x, pt.y-self.point_start.y);
            }
            self.draw(self);
        }
    }

    this.mouseup = function(event) {
        self.point_start = null;
        self.element_is_selected = false; // vk
    }

    this.canvas.addEventListener('mousedown', function(event) {
        self.mousedown(event);
    }, false);

    this.canvas.addEventListener('mousemove', function(event) {
        self.mousemove(event);
    }, false);

    this.canvas.addEventListener('mouseup', function(event) {
        self.mouseup(event);
    }, false);

    this.canvas.addEventListener('mousewheel', function(event) {
        var delta = event.wheelDelta ? event.wheelDelta/120 : event.detail ? -event.detail : 0;
        if (delta)
            self.zoom(delta, 1.02);
        return event.preventDefault() && false;
    }, false);



    // touch events : just triggering the mouse events
    if (app.ios) {
        this.canvas.addEventListener('touchstart', function(event) {
            var obj = klik_handle_touchstart(event);
            self.mousedown(obj.event);
        }, false);


        this.canvas.addEventListener('touchmove', function(event) {
            var obj = klik_handle_touchmove(event);
            if (obj.zoom) {
                self.zoom(obj.zoom.delta/10, 1.05);
            }
            else {
                self.mousemove(obj.event);
            }
        }, false);


        this.canvas.addEventListener('touchend', function(event) {
            var obj = klik_handle_touchend(event);
            self.mouseup(obj.event);
        }, false);
    }

    window.addEventListener('resize', this.debouncer(
        function(){
            self.adjust_canvas();
            self.draw();
        }
    ), false);
}


KlikCanvas.prototype.clear = function() {
    var p1 = this.ctx.transformedPoint(0,0);
    var p2 = this.ctx.transformedPoint(this.canvas.width, this.canvas.height);
    this.ctx.clearRect(p1.x, p1.y, p2.x-p1.x, p2.y-p1.y);

    // alternatively, to clear :
    // this.ctx.save();
    // this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    // this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    // this.ctx.restore();
}


KlikCanvas.prototype.background = function(alpha=1.0) {
    if (this.img) {
        this.ctx.globalAlpha = alpha;
        this.ctx.drawImage(this.img, 0, 0); 
        this.ctx.globalAlpha = 1.0; // reset alpha;
    }
}


KlikCanvas.prototype.draw = function() {
    this.clear();
    this.background(0.5);
    this.draw_test();
    this.draw_marker(160,250);
    this.draw_marker(260,350);
    this.draw_marker(360,450);
}


KlikCanvas.prototype.draw_marker = function(x, y) {
    this.ctx.save();

    this.ctx.beginPath();
    this.ctx.fillStyle = this.style.highlight;
    this.ctx.arc(x, y, 30, 0, Math.PI * 2, false)
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(x, y, 30, 0, Math.PI * 2, false);
    this.ctx.clip();

    this.ctx.beginPath();
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 30;
    this.ctx.shadowBlur = 30
    this.ctx.shadowColor = 'black';
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    this.ctx.arc(x, y, 30 + 3, 0, Math.PI * 1, false);
    this.ctx.stroke();
    
    this.ctx.restore();
}


KlikCanvas.prototype.get_scaled_width = function() {
    return this.scale[0] * window.innerWidth - this.canvas.parentNode.offsetLeft;
}


KlikCanvas.prototype.get_scaled_height = function() {
    return this.scale[1] * window.innerHeight - this.canvas.parentNode.offsetTop;
}


KlikCanvas.prototype.adjust_canvas = function() {
    // console.log('scaled: %d %d', this.get_scaled_width(), this.get_scaled_height());
    this.canvas.width  = this.get_scaled_width()  - (this.style.margin+this.style.padding) * 2 + this.add_pixels[0];
    this.canvas.height = this.get_scaled_height() - (this.style.margin+this.style.padding) * 2 + this.add_pixels[1];
  
    this.point_last = [this.canvas.width/2, this.canvas.height/2];
    this.ctx = this.canvas.getContext('2d');
    this.track_transforms();
}


KlikCanvas.prototype.zoom = function(delta, scale_factor=1.05) {
    var factor = Math.pow(scale_factor, delta);
    var temp = this.zoom_scale*factor;
    if (temp>this.zoom_range[0] && temp<this.zoom_range[1]) {
        var pt = this.ctx.transformedPoint(this.point_last[0], this.point_last[1]);
        this.ctx.translate(pt.x, pt.y);
        this.ctx.scale(factor, factor);
        this.ctx.translate(-pt.x, -pt.y);
        this.draw();
        this.zoom_scale = temp;
    }
}


KlikCanvas.prototype.add_image = function(src_url) {
    var image = new Image;
    image.src = src_url;
    return image;
}


KlikCanvas.prototype.track_transforms = function() {
    
    var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
    var xform = svg.createSVGMatrix();
    var savedTransforms = [];

    var self = this;
    this.ctx.getTransform = function() { 
        return xform; // returns SVGMatrix
    };
    
    var save = this.ctx.save;
    this.ctx.save = function(){
        savedTransforms.push(xform.translate(0,0));
        return save.call(self.ctx);
    };

    var restore = this.ctx.restore;
    this.ctx.restore = function() {
        xform = savedTransforms.pop();
        return restore.call(self.ctx);
    };

    var scale = this.ctx.scale;
    this.ctx.scale = function(sx, sy) {
        xform = xform.scaleNonUniform(sx, sy);
        return scale.call(self.ctx, sx, sy);
    };

    var rotate = this.ctx.rotate;
    this.ctx.rotate = function(radians) {
        xform = xform.rotate(radians*180/Math.PI);
        return rotate.call(self.ctx, radians);
    };

    var translate = this.ctx.translate;
    this.ctx.translate = function(dx, dy) {
        xform = xform.translate(dx, dy);
        return translate.call(self.ctx, dx, dy);
    };

    var transform = this.ctx.transform;
    this.ctx.transform = function(a, b, c, d, e, f) {
        var m2 = svg.createSVGMatrix();
        m2.a = a;
        m2.b = b;
        m2.c = c;
        m2.d = d;
        m2.e = e;
        m2.f = f;
        xform = xform.multiply(m2);
        return transform.call(self.ctx, a, b, c, d, e, f);
    };

    var setTransform = this.ctx.setTransform;
    this.ctx.setTransform = function(a, b, c, d, e, f) {
        xform.a = a;
        xform.b = b;
        xform.c = c;
        xform.d = d;
        xform.e = e;
        xform.f = f;
        return setTransform.call(self.ctx, a, b, c, d, e, f);
    };

    var pt = svg.createSVGPoint();
    this.ctx.transformedPoint = function(x,y) {
        pt.x = x;
        pt.y = y;
        return pt.matrixTransform(xform.inverse()); // returns an SVGPoint
    }
}


KlikCanvas.prototype.draw_test = function() {
    this.ctx.drawImage(this.ball,510,310,100,100); // big B
    this.ctx.drawImage(this.ball,710,310,40,40); // small B

    // grid of tags
    var pos = [45,50];
    var dims = [350,100];
    var tagsize = [10,10];
    var spacing = [10,10];
    var cellsize = [tagsize[0]+spacing[0], tagsize[1]+spacing[1]]
    var qty_x = dims[0] / cellsize[0];
    var qty_y = dims[1] / cellsize[1];

    for (var x=0; x<qty_x; x++) {
        for (var y=0; y<qty_y; y++) {
            this.ctx.drawImage(this.ball,
                pos[0]+x*cellsize[0], 
                pos[1]+y*cellsize[1], 
                tagsize[0],
                tagsize[1]);
        }
    }
}


KlikCanvas.prototype.debouncer = function(func, timeout=0) {
    var timeout_id;
    var self = this;
    return function () {
        var args = arguments;
        clearTimeout(timeout_id);
        timeout_id = setTimeout(function() {
            func.apply(self, Array.prototype.slice.call(args));
        }, timeout );
    }
}

