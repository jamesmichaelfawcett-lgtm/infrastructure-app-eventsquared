KlikDmxFixtureSLiders = function(options=null) {
    KlikModule.call(this); // call super constructor

    // this.label = 'editor';
    this.ui = [];
    this.address = 1;
    this.name = 'slider1';

    // this.colors = null;
    this.display = { offset:1, label:1, number:1, slider:1 };

    // overwrite defaults
    this.set(options);

    // user cannot change this
    this.last_time = new Date();

    for (k in options) { this[k] = options[k]; }


    // set the default callbacks
    if (!this.callbacks) {
        var self = this;
        this.callbacks = function(data) {
            self.cout('on_change', ':', JSON.stringify(data));
        }
    }

    this.init();
}


KlikDmxFixtureSLiders.prototype = Object.create(KlikModule.prototype);
KlikDmxFixtureSLiders.prototype.constructor = KlikDmxFixtureSLiders;


KlikDmxFixtureSLiders.prototype.init = function() { 
    if(this.register_callbacks_on_init) {
        this.register_callbacks_on_init();
    }
    
	// console.log(this)
    for (var i = 0; i < this.channel_names.length; i++) {
        this.container.appendChild(this.create_slider(i));
    }


}


KlikDmxFixtureSLiders.prototype.on_slider_move = function(offset, value) {
	value = parseInt(value);
	this.ui[offset].parts.number.value = value;
	// console.log('slider-move', offset, value);
	this.call_callbacks(offset, value);
}


KlikDmxFixtureSLiders.prototype.call_callbacks = function(offset, value) {
	if(this.callback) {
		var d = {}; 
		d[offset] = value
		this.callback( 'from-slider', d );
	}
}


KlikDmxFixtureSLiders.prototype.set_sliders = function(from, values) {
	var bckup = this.callback;
	this.callback = null;

	Object.keys(values).forEach(
		function(offset){
			// console.log('set-sliders',this.name,  offset, values[offset])
			var address = offset;
			var value = values[offset];
			this.ui[address].parts.slider.value = value;
			this.ui[address].parts.number.value = value;			
		},
		this
	);

	this.callback = bckup;
}

KlikDmxFixtureSLiders.prototype.create_slider = function(offset) {
    var label = this.channel_names[offset];
    var absolute_channel = offset + this.address

    // create wrapper
    var node = document.createElement('div');
    node.className = 'dmx_channel'

    // create components
    var ui = { offset:null, label:null, number:null, slider:null };

    // offset
    if (this.display.offset) {
        ui.offset = document.createElement('label')
        ui.offset.className = 'dmx_offset';
        ui.offset.innerHTML = absolute_channel;
        node.appendChild(ui.offset);
    }

    // label
    if (this.display.label) {
        ui.label = document.createElement('input')
        ui.label.type = 'text';
        ui.label.className = 'dmx_label';
        ui.label.value = label;
        node.appendChild(ui.label);
    }

    // number
    if (this.display.number) {
        ui.number = document.createElement('input')
        ui.number.type = 'number';
        ui.number.className = 'dmx_number';
        ui.number.min = 0;
        ui.number.max = 255;
        ui.number.step = 1;
        ui.number.value = 0;
        node.appendChild(ui.number);

        if(this.color) { ui.number.style.backgroundColor = this.color }
    }

    // slider
    if (this.display.slider) {
        ui.slider = document.createElement('input')
        ui.slider.type = 'range';
        ui.slider.className = 'dmx_slider';
        ui.slider.min = 0;
        ui.slider.max = 255;
        ui.slider.step = 1;
        ui.slider.value = 0;
        node.appendChild(ui.slider);
    }
    
    var self = this;

    // handlers
    if (ui.number && ui.slider) {

        ui.slider.oninput = function(event){            
            event.stopPropagation();
            // console.log('--------------------offset', offset);
            self.on_slider_move(offset, this.value);
        }

        ui.number.oninput = function(event){
            console.log('input', event);
            event.stopPropagation();
            if (this.value>255) { this.value = 255; }
            else if (this.value<0) { this.value = 0; }
			this.ui[offset].parts.slider.value = value;
			this.call_callbacks(offset, this.value);
        }
    }

    // will adjust heights once items have been created
    // all this because we rotated the slider 270 degrees
    setTimeout(function() {
        var height = 0;
        height += (!self.display.offset)?0:parseInt(window.getComputedStyle(ui.offset).height.slice(0, -2));
        height += (!self.display.label )?0:parseInt(window.getComputedStyle(ui.label ).height.slice(0, -2));
        height += (!self.display.number)?0:parseInt(window.getComputedStyle(ui.number).height.slice(0, -2));
        height += (!self.display.slider)?0:parseInt(window.getComputedStyle(ui.slider).width.slice(0, -2)); // because slider is rotated
        node.style.height = height;
    }, 50);

    this.ui.push({slider:node, parts:ui})

    return node;
}