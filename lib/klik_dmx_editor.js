// by JSR <jsr@pixmob.com>

KlikDmxEditor = function(options=null) {
    KlikModule.call(this); // call super constructor

    this.label = 'editor';
    this.data = [];
    this.fixture = {
        channels : [
            'ch1' ,'ch2' ,'ch3' ,'ch4' ,'ch5',
            'ch6' ,'ch7' ,'ch8' ,'ch9' ,'ch10'
        ],
    }
    this.colors = null;
    this.display = { offset:1, label:1, number:1, slider:1 };

    // overwrite defaults
    this.set(options);

    // user cannot change this
    this.last_time = new Date();

    // set the default callbacks
    if (!this.callbacks.on_change) {
        var self = this;
        this.callbacks.on_change = function(data) {
            self.cout('on_change', ':', JSON.stringify(data));
        }
    }

    this.init();
}

KlikDmxEditor.prototype = Object.create(KlikModule.prototype);
KlikDmxEditor.prototype.constructor = KlikDmxEditor;


KlikDmxEditor.prototype.init = function() {
    for (var i=1; i<=this.fixture.channels.length; i++) {
        this.data.push(0);
        this.container.appendChild(this.create_slider(i));
    }

    console.log(this.data)

    // window.ondragover = function(event) {
    //     event.preventDefault();
    // }
}


KlikDmxEditor.prototype.set_dmx_out = function(data) {
    if (!data.dmx_out) {
        return;
    }

    // will update the ui only if it has been more than 200ms since the last time
    // the on_change callback was called, we do this to limit the feedback loop
    // cause by the feedback data coming from the dmx interface

    for (var i=0; i<this.fixture.channels.length; i++) {
        if (i<data.dmx_out.length) {
            this.set_channel_value(i+1, data.dmx_out[i])
        }
        else {
            this.set_channel_value(i+1, 0)
        }
    }
}


KlikDmxEditor.prototype.set_channel_value = function(channel, value) {
    // set array
    this.data[channel-1] = value;

    // adjust ui
    by_id('ch'+channel+'_number').value = value;
    by_id('ch'+channel+'_slider').value = value;
}


KlikDmxEditor.prototype.set_channel_value_and_send = function(channel, value) {

    this.set_channel_value(channel, parseInt(value));

    // callbacks, limited to 40fps
    if (this.last_time) {
        var delta = (new Date()) - this.last_time;
        if (delta>=25) {
            this.last_time = new Date();

            if (this.callbacks.on_change) {
                var i = channel-1;
                this.callbacks.on_change({
                    channel : channel, 
                    label   : this.fixture.channels[i],
                    value   : this.data[i],
                    frame   : this.data
                });
            } 
        }
    }
}


KlikDmxEditor.prototype.set_background = function(node, channel) {
    for (var color in this.colors) {
        var start = this.colors[color][0];
        var end   = this.colors[color][1];
        if ((channel>=start) && (channel<=end)) {
            node.style.backgroundColor = color;
        }
    }
}


KlikDmxEditor.prototype.create_slider = function(offset) {

    var name = 'ch'+offset;
    var label = this.fixture.channels[offset-1];

    // create wrapper
    var node = document.createElement('div');
    node.className = 'dmx_channel'

    // create components
    var ui = { offset:null, label:null, number:null, slider:null };

    // offset
    if (this.display.offset) {
        ui.offset = document.createElement('label')
        ui.offset.className = 'dmx_offset';
        ui.offset.id = name+'_offset';
        ui.offset.innerHTML = offset;
        node.appendChild(ui.offset);
    }

    // label
    if (this.display.label) {
        ui.label = document.createElement('input')
        ui.label.type = 'text';
        ui.label.className = 'dmx_label';
        ui.label.id = name+'_label';
        ui.label.value = label;
        node.appendChild(ui.label);
    }

    // number
    if (this.display.number) {
        ui.number = document.createElement('input')
        ui.number.type = 'number';
        ui.number.className = 'dmx_number';
        ui.number.id = name+'_number';
        ui.number.min = 0;
        ui.number.max = 255;
        ui.number.step = 1;
        ui.number.value = 0;
        node.appendChild(ui.number);

        this.set_background(ui.number, offset);
    }

    // slider
    if (this.display.slider) {
        ui.slider = document.createElement('input')
        ui.slider.type = 'range';
        ui.slider.className = 'dmx_slider';
        ui.slider.id = name+'_slider';
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
            self.set_channel_value_and_send(offset, this.value);
        }

        ui.slider.onmouseup = function(event){
            event.stopPropagation();
            self.set_channel_value_and_send(offset, this.value);
        }

        ui.number.oninput = function(event){
            event.stopPropagation();
            if (this.value>255) {
                this.value = 255;
            }
            else if (this.value<0) {
                this.value = 0;
            }
            self.set_channel_value_and_send(offset, this.value);
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

    return node;
}
