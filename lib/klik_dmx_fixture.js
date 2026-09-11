KlikDmxFixture = function(options=null) {
    KlikModule.call(this); // call super constructor

    this.address = 1;
    this.patch = null;
    this.absolute_callbacks = {};
    this.relative_callbacks = {};
    this.named_callbacks = {};

    // overwrite defaults
    this.set(options);

    this.init();
}


KlikDmxFixture.prototype = Object.create(KlikModule.prototype);
KlikDmxFixture.prototype.constructor = KlikDmxFixture;


KlikDmxFixture.prototype.init = function() { 
    this.fixture_size = this.channel_names.length;

    if (this.data  == undefined) {
        this.data = [];
        this.data[this.fixture_size-1] = 0;
        this.data.fill(0, 0, this.fixture_size);    // make on bigger
    }

    if(this.register_callbacks_on_init) {
        this.register_callbacks_on_init();
    }
}


KlikDmxFixture.prototype.get_channel_number = function(channel) {
    if(Number(channel) + 1) { return channel; }
    // console.log(this.channel_names)
    var i = this.channel_names.indexOf(channel);
    if(i < 0) { 
        throw new Error('channel mapping does not exist', channel);
    }

    // console.log('get-channel-number', i)
    return i;
}


KlikDmxFixture.prototype.get_channels = function(channels) {
    var result = {};

    for (var i = 0; i < channels.length; i++) {
        var channel = channels[i];
        var index = this.get_channel_number(channel);
        result[channel] = this.data[index]
    }

    return result;
}


KlikDmxFixture.prototype.set_channels = function(from, channels) {
    // console.log('fixture-set-channel', from, channels)
    Object.keys(channels).forEach(
        function (channel) {
            // console.log('fixture-set', channel, channels[channel], this.data, channels);
            var value = channels[channel];
            channel = this.get_channel_number(channel);
            // console.log(channel)
            if(this.patch) {
                value = this.patch(channel, value, this.data[channel])
            }
            this.data[channel] = value;
        }, 
        this
    );

    this.send_absolute(from);
    this.send_relative(from);
    this.send_named(from);
}


KlikDmxFixture.prototype.add_absolute_callback = function(who, callback) {
    this.absolute_callbacks[who] = callback;
}


KlikDmxFixture.prototype.add_relative_callback = function(who, callback) {
    this.relative_callbacks[who] = callback;
}


KlikDmxFixture.prototype.add_named_callback = function(who, callback) {
    this.named_callbacks[who] = callback;
}


KlikDmxFixture.prototype.send_absolute = function(from) {
    Object.keys(this.absolute_callbacks).forEach(
        function(source) {
            // console.log('fixture-send', 'from',from, 'to', source);
            if(source == from) { return; }
            var fixture = {};
            for (var i = 0; i < this.fixture_size; i++ ) {
                fixture[i + this.address] = this.data[i];
            }
            // console.log('fixture-absolute-send', fixture )
            this.absolute_callbacks[source]('from-fixture', fixture);
        },
        this
    );
}


KlikDmxFixture.prototype.send_relative = function(from) {
    Object.keys(this.relative_callbacks).forEach(
        function(source) {
            // console.log('fixture-send', 'from',from, 'to', source);
            if(source == from) { return; }
            var fixture = {};
            for (var i = 0; i < this.fixture_size; i++ ) {
                fixture[i] = this.data[i];
            }
            // console.log('fixture-relative-send', fixture )
            this.relative_callbacks[source]('from-fixture', fixture);
        },
        this
    );
}


KlikDmxFixture.prototype.send_named = function(from) {
    Object.keys(this.named_callbacks).forEach(
        function(source) {
            // console.log('fixture-send', 'from',from, 'to', source);
            if(source == from) { return; }
            var fixture = {};
            for (var i = 0; i < this.fixture_size; i++ ) {
                fixture[this.channel_names[i]] = this.data[i];
            }
            // console.log('fixture-relative-send', fixture )
            this.named_callbacks[source]('from-fixture', fixture);
        },
        this
    );
}


