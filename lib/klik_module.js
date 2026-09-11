// by JSR <jsr@pixmob.com>


KlikModule = function(label='basemodule') {
	this.uid = Utils.generate_uid();

    // overwrite them
    this.label = label; 
    this.container = null;
    this.callbacks = {};
    this.tabs_offset = 0;
}


KlikModule.prototype.set = function(params) {
    for (k in params) {
        this[k] = params[k];
    }
}


KlikModule.prototype.cout = function() {
    var args = Array.from(arguments);
    args.splice(0,0, this.label+' >');
    cout.apply(this, args);
}


KlikModule.prototype.print_infos = function() {
    this.cout('uid', ':', this.uid);
}


// usage : 
// in the following example
// the KlikModuleExample subclass with inherit the KlikModule methods

/*

var KlikModuleExample = function(options=null) {
    KlikModule.call(this); // call super constructor

    // defaults
    this.label = 'example';

    // override defaults with provided options
    for (k in options) {
        this[k] = options[k];
    }
}

KlikModuleExample.prototype = Object.create(KlikModule.prototype);
KlikModuleExample.prototype.constructor = KlikModuleExample;

*/