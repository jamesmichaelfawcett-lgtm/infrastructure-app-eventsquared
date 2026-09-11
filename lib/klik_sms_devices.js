// by JSR <jsr@pixmob.com>


// this.pixels dict looks like  : 
// {
//     AABBCC : '+14389893464',
//     112233 : '+14389893464',
// }

// this.phones dict looks like : 
// {
//     active : {
//         '+14389893464' : [ 'AABBCC', '112233'], 
//     },
//     all : {
//         '+14389893464' : [ 'AABBCC', '112233'],
//         '+14381112222' : [ '454545'],
//     }
// }

// phones.active
// -------------
// contains the phones with an ongoing conversation (or a completed one)

// phones.all 
// ----------
// contains even the phones that had their conversation reset
// so they are no more in the server phone database, but are
// still appearing in the sms history, in other words they are not 
// actively talking to the bot, but might have done it in the past


KlikSmsDevices = function(options=null) {
    KlikModule.call(this); // call super constructor

    this.label = 'devices';
    this.pixels = {};
    this.phones = {
        active : {}, 
        all : {}
    };
    this.tabs = {}
    this.tabs_selected = {}
    this.fifo = []
    this.color_index = 0;
    this.colors = [[255,0,0], [0,255,0], [0,0,255]]

    // overwrite defaults
    this.set(options);
}

KlikSmsDevices.prototype = Object.create(KlikModule.prototype);
KlikSmsDevices.prototype.constructor = KlikSmsDevices;


KlikSmsDevices.prototype.target_pixel = function(uid, color) {
    // add command to the queue
    this.fifo.push({
        effect : 'pulse', 
        speed  : 'normal', 
        color  : color,
        uid    : uid
    })

    // make sure none of the tabs are selected
    try {
        rem_class(tab_signal_off, 'selected');
    }
    catch(e){};

    try {
        rem_class(tab_background_black, 'selected');
    }
    catch(e){};

    try {
        rem_class(tab_background_blue, 'selected');
    }
    catch(e){};
}


KlikSmsDevices.prototype.get_paired_pixels = function(phone_number) {
    var arr = [];
    for (var k in this.pixels) {
        if (this.pixels[k]==phone_number) {
            arr.push(k)
        }
    }
    return arr; // array of pixel ids for that phone number
}


KlikSmsDevices.prototype.target_all_pixels_for = function(phone_number) {
    var pixels = this.phones.all[phone_number];
    this.deselect_tabs()
    for (var i=0; i<pixels.length; i++) {
        this.select_tab(pixels[i]);
    }
}


KlikSmsDevices.prototype.deselect_tabs = function() {
    for (var k in this.tabs_selected) {
        rem_class(this.tabs[k], 'selected');
    }
    this.tabs_selected = {}
}


KlikSmsDevices.prototype.select_tab = function(pixel_id) {
    add_class(this.tabs[pixel_id], 'selected');
    this.tabs_selected[pixel_id] = 1

    if (pixel_id.length==5 && pixel_id[0]=='+') { // old format +1234
        // this.target_pixel(pixel_id, this.colors[this.color_index++]);
        this.target_pixel(pixel_id, [0,255,0]);
    }
    else { // new format 0x11AAFF
        this.target_pixel(parseInt('0x'+pixel_id, 16), this.colors[this.color_index++]);
    }

    this.color_index %= this.colors.length;
}


KlikSmsDevices.prototype.update_phones_all = function(data) {
    if (!data.latest) {
        return;
    }

    // data
    for (var i=0; i<data.latest.length; i++) {
        if (data.latest[i].from!='BOT') {
            var phone = data.latest[i].from
            this.phones.all[phone] = this.get_paired_pixels(phone); 
        }
    }

    // ui
    var self = this;
    this.container.target_phones.innerHTML = '';
    for (var phone in this.phones.all) {
        var node = add_node(this.container.target_phones, 'button', {_l:phone})
        node.onmousedown = function(event) {
            self.target_all_pixels_for(event.target.innerHTML);
        }
    }
}


// server maintains the current list
// of phones that have started and/or completed a conversation
KlikSmsDevices.prototype.update_phones_active = function(data) {
    if (!data.phones) {
        return;
    }

    // data
    this.phones.active = {}
    for (var i=0; i<data.phones.length; i++) {
        var phone = data.phones[i];
        this.phones.active[phone] = this.get_paired_pixels(phone); 
    }

    // ui
    var self = this;
    if (this.container.active_phones != null) {
        this.container.active_phones.innerHTML = '';
        for (var phone in this.phones.active) {
            var node = add_node(this.container.active_phones, 'button', {_l:phone})
            node.onmousedown = function(event) {
                var to_delete = event.target.innerHTML
                app.api.chatbot_delete_phone(to_delete, function() { 
                    app.cout('deleted phone ', to_delete);
                    self.container.active_phones.innerHTML = '';
                });
            }
        }
    }
}


KlikSmsDevices.prototype.update_pixels = function(data) {
    if (!data.latest) {
        return;
    }

    // data
    for (var i=0; i<data.latest.length; i++) {
        var entry = data.latest[i];

        // check for 6 hex characters
        if (entry.message.length==6) {
            if (/^[0-9A-Fa-f]{6}$/i.test(entry.message)) {
                var uid = entry.message.toUpperCase();
                this.pixels[uid] = entry.from; // one pixel unique id : one phone number
            }
        }

        // check for old format : +1234
        else if (entry.message.length==5) {
            if (/^[+][0-9]{4}$/i.test(entry.message)) {
                var uid = entry.message.toUpperCase();
                this.pixels[uid] = entry.from; // one pixel unique id : one phone number
            }
        }
    }

    // ui
    var self = this;
    this.container.target_pixels.innerHTML = ''

    clear_tabs('group_1');
    
    for (var key in this.pixels) {
        var wrapper = add_node(this.container.target_pixels, 'div', {_s:'display:inline-block;'});

        var tab = add_tab(wrapper, { _g:1, _l:key, _s:'box-sizing:border-box; width:120; margin-right:5; display:block;'});
        var span = add_node(wrapper, 'div', {_s:'box-sizing:border-box; width:120; padding:10; margin-right:5; font-size:14; color:#00ffb9; background:#234;'});
        span.innerHTML = this.pixels[key]; // phone

        this.tabs[key] = tab;

        for (var k in this.tabs_selected) {
            if (key==k) {
                add_class(tab, 'selected');
            } 
        }
        
        tab.onmousedown = function(event) {
            self.deselect_tabs();
            self.select_tab(event.target.innerHTML)
        }
    }
}

