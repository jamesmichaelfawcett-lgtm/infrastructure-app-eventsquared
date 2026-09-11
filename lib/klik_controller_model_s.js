// by JSR <jsr@pixmob.com>

// this is broken

var params = {
    localname   : 'BRO',
    group       : 0,    // group : 0..31
    note        : 0x16, // note  : 0x16 to 0x72 : (0..1) * (0x72-0x16) + 0x16 ) ]; 
    animation   : 0,
    color       : 0,    // color : 0..15
}

ModelSController = function(div) {

    this.send = function(data) {

        for (p in data) {
            params[p] = data[p];
        }
        cout(JSON.stringify(params));

        var packet = [ 0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00 ];

        var group       = params.group; 
        var note        = params.note;
        var animation   = params.animation; 
        var color       = params.color;

        // // 0x61, group, note, effect
        // packet[0] = 0x61;
        // packet[1] = group; 
        // packet[2] = note;

        // var effect = (animation<<4) + (color&0x0F) ; // the effect = animation + color
        // packet[3] = effect;


         // -the pixel executes EDEN effects like
         //  EDEN rgb + Audio          (0xE0, mode, byte0-byte2, 0x2F, note, duration)
         //  EDEN rgb_extended + Audio (0xEE, mode, byte0-byte5, 0x2F, note, duration)
         // -the pixel executes ModelS effects like
         //  One group                 (0x61, group, note, effect)
         // -the pixels switches between those two types of effects
         // -the default color can be set in EDEN effects and persist in ModelS effects

        var flagImpact = 0;
        var flagColorwheel = 0;
        var flagAdvanced = 0;
        var flagControl = 0;
        var flagChange = 0;
        var flagPriority = 0;

        // todo : fix eden rgb
        packet[0] = 0xE0;
        packet[1] = flagImpact | (flagColorwheel<<1) | (flagAdvanced<<2)| (flagControl<<3) | (flagChange<<4) | (flagPriority<<5) ;
        packet[2] = 255; // g
        packet[3] = 0; // r
        packet[4] = 0; // b

        // play note
        packet[5] = 0x2f;
        packet[6] = params.note; // note
        packet[7] = 0; // duration : 255 = 5 seconds

        console.log(packet);

        klik_send({
            localname : params.localname,
            payload : packet,
            state : { 
                broadcast : 1
            },
        }); 

        setTimeout(function() {
            klik_send({
                state : { 
                    broadcast : 0
                }
            });
        }, 100);
    }


    this.modules = {
        targets       : [ 1, 'right', klik_controller_localnames       ],
        groups        : [ 1, 'right', klik_controller_model_s_groups   ],
        notes         : [ 1, 'left' , klik_controller_model_s_notes    ],
        animation     : [ 1, 'left' , klik_controller_model_s_animation],
        colors        : [ 1, 'left' , klik_controller_model_s_colors   ],
    }
    
    klik_controller_init(this, div);
};

ModelSController.prototype.set_group       = function(value) { this.send({'group'  : +value }); }
ModelSController.prototype.set_note        = function(value) { this.send({'note'  : +value }); }
ModelSController.prototype.set_animation   = function(value) { this.send({'animation' : +value }); }
ModelSController.prototype.set_color       = function(value) { this.send({'color'  : +value }); }


var last_rgb = [0,0,0];



ModelSController.prototype.set_localname  = function(value) { 
    this.send({'localname':value}); 
}


//  0x16 to 0x72
const klik_controller_model_s_notes = {
    'note_1'      : ['set_note', 0x16 ],
    'note_2'      : ['set_note', 0x16+8 ],
    'note_3'      : ['set_note', 0x16+16 ],
    'note_4'      : ['set_note', 0x16+24 ],
    'note_5'      : ['set_note', 0x16+32 ],
    'note_6'      : ['set_note', 0x16+40 ],
    'note_7'      : ['set_note', 0x16+48 ],
    'note_8'      : ['set_note', 0x16+56 ],
}

const klik_controller_model_s_animation = {
    'animation_1'   : ['set_animation', 0 ],
    'animation_2'   : ['set_animation', 1 ],
    'animation_3'   : ['set_animation', 2 ],
    'animation_4'   : ['set_animation', 3 ],
    'animation_5'   : ['set_animation', 4 ],
    'animation_6'   : ['set_animation', 5 ],
    'animation_7'   : ['set_animation', 6 ],
    'animation_8'   : ['set_animation', 7 ],
}

const klik_controller_model_s_colors = {
    'color_1'      : ['set_color', 0 ],
    'color_2'      : ['set_color', 1 ],
    'color_3'      : ['set_color', 2 ],
    'color_4'      : ['set_color', 3 ],
    'color_5'      : ['set_color', 4 ],
    'color_6'      : ['set_color', 5 ],
    'color_7'      : ['set_color', 6 ],
    'color_8'      : ['set_color', 7 ],
}


const klik_controller_model_s_groups = {
    'all (0)'       : ['set_group', 0 ],
    'group 1'       : ['set_group', 1 ],
    'group 2'       : ['set_group', 2 ],
    'group 3'       : ['set_group', 3 ],
    'group 4'       : ['set_group', 4 ],
    'group 5'       : ['set_group', 5 ],
    'group 6'       : ['set_group', 6 ],
    'group 7'       : ['set_group', 7 ],
    'group 8'       : ['set_group', 8 ],
    'group 9'       : ['set_group', 9 ],
    'group 10'      : ['set_group', 10 ],
    'group 11'      : ['set_group', 11 ],
    'group 12'      : ['set_group', 12 ],
    'group 13'      : ['set_group', 13 ],
    'group 14'      : ['set_group', 14 ],
    'group 15'      : ['set_group', 15 ],
    'group 16'      : ['set_group', 16 ],
    'group 17'      : ['set_group', 17 ],
    'group 18'      : ['set_group', 18 ],
    'group 19'      : ['set_group', 19 ],
    'group 20'      : ['set_group', 20 ],
    'group 21'      : ['set_group', 21 ],
    'group 22'      : ['set_group', 22 ],
    'group 23'      : ['set_group', 23 ],
    'group 24'      : ['set_group', 24 ],
    'group 25'      : ['set_group', 25 ],
    'group 26'      : ['set_group', 26 ],
    'group 27'      : ['set_group', 27 ],
    'group 28'      : ['set_group', 28 ],
    'group 29'      : ['set_group', 29 ],
    'group 30'      : ['set_group', 30 ],
    'group 31'      : ['set_group', 31 ],
}


/*
This is the command implemented to control ONE group (cmd = 0x61)

animation = effect<<4 + color&0x0f


0x61, Group, Note, Effect

Group = 0..31

Note = 0..127

Effect byte is divided in two parts:
      Effect_ID(bit4..bit7), ColorWheelIndex(bit0..bit3)

-(The ColorWheelIndex applies to these 8 effects)

Effect    = 00h  (move color SPEED_FAST, right)
            00h-0fh (move any color at index = 0..15)
Effect    = 10h  (move color SPEED_MEDIUM, right)
            10h-1fh (move any color at index = 0..15)
Effect    = 20h  (move color SPEED_SLOW, right)
            20h-2fh (move any color at index = 0..15)
Effect    = 30h  (crossfade to color, right)
            30h-3fh (crossfade to any color at index = 0..15)

Effect    = 40h  (move color SPEED_FAST, left)
            40h-4fh (move any color at index = 0..15)
Effect    = 50h  (move color SPEED_MEDIUM, left)
            50h-5fh (move any color at index = 0..15)
Effect    = 60h  (move color SPEED_SLOW, left)
            60h-6fh (move any color at index = 0..15)
Effect    = 70h  (crossfade to color, left)
            70h-7fh (crossfade to any color at index = 0..15)

-(The ColorWheelIndex doesn't apply to these 7 effects)
 
 Effect    = 80h  (splash random colors SPEED_FAST)
 Effect    = 90h  (splash random colors SPEED_MEDIUM)
 Effect    = A0h  (splash random colors SPEED_SLOW)
 
 Effect    = B0h  (shift full wristband SPEED_MEDIUM, right)
 Effect    = C0h  (shift full wristband SPEED_SLOW, right)
 
 Effect    = D0h  (shift full wristband SPEED_MEDIUM, left)
 Effect    = E0h  (shift full wristband SPEED_SLOW, left)

 Effect    = F0h  = nothing

 SPEED_FAST   = 50ms
 SPEED_MEDIUM = 100ms
 SPEED_SLOW   = 200ms
 
 
 More notes:
 -the pixel executes EDEN effects like
  EDEN rgb + Audio          (0xE0, mode, byte0-byte2, 0x2F, note, duration)
  EDEN rgb_extended + Audio (0xEE, mode, byte0-byte5, 0x2F, note, duration)
 -the pixel executes ModelS effects like
  One group                 (0x61, group, note, effect)
 -the pixels switches between those two types of effects
 -the default color can be set in EDEN effects and persist in ModelS effects

*/
