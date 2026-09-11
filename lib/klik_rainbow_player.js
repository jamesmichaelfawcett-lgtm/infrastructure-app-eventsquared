// by VK <vk@pixmob.com

KlikRainbowPlayer = function(options=null) {
    KlikModule.call(this); // call super constructor

    this.timer =  null,
    this.index =  0,
    this.speed =  1,

    this.callback = null;

    for (k in options) { this[k] = options[k]; }

    this.init();
}


KlikRainbowPlayer.prototype = Object.create(KlikModule.prototype);
KlikRainbowPlayer.prototype.constructor = KlikRainbowPlayer;


KlikRainbowPlayer.prototype.init = function() {
    if(this.register_callbacks_on_init) {
        this.register_callbacks_on_init();
    }
}


KlikRainbowPlayer.prototype.process_command = function(command) {
    if(command == 'start') { 
        console.log('start')
        if(this.timer == null) {     
            var self = this;               
            this.timer = setInterval(
                function() {
                    self.index += self.speed;
                    if(self.index > 360) { self.index = 0; }
                    
                    var rgb = hsv_to_rgb(self.index, 100, 100);
                    
                    if(self.callback) { 
                        self.callback(rgb[0], rgb[1], rgb[2]);  
                    }
                }, 
                50
            );
        }
    }
    else if(command == 'stop') { 
        console.log('stop')
        window.clearTimeout(this.timer);
        this.timer= null;
    } 

}


