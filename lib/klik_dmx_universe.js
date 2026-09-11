KlikDmxUniverse = function(options=null) {
    KlikModule.call(this); // call super constructor

    this.patch = null;
	this.dmx_enable = true;
	this.fixture_size = 512;
	this.callbacks = [];

    // overwrite defaults
    this.set(options);

    if (this.data == undefined) {
	    this.data = [];
	    this.data[this.fixture_size-1] = 0;
	    this.data.fill(0, 0, this.fixture_size-1);
	}

    this.init();
}


KlikDmxUniverse.prototype = Object.create(KlikModule.prototype);
KlikDmxUniverse.prototype.constructor = KlikDmxUniverse;


KlikDmxUniverse.prototype.init = function() { 

}


KlikDmxUniverse.prototype.set_channels = function(channels) {
	// console.log('DMX-set-channel', channels)
	Object.keys(channels).forEach(
		function (channel) {
			var value = channels[channel];
			if(this.patch) { value = this.patch(channel, value, this.data[channel]); }
			this.data[channel] = value;
		},
		this
	);
	this.send();
}


// return the full universe or an array of requested addresses
KlikDmxUniverse.prototype.get = function() {
	var result = [];

	// return only the selected channels as a list
	if(arguments.length) { 
		for(var i = 0; i < arguments.length; i++) {
			result.append( this.data[arguments[i]] );
		}
	}
	else { 
		result = this.data.slice(); 
	}
	return result;
}


KlikDmxUniverse.prototype.enable = function(state) {
	this.dmx_enable = state;
	if(state) { this.send(); }
}


KlikDmxUniverse.prototype.add_callback = function(callback) {
	this.callbacks.push(callback);
}


KlikDmxUniverse.prototype.send = function() { 
	// naive way to check if function
	if(this.dmx_enable) {
		for (var i = 0; i < this.callbacks.length; i++) {
			// to make things simple, we will remove the first byte, as fixtures starts at address 1, 
			// this way all the offsets are always good, and we dont need to compensate for them everywhere
			this.callbacks[i](this.data.slice(1));
		}
	}
}
