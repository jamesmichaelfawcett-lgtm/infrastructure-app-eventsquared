// by jsr@pixmob.com

const WAND_DEFAULT_CUE_COLOR    = '#000';
const WAND_DEFAULT_CUE_OPACITY  = 1.0;

const WAND_SELECTED_CUE_COLOR   = '#f00';
const WAND_SELECTED_CUE_OPACITY = 1.0;

const WAND_SENT_CUE_COLOR       = '#600';
const WAND_SENT_CUE_OPACITY     = 1.0;

const WAND_UI_MAX_SECTIONS = 5;

const BTN_TEST_LABEL_START = 'START TEST';
const BTN_TEST_LABEL_STOP  = 'STOP TEST';


const WAND_UI_ORDER = {
    groups        : 'select',
    probabilities : 'select',
    colors        : 'input',
    effects       : 'select',
    speeds        : 'select',
    commando      : 'select',
    arg1          : 'select',
    arg2          : 'select',
    arg3          : 'select',
    confirm       : 'select',
}


WandController = function(options=null) {
    KlikModule.call(this); // call super constructor

    this.label = 'wand';
    this.ready = false;
    this.last_packet = [];
    this.timeout_broadcast_stop = null;

    for (k in options) {
        this[k] = options[k];
    }

    // menus content
    this.menus = {
        effects         : {},
        speeds          : {},
        probabilities   : {},
        groups          : {},
        commando        : {},
        arg1            : {},
        arg2            : {},
        arg3            : {},
        confirm         : {},
    }

    this.menus.effects       = DMX_PRO2_EFFECTS;
    this.menus.speeds        = DMX_PRO2_SPEEDS;
    this.menus.probabilities = DMX_PRO2_PROBABILITIES;
    this.menus.groups        = DMX_PRO2_GROUPS;
    this.menus.commando      = DMX_PRO2_COMMANDO;
    this.menus.arg1          = DMX_PRO2_COMMANDO_ARGS['set_layer_active'][0];
    this.menus.arg2          = DMX_PRO2_COMMANDO_ARGS['set_layer_active'][1];
    this.menus.arg3          = DMX_PRO2_COMMANDO_ARGS['set_layer_active'][2];
    this.menus.confirm       = DMX_PRO2_COMMANDO_CONFIRM;

    // removing : pro, video, express and transmitter
    delete this.menus.effects['pro'];
    delete this.menus.effects['video'];
    delete this.menus.effects['express'];
    delete this.menus.effects['transmitter'];

    // 0x23 : {name:'wand-full-pro2-fixture'       // [0]address, [1..22]data
    // 0x24 : {name:'wand-simple-pro2-fixture'     // [0]address, [1]fx_speed, [2-3-4]rgb
    // 0x25 : {name:'wand-button-trigger'          // [0]duration (0=stop, 255=25 seconds)
    // 0x26 : {name:'wand-feedback-config'         // [0]interval [1]button_config b0:idle b1:press b2:release
    // 0x27 : {name:'wand-rssi-filter'             // [0]rssi
    // 0x28 : {name:'wand-mac-filter'              // [0-1-2]mac
    // 0x29 : {name:'wand-save-fixture'            // [0]address, if 0:clear universe starting at 1] [1..22]data
    // 0x2A : {name:'wand-save-current-universe'
    // 0x2B : {name:'wand-load-fixture'

    // ui references
    this.ui_ref = {
        pickers         : [],
        colors          : [],
        effects         : [],
        speeds          : [],
        probabilities   : [],
        groups          : [],
        commando        : [],
        arg1            : [],
        arg2            : [],
        arg3            : [],
        confirm         : [],
    }

    this.CODE_DMX       = klik_get_command_code('wand-full-pro2-fixture');
    this.CODE_TRIGGER   = klik_get_command_code('wand-button-trigger');
    this.CODE_SAVE      = klik_get_command_code('wand-save-fixture');
    this.CODE_LOAD      = klik_get_command_code('wand-load-fixture');

    // this.cout('commands', ':', 'CODE_DMX ='    , this.CODE_DMX);
    // this.cout('commands', ':', 'CODE_TRIGGER =', this.CODE_TRIGGER);
    // this.cout('commands', ':', 'CODE_SAVE ='   , this.CODE_SAVE);
    // this.cout('commands', ':', 'CODE_LOAD ='   , this.CODE_LOAD);


    var self = this;

    this.get_color = function(color_hex_or_rgb) {
        if (typeof(color_hex_or_rgb)=='string') {
            return CP.HEX2RGB(color_hex_or_rgb);
        }
        else {
            return color_hex_or_rgb;
        }
    }


    this.set_effect = function(
        key_group,
        color,
        key_effect, 
        key_speed, 
        key_probability )
    {
        if (!this.ready) {
            return;
        }

        var rgb = self.get_color(color);

        var dmx_group       = DMX_PRO2_GROUPS[key_group];
        var dmx_effect      = DMX_PRO2_EFFECTS[key_effect];
        var dmx_speed       = DMX_PRO2_SPEEDS[key_speed];
        var dmx_probability = DMX_PRO2_PROBABILITIES[key_probability];

        if (dmx_effect      == undefined) { console.log('error', ':', 'effect is undefined'       ); return; }
        if (dmx_speed       == undefined) { console.log('error', ':', 'speed is undefined'        ); return; }
        if (dmx_probability == undefined) { console.log('error', ':', 'probability is undefined'  ); return; }
        if (dmx_group       == undefined) { console.log('error', ':', 'group is undefined'        ); return; }

        self.cout('effect', ':', key_group, key_probability+'%', rgb, key_effect, key_speed);
    
        self.pro2_effect(dmx_group, rgb, dmx_effect, dmx_speed, dmx_probability);
    }


    this.set_commando = function(
        key_group,
        color,
        key_commando,
        key_arg1,
        key_arg2,
        key_arg3,
        key_confirm )
    {
        if (!this.ready) {
            return;
        }

        var rgb = self.get_color(color);

        var dmx_group    = DMX_PRO2_GROUPS[key_group];
        var dmx_commando = DMX_PRO2_COMMANDO[key_commando];
        var dmx_arg1     = DMX_PRO2_COMMANDO_ARGS[key_commando][0][key_arg1];
        var dmx_arg2     = DMX_PRO2_COMMANDO_ARGS[key_commando][1][key_arg2];
        var dmx_arg3     = DMX_PRO2_COMMANDO_ARGS[key_commando][2][key_arg3];
        var dmx_confirm  = DMX_PRO2_COMMANDO_CONFIRM[key_confirm];

        if (dmx_group    == undefined) { console.log('error', ':', 'group is undefined'); return; }
        if (dmx_commando == undefined) { console.log('error', ':', 'commando is undefined'); return; }
        if (dmx_arg1     == undefined) { console.log('error', ':', 'arg1 is undefined'); return; }
        if (dmx_arg2     == undefined) { console.log('error', ':', 'arg2 is undefined'); return; }
        if (dmx_arg3     == undefined) { console.log('error', ':', 'arg3 is undefined'); return; }
        if (dmx_confirm  == undefined) { console.log('error', ':', 'confirm is undefined'); return; }

        self.cout('command', ':', key_group, rgb, key_commando, key_arg1, key_arg2, key_arg3, key_confirm);

        self.pro2_commando(dmx_group, rgb, dmx_commando, dmx_arg1, dmx_arg2, dmx_arg3, dmx_confirm);
    }
}   

WandController.prototype = Object.create(KlikModule.prototype);
WandController.prototype.constructor = WandController;


WandController.prototype.pro2_effect = function(
    group, 
    rgb,
    effect, 
    speed, 
    probability )
{
    var packet = DMX_PRO2_EMPTY_PACKET();

    packet[ DMX_PRO2_OFFSET_SIGNAL ]        = 255;
    packet[ DMX_PRO2_OFFSET_EFFECT ]        = effect;
    packet[ DMX_PRO2_OFFSET_SPEED ]         = speed;
    packet[ DMX_PRO2_OFFSET_GROUP ]         = group;
    packet[ DMX_PRO2_OFFSET_RED ]           = rgb[0];
    packet[ DMX_PRO2_OFFSET_GREEN ]         = rgb[1];
    packet[ DMX_PRO2_OFFSET_BLUE ]          = rgb[2];
    packet[ DMX_PRO2_OFFSET_PROBABILITY ]   = probability;

    // clip packet
    // packet = packet.slice(0, 1+DMX_PRO2_OFFSET_PROBABILITY);

    this.send_dmx(packet);
}


WandController.prototype.pro2_commando = function(
    group,
    rgb, 
    prog_pixel, 
    prog_arg1,
    prog_arg2,
    prog_arg3,
    prog_confirm )
{
    var packet = DMX_PRO2_EMPTY_PACKET();

    packet[ DMX_PRO2_OFFSET_SIGNAL ]        = 255;
    packet[ DMX_PRO2_OFFSET_EFFECT ]        = 240;
    packet[ DMX_PRO2_OFFSET_GROUP ]         = group;
    packet[ DMX_PRO2_OFFSET_RED ]           = rgb[0];
    packet[ DMX_PRO2_OFFSET_GREEN ]         = rgb[1];
    packet[ DMX_PRO2_OFFSET_BLUE ]          = rgb[2];
    packet[ DMX_PRO2_OFFSET_PIXEL ]         = prog_pixel;
    packet[ DMX_PRO2_OFFSET_ARG1 ]          = prog_arg1;
    packet[ DMX_PRO2_OFFSET_ARG2 ]          = prog_arg2;
    packet[ DMX_PRO2_OFFSET_ARG3 ]          = prog_arg3;
    packet[ DMX_PRO2_OFFSET_CONFIRM ]       = prog_confirm;

    this.send_dmx(packet);
}


WandController.prototype.init = function() {
    var self = this;

    if (!app.api) {
        self.cout('missing api');
        return;
    }

    if (!self.config) {
        self.cout('missing config');
        return;
    }


    // create the sections

    var i = 0;
    for (var item in self.menus.effects) {
        // app.navigation.push({ title:'Pro2 Command' });
        if (i<WAND_UI_MAX_SECTIONS) {
            app.navigation.push({});  
        }
        i++;
    }

    sections = app.add_navigation();


    // generic buttons

    var handle_click = function(event) {
        this.style.opacity = 0.5;
        if (event.target.innerHTML.toLowerCase().match('save')) {
            wand.save();
        }
        else if (event.target.innerHTML.toLowerCase().match('clear')) {
            wand.clear();
        }
        else if (event.target.innerHTML.toLowerCase().match('button press')) {
            wand.trigger(100); // about 10 sec
        }
        else if (event.target.innerHTML.toLowerCase().match('button release')) {
            wand.trigger(0);
        }

        var btn = this;
        setTimeout(function(){
            btn.style.opacity = 1.0;
        }, 100);
    }


    var btn_style = 'width:171; height:50; background-color:#f00; border-radius:5px; vertical-align:top; margin:10; color:white; font-size:16; outline: none; display:inline-block; border:none;'

    var btn_save = add_node(document.body, 'button', { _s:btn_style });
    btn_save.innerHTML   = 'SAVE UNIVERSE';
    btn_save.onclick = handle_click;

    var btn_clear = add_node(document.body, 'button', { _s:btn_style });
    btn_clear.innerHTML   = 'CLEAR UNIVERSE';
    btn_clear.onclick = handle_click;

    var btn_trigger_on = add_node(document.body, 'button', { _s:btn_style });
    btn_trigger_on.innerHTML   = 'BUTTON PRESS';
    btn_trigger_on.onclick = handle_click;

    var btn_trigger_off = add_node(document.body, 'button', { _s:btn_style });
    btn_trigger_off.innerHTML   = 'BUTTON RELEASE';
    btn_trigger_off.onclick = handle_click;


    // handler for the send button
    function handle_effect_change(event) {
        var parts = event.target.id.split('_');
        var i = Number(parts[1]);

        effect_change_in_section(i, event.target.id);
    }


    function effect_change_in_section(i, ui_id) {

      

        // make sure broadcast does not stop
        clearTimeout(self.timeout_broadcast_stop);
        self.timeout_broadcast_stop = null;
        
        var effect      = self.ui_ref.effects[i].value.toLowerCase();
        var speed       = self.ui_ref.speeds[i].value.toLowerCase();
        var probability = self.ui_ref.probabilities[i].value.toLowerCase();
        var group       = self.ui_ref.groups[i].value.toLowerCase();
        var commando    = self.ui_ref.commando[i].value.toLowerCase();
        var arg1        = self.ui_ref.arg1[i].value.toLowerCase();
        var arg2        = self.ui_ref.arg2[i].value.toLowerCase();
        var arg3        = self.ui_ref.arg3[i].value.toLowerCase();
        var confirm     = self.ui_ref.confirm[i].value.toLowerCase();

        var color  = self.ui_ref.colors[i].value.split(',').map(Number);


        self.config.cues[i].color       = color;
        self.config.cues[i].effect      = effect;
        self.config.cues[i].speed       = speed;
        self.config.cues[i].probability = probability;
        self.config.cues[i].group       = group;
        self.config.cues[i].commando    = commando;
        self.config.cues[i].arg1        = arg1;
        self.config.cues[i].arg2        = arg2;
        self.config.cues[i].arg3        = arg3;


        // hide all
        hide(self.ui_ref.speeds[i]);
        hide(self.ui_ref.commando[i]);
        hide(self.ui_ref.arg1[i]);
        hide(self.ui_ref.arg2[i]);
        hide(self.ui_ref.arg3[i]);
        hide(self.ui_ref.confirm[i]);


        // set all section to default color
        if (self.ready) {

            for (var k in sections) {
                sections[k].style.backgroundColor = WAND_DEFAULT_CUE_COLOR;
                sections[k].style.opacity = WAND_DEFAULT_CUE_OPACITY;
            }
            var selected =  by_id('section_'+i);
            selected.style.backgroundColor = WAND_SELECTED_CUE_COLOR;
            selected.style.opacity = WAND_SELECTED_CUE_OPACITY;
        }


        // show only what is needed
        if (effect=='transmitter') {

        } 
        else if (effect=='commando') {

            show(self.ui_ref.commando[i]);
            show(self.ui_ref.arg1[i]);
            show(self.ui_ref.arg2[i]);
            show(self.ui_ref.arg3[i]);
            show(self.ui_ref.confirm[i]);

            // need to rebuild the menu for the arguments, 
            // depending on the command

            if (ui_id && ui_id.match('commando')) {
                // delete all items
                var x = self.ui_ref.arg1[i];
                var y = self.ui_ref.arg2[i];
                var z = self.ui_ref.arg3[i];
                while (x.length > 0) { x.remove(x.length-1); }
                while (y.length > 0) { y.remove(y.length-1); }
                while (z.length > 0) { z.remove(z.length-1); }

                // rebuild
                self.menus.arg1 = DMX_PRO2_COMMANDO_ARGS[commando][0];
                self.menus.arg2 = DMX_PRO2_COMMANDO_ARGS[commando][1];
                self.menus.arg3 = DMX_PRO2_COMMANDO_ARGS[commando][2];
                klik_ui_populate_menu(x, self.menus.arg1);
                klik_ui_populate_menu(y, self.menus.arg2);
                klik_ui_populate_menu(z, self.menus.arg3);

                // get new values
                arg1 = x.value;
                arg2 = y.value;
                arg3 = z.value;

                // make sure we reset the confirmation to standby
                self.ui_ref.confirm[i].value = 'standby';
            }

            wand.set_commando(group, color, commando, arg1, arg2, arg3, confirm);
        }

        else if ( effect=='pro' || effect=='video' || effect=='express') {

            wand.set_effect(group, color, effect, speed, probability); 
        }

        else {
            show(self.ui_ref.speeds[i]);

            wand.set_effect(group, color, effect, speed, probability ); 
        }

        // send the command for 500ms and then stop

        if (self.ready) {
            self.timeout_broadcast_stop = setTimeout(function() {
                klik_stop_broadcast();

                var selected =  by_id('section_'+i);
                selected.style.backgroundColor = WAND_SENT_CUE_COLOR;
                selected.style.opacity = WAND_SENT_CUE_OPACITY;

            }, 500);

            tech.save_config(self.config);

            self.cout('config',':', 'saved', self.config.cues.length, 'commands');
        }
    }

    // creating, styling and binding the buttons
    var style_base = 'font-family:courier; width:140px; height:55; margin:1px; font-size:18px; vertical-align:top; text-align:left; background-color:#333;';
    var style_input = style_base ;// + 'margin-right:2px; margin-bottom:2px;';
    var style_buttons = style_base + 'display:inline-block;';

    document.body.style.backgroundColor = '#000';

    for (var i in sections) {

        sections[i].style.backgroundColor = WAND_DEFAULT_CUE_COLOR;
        sections[i].style.opacity = WAND_DEFAULT_CUE_OPACITY;
        sections[i].style.padding = '10px';
        sections[i].style.border = 'none';
        sections[i].style.outline = '1px solid #111';

        var items_ui = {};
        for (var k in WAND_UI_ORDER) {
            items_ui[k] = add_node(sections[i], WAND_UI_ORDER[k], { _s:style_input, id:'section_'+i+'_'+k });
            if (WAND_UI_ORDER[k]=='select') {
                items_ui[k].oninput = handle_effect_change;
                klik_ui_populate_menu(items_ui[k], self.menus[k]);
            }

            if (k=='probabilities') {
                items_ui[k].style.width = 58;
            }

            if (k=='commando') {
                items_ui[k].style.width = 320;
            }

            self.ui_ref[k].push(items_ui[k]);
        }


        var btn_go = add_node(sections[i], 'button', {_s:style_buttons +'font-size:20px;', _i:'btn_'+i+'_0', _l:'GO'});
        btn_go.onmousedown = function(event) {
            handle_effect_change(event);
        }

        btn_go.style.width = '178px';
    }


    // for the demo we create one section for 
    // each possible effect value
    // ---
    var i=0;
    for (var fx in self.menus.effects) {
        if (i<WAND_UI_MAX_SECTIONS) {
            const section_id = i;

            // CP.RGB2HEX(klik_colors_rgb_by_index[i])
            self.ui_ref.pickers[i] = klik_ui_colorpicker(self.ui_ref.colors[i], '#000', true, // hidden input
               
                // callback on change
                function(hex_color) {
                    effect_change_in_section(section_id);
                }
            );
        }

        i++;
    }


    // wand addressing
    // ---

    function handle_address_change(event) {
        var addr = Number(self.wand_address_msb.value) * 16 +  Number(self.wand_address_lsb.value);
        self.config.dmx_address = addr;
        self.cout('dmx', ':', 'address', self.config.dmx_address, '- switches:['+self.wand_address_msb.value+','+self.wand_address_lsb.value+']' );
        tech.save_config(self.config);
    }

    var wand_address_style = btn_style+'width:75; padding-left:35; ';
    this.wand_address_msb = add_node(document.body, 'select', { _i:'msb', _s:wand_address_style });
    this.wand_address_lsb = add_node(document.body, 'select', { _i:'lsb', _s:wand_address_style });

    this.wand_address_msb.oninput = handle_address_change;
    this.wand_address_lsb.oninput = handle_address_change;

    var knob_values = {};
    for (var i=0; i<16; i++) {
        knob_values[i.toString(16).toUpperCase()] = i;
    }

    klik_ui_populate_menu(this.wand_address_msb, knob_values, false ); // false = will not use key as value but will 
    klik_ui_populate_menu(this.wand_address_lsb, knob_values, false ); // use the decimals provided by knob_values


    function toggle_opacity(btn) {
        btn.style.opacity = 0.5;
        setTimeout(function(){
            btn.style.opacity = 1.0;
        }, 100);
    }


    // wand auto test
    // ---

    var test_interval_id;
    var test_interval_ms = 150;
    var test_min = 1;
    var test_max = 31;
    var test_index = 1;
    var test_color_mode = 'rgb';
    var test_color_old = [0,0,0];
    var test_hue = 0;
    var test_hue_shift = 360 / 31;
   
    function handle_test(event) {
        toggle_opacity(this);

        if (self.last_packet.length==0) {
            self.cout('error', ':', 'please first select a cue');
            return;
        }

        if (event.target.innerHTML==BTN_TEST_LABEL_START) {
            self.cout('test', ':', 'started');

            show(btn_rainbow);

            test_interval_id = setInterval(function() {

                // take the last packet send, 
                // replace the group by consecutive groups
                // except broadcast

                if (test_color_mode=='rainbow') {
                    var rgb = hsv_to_rgb(test_hue, 100, 100);

                    self.last_packet[DMX_PRO2_OFFSET_RED]   = rgb[0];
                    self.last_packet[DMX_PRO2_OFFSET_GREEN] = rgb[1];
                    self.last_packet[DMX_PRO2_OFFSET_BLUE]  = rgb[2];

                    test_hue += test_hue_shift;
                    test_hue %= 360;
                }

                self.last_packet[DMX_PRO2_OFFSET_GROUP] = DMX_PRO2_GROUPS['group '+test_index];

                test_index++;
                if (test_index > test_max) {
                    test_index = test_min;
                }


                self.send_dmx(self.last_packet);

                self.cout('pro2', ':', self.last_packet);

            }, test_interval_ms);


            event.target.innerHTML = BTN_TEST_LABEL_STOP;
        }
        else {
            self.cout('test', ':', 'stopped');

            hide(btn_rainbow);

            clearInterval(test_interval_id);
            test_interval_id = null;
            event.target.innerHTML = BTN_TEST_LABEL_START;

            klik_stop_broadcast();
        }
    }


    function handle_rainbow(event) {
        toggle_opacity(this);
        if (self.last_packet.length==0) {
            self.cout('error', ':', 'please first select a cue');
            return;
        }

        if (event.target.innerHTML=='USING RAINBOW') {
            
            // reset to old RGB
            self.last_packet[DMX_PRO2_OFFSET_RED]   = test_color_old[0];
            self.last_packet[DMX_PRO2_OFFSET_GREEN] = test_color_old[1];
            self.last_packet[DMX_PRO2_OFFSET_BLUE]  = test_color_old[2];

            event.target.innerHTML = 'USING RGB';
            test_color_mode = 'rgb';
        }
        else {
            // save old RGB
            test_color_old = [ 
                self.last_packet[DMX_PRO2_OFFSET_RED],
                self.last_packet[DMX_PRO2_OFFSET_GREEN], 
                self.last_packet[DMX_PRO2_OFFSET_BLUE] ];

            event.target.innerHTML = 'USING RAINBOW';
            test_color_mode = 'rainbow';
        }
    }


    var btn_empty   = add_node(document.body, 'button', { _s:btn_style +'opacity:0;' });
    var btn_test    = add_node(document.body, 'button', { _s:btn_style });
    var btn_rainbow = add_node(document.body, 'button', { _s:btn_style });

    btn_test.innerHTML = BTN_TEST_LABEL_START;
    btn_test.onclick = handle_test;

    btn_rainbow.innerHTML = 'USING RGB';
    btn_rainbow.onclick = handle_rainbow;
    hide(btn_rainbow);


    // once all ui has been created we can updated it
    // with the saved config
    // ---
    self.set_ui(self.config);
}


// clear all bytes for this wand
WandController.prototype.clear = function() {
    this.cout('universe', ':', 'clear');
    this.send_dmx(DMX_PRO2_EMPTY_PACKET());
    setTimeout(klik_stop_broadcast, 500);

    // make sure no cue is selected
    // so the user knows nothing is store on the wand
    for (var i in sections) {
        sections[i].style.backgroundColor = WAND_DEFAULT_CUE_COLOR;
        sections[i].style.opacity = WAND_DEFAULT_CUE_OPACITY;
    }
}


// save last packet this wand sent
WandController.prototype.save = function() {
    this.cout('universe', ':', 'save');
    this.save_packet(this.last_packet);
    setTimeout(klik_stop_broadcast, 500);
}


// trigger IR without button press, 0=stop, 255=25 seconds
WandController.prototype.trigger = function(value=1) {
    this.cout('trigger', ':', value/10.0, 'sec');
    klik_send_payload([this.CODE_TRIGGER, value], 'DMX');
    setTimeout(klik_stop_broadcast, 500); 
}


// save provided packet
WandController.prototype.save_packet = function(packet) {
    this.send_packet(this.CODE_SAVE, packet);
}


// send dmx 
WandController.prototype.send_dmx = function(packet) {
    this.send_packet(this.CODE_DMX, packet);
}


// send packet of any lenght, will segment 
// into smaller packets if needed
WandController.prototype.send_packet = function(code, packet) {
    // - handle sending packets that are too long for iOS
    // - iOS limit is 16 bytes
    // - and we have 2 bytes of overhead (command and address)
    // - that leave us with 14 bytes of data for each payload

    this.last_packet = packet;

    const MAX_SIZE = 14; 

    var payloads = [];
    var num_payloads = Math.ceil(packet.length / MAX_SIZE);

    for (var n=0; n<num_payloads; n++) {
        const offset = (MAX_SIZE*n)
        const address = this.config.dmx_address + offset;
        payloads[n] = [code, address];
        for (var i=offset; i<offset+MAX_SIZE; i++) {
            if (packet[i]!=undefined) {
                payloads[n].push(packet[i]);
            }
            else {
                // payloads[n].push(0);
                continue;
            }
        } 
    }

    var self = this;
    for (var n=0; n<payloads.length; n++) {
        const i = n;
        setTimeout(function() {
            // self.cout('packet['+i+']', ':', self.config.localname, payloads[i]);
            klik_send_payload(payloads[i], self.config.localname); 
        }, i * 250);
    }
}


// config

WandController.prototype.load_config = function(data) {
    this.config = data;
    this.init();
}


WandController.prototype.default_config = function() {
    this.config = { 
        dmx_address : 1,
        localname : 'DMX',
        encrypted : false, // no encrytion yet
        cues : []
    
    };

    var cues = [];
    var color_index = 0;
    var i = 0;
    for (var fx in this.menus.effects) {
        const section_fx = fx;
        if (section_fx!='blackout') {
            if (i<WAND_UI_MAX_SECTIONS) {
                cues.push( {
                    color       : klik_colors_rgb_by_index[color_index],
                    effect      : section_fx,
                    speed       : 'fast',
                    probability : '100',
                    group       : 'broadcast',
                    commando    : 'set_layer_active',
                    arg1        : '-',
                    arg2        : 'layer 0',
                    arg3        : 'visible',
                })
                color_index++;
            }
            i++;
        }
    }

    this.config.cues = cues;

    tech.save_config(this.config);

    this.init();
}


WandController.prototype.set_ui = function(conf) {
    klik_navigation.style.paddingBottom = 0;

    var cues = conf.cues;
    for (i in cues) {
        this.ui_ref.pickers[i].set('rgb('+cues[i].color+')');
        this.ui_ref.effects[i].value         = cues[i].effect;
        this.ui_ref.speeds[i].value          = cues[i].speed;
        this.ui_ref.probabilities[i].value   = cues[i].probability;
        this.ui_ref.groups[i].value          = cues[i].group;
        this.ui_ref.commando[i].value        = cues[i].commando;
        this.ui_ref.arg1[i].value            = cues[i].arg1;
        this.ui_ref.arg2[i].value            = cues[i].arg2;
        this.ui_ref.arg3[i].value            = cues[i].arg3;
    }

    this.wand_address_msb.value = (conf.dmx_address >> 4) ;
    this.wand_address_lsb.value = (conf.dmx_address & 15) ;
}
        


