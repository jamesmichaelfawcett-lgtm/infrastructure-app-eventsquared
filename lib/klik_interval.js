
KlikInterval = function(options=null) {
    KlikModule.call(this); // call super constructor

    this.label = 'interval';
    this.index = 0;
    this.min = 0;
    this.max = 10;
    this.interval = 100; // ms
    this.instance = null
    this.callback = null;

    for (k in options) {
        this[k] = options[k];
    }

    // this.start();
}

KlikInterval.prototype = Object.create(KlikModule.prototype);
KlikInterval.prototype.constructor = KlikInterval;


KlikInterval.prototype.set_interval = function(value) {
    this.interval = value;
    this.start(false);
}


KlikInterval.prototype.start = function(reset_index=true) {
    if (reset_index) {
        this.index = this.min;
    }

    this.stop();

    var self = this;
    this.instance = setInterval(function() {
        self.fire();
    }, this.interval)
    
    this.fire();
}


KlikInterval.prototype.stop = function() {
    if (this.instance) {
        clearInterval(this.instance);
        this.instance = null;
    }
}


KlikInterval.prototype.fire = function() {
    if (this.callback) {
        this.callback();
        this.next_index();
    }
}


KlikInterval.prototype.next_index = function() {
    this.index++;
    if (this.index>this.max) {
        this.index = this.min;
    }
}


KlikInterval.prototype.prev_index = function() {
    this.index--;
    if (this.index<this.min) {
        this.index = this.max;
    }
}


KlikInterval.prototype.toggle = function() {
    if (this.instance) {
        this.stop();
    }
    else {
        this.start(false);
    }
}


