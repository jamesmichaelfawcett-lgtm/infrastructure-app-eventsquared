// by VK <vk@pixmob.com

KlikPathPlayer = function(options=null) {
    KlikModule.call(this); // call super constructor

    this.speed =  0;
    this.time = null;
    this.head = 0;
    this.loop = 'once';
    this.play = false;
    this.ctx = null;
    this.strokes =  [];
    this.source = null;
    this.direction =  1;

    this.callback = null;

    for (k in options) { this[k] = options[k]; }

    this.init();
}


KlikPathPlayer.prototype = Object.create(KlikModule.prototype);
KlikPathPlayer.prototype.constructor = KlikPathPlayer;


KlikPathPlayer.prototype.init = function() {
    if(this.register_callbacks_on_init) {
        this.register_callbacks_on_init();
    }
}


KlikPathPlayer.prototype.process_command = function(command) {
    if(command == 'play') {
        this.strokes = this.source.coord[0];
        if (this.speed == 0) {
            console.log('zero')
            return; 
        }
        this.head = 0;
        if( this.timer ) { window.clearTimeout(this.timer); }

        var self = this;

        this.timer = setInterval(
            function() {
                var pos = self.animate(50);
                if(isNaN(pos[0]) || isNaN(pos[1])) {
                    console.log('ERROR: NAN,', pos);
                    return;
                }

                if(self.callback) {
                    self.callback(pos[0], pos[1 ]);
                }           
             }, 
            50);
    }

    else if(command == 'stop') { if(this.timer) { window.clearTimeout(this.timer); } }
    else if(command == 'loop') { this.loop = command; }
    else if(command == 'swing') { this.loop = command; }
    else if(command == 'once') { this.loop = command; }  
}


KlikPathPlayer.prototype.animate = function(interval) {
    if (this.loop == 'once') { 
        this.head += interval;
        this.direction = 1;
        if(this.head > this.speed) {
            window.clearTimeout(this.timer);
            console.log('stop player');
            this.timer = null;
            return this.strokes[this.strokes.length-1];
        }
    }
    else if (this.loop == 'loop') {
        this.head += interval;
        if(this.head > this.speed) {
            console.log('loop');
            this.head = 0;
        }
    }
    else if (this.loop == 'swing') {
        this.head += interval*this.direction;
        if(this.head > this.speed) {
            if(this.direction > 0) {
                this.direction = -1;
                this.head = this.speed;
            }
        }
        if (this.head < 0) {
            this.direction = 1;
            this.head = 0;
        }
    }

    var position = this.get_position_in_time(this.strokes, this.head, this.speed);
    return position;      
}


KlikPathPlayer.prototype.get_total_length = function(strokes) {
    var distance = 0;
    if (strokes.length < 2) { return 0; }
    for (var i = 1; i < strokes.length; i++) {
        var dx = strokes[i-1][0] - strokes[i][0];
        var dy = strokes[i-1][1] - strokes[i][1];
        distance += Math.sqrt(dx*dx + dy*dy);
        // console.log('chunk:', i, Math.sqrt(dx*dx + dy*dy), distance);
    }
    return distance;
}


KlikPathPlayer.prototype.find_chunk_interval = function(strokes, target) {
    var distance = 0;
        
    for (var i = 1; i < strokes.length; i++) {
        var dx = strokes[i-1][0] - strokes[i][0];
        var dy = strokes[i-1][1] - strokes[i][1];
        var temp = distance;
        distance += Math.sqrt(dx*dx + dy*dy);
        
        if(target < distance) {
            // console.log('found', 'target', target, 'distance', distance, 'i',i)
            return [i, temp];
        }
    }

    // console.log('not found', 'target', target, 'distance', distance, 'i',i)

    return [i-1, distance];   
}


KlikPathPlayer.prototype.get_distance_betweeen_two_points = function(x1, y1, x2, y2) {
        var dx = x1 - x2;
        var dy = y1 - y2;
        return Math.sqrt(dx*dx + dy*dy);    
}



//FIXME: when the direction of the path is from right to left, there are jitters
//FIXME: when the direction of the path is from right to left, there are jitters
//FIXME: when the direction of the path is from right to left, there are jitters
//FIXME: when the direction of the path is from right to left, there are jitters
KlikPathPlayer.prototype.get_fractional_position = function(x1, y1, x2, y2, fraction) {
    if (fraction == 1.0) { return [x2,y2]; }
    try {
        var dx = x1 - x2;
        var dy = y1 - y2;

        // if (dx == 0) { dx = 0.000001; }
        var da = dy/dx;

        var a = Math.sqrt(dx*dx + dy*dy);
        a = a*fraction;

        // if(x1 < x2) {
        //     var x = Math.sqrt(a*a/(da*da +1)) - x1;            
        // }
        // else {
        //     var x = Math.sqrt(a*a/(da*da +1)) + x1;    
        // }

        var x = Math.sqrt(a*a/(da*da +1)) + x1;    
        
        var y = da*(x-x1) + y1;
        // console.log( 'x/y:', x, y,  'pente:', da, (y1-y)/(x1-x),  'fr',a, Math.sqrt(dx*dx + dy*dy), Math.sqrt((x1-x)*(x1-x) + (y1-y)*(y1-y)));
        if(isNaN(x) || isNaN(y)) { 
            console.log('NOT A NUMBER');
            return [x1,y1];
        }
        return [x, y];
    } catch(error) {
        console.log('Divide by ZERO', error);
        return [x1,y1];
    }

}


KlikPathPlayer.prototype.get_position_in_time = function(strokes, offset, total) {
    var length = strokes.length
    var total_distance = this.get_total_length(strokes);

    var length = strokes.length;
    
    if (length < 2) { 
        console.log('nop');
        return [strokes[0]]; 
    }

    // map a time to distance, then find the position at the right distance
    offset *= 1.0;
    var target_distance = total_distance*(offset/total);

    // console.log('target:', target_distance, 'total', total_distance, '%', target_distance/total_distance);
    
    var chunk = this.find_chunk_interval(strokes, target_distance)
    var i = chunk[0];
    var chunk_distance = chunk[1];
    // console.log('i:', i, 'chin-dis', chunk_distance,'%',  (target_distance - chunk_distance)/(get_distance_betweeen_two_points(strokes[i-1][0], strokes[i-1][1],strokes[i][0], strokes[i][1])));


    var point = this.get_fractional_position(
        strokes[i-1][0], strokes[i-1][1],
        strokes[i][0], strokes[i][1],
        (target_distance - chunk_distance)/(this.get_distance_betweeen_two_points(strokes[i-1][0], strokes[i-1][1],strokes[i][0], strokes[i][1])));

    // var point = get_fractional_position(
    //     strokes[chunk-1][0], strokes[chunk-1][1],
    //     strokes[chunk][0], strokes[chunk][1],
    //     target_distance/total_distance);

    // console.log('pos-time', point);
    return point;
}