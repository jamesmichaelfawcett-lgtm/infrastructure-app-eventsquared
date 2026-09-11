KlikDmxPreset = function(options=null) {
    KlikModule.call(this); // call super constructor

    this.preset_mapping = []; 	// names and offset-as-number can be used
    this.preset_names = [];
	this.callback = null;
	this.presets = {};
	this.current_preset = null;
	this.preset_nodes = [];

    // overwrite defaults
    this.set(options);

    this.init();
}


KlikDmxPreset.prototype = Object.create(KlikModule.prototype);
KlikDmxPreset.prototype.constructor = KlikDmxPreset;


KlikDmxPreset.prototype.init = function() { 
	this.add_preset_ui(this.container, this.preset_names);
	this.current_preset = this.preset_names[0];
	add_class(this.preset_nodes[0], 'selected');

	if(this.register_callbacks_on_init) {
		this.register_callbacks_on_init();
	}
}


KlikDmxPreset.prototype.get_address = function(name) {
	if(Number.isInteger(name)) { return name - 1; }
	return this.channel_names.indexOf(name);
}


KlikDmxPreset.prototype.update_preset = function(from, data) {
		// create a preset entry if it's the first time it is populated
	if(this.presets[this.current_preset]==undefined) { this.presets[this.current_preset] = {} }

	// save only the needed addresses
	this.preset_mapping.forEach(
		function(name) {
			var offset = this.get_address(name);
			this.presets[this.current_preset][offset] = data[offset];
			
			// paint the preset, if it is used
			var index = this.preset_names.indexOf(this.current_preset);
			if(index > -1) { this.preset_nodes[index].style.color = '#ff0000'; }		
		},
		this
	);	
}


KlikDmxPreset.prototype.activate_preset = function(preset) {
	// console.log('preset:get-preset:', preset, this.presets, this.current_preset)
	this.current_preset = preset;
	
	if (this.presets[this.current_preset]) {
		var result = {};
		for (var i = 0; i < this.preset_mapping.length; i++) {
			var channel = this.get_address(this.preset_mapping[i]);
			result[channel] = this.presets[this.current_preset][channel];
		}
		this.callback('preset', result);
	}
}


KlikDmxPreset.prototype.add_preset_ui = function(container, preset_names) {
	var self = this;

	for(var i = 0; i < preset_names.length; i++) {
		var name = preset_names[i];
		var node = add_node(container, 'tab', { _l:name, _g:this.name});

		node.ui_name = name;
		this.preset_nodes.push(node);

		node.addEventListener('mousedown', 
			function(event) {
				var node = event.target;
				if (node.getAttribute('_radiogroup')) {
					var rg = node.getAttribute('_radiogroup');
					for (var i = 0; i < self.preset_nodes.length; i++) {
						rem_class(self.preset_nodes[i], 'selected'); 
					}
					add_class(node, 'selected');
				}

				// activate preset 
				self.activate_preset(this.ui_name);
			}
		);
	}
}
