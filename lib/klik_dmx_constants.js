// by JSR <jsr@pixmob.com>



const DMX_PRO2_OFFSET_SIGNAL        = 0;
const DMX_PRO2_OFFSET_EFFECT        = 1;
const DMX_PRO2_OFFSET_SPEED         = 2;
const DMX_PRO2_OFFSET_TRIGGER       = 3;
const DMX_PRO2_OFFSET_RED           = 4;
const DMX_PRO2_OFFSET_GREEN         = 5;
const DMX_PRO2_OFFSET_BLUE          = 6;
const DMX_PRO2_OFFSET_PROBABILITY   = 7;
const DMX_PRO2_OFFSET_GROUP         = 8;
const DMX_PRO2_OFFSET_COLOR_MIX     = 9;
const DMX_PRO2_OFFSET_COLOR_INDEX_A = 10;
const DMX_PRO2_OFFSET_COLOR_INDEX_B = 11;
const DMX_PRO2_OFFSET_ITERATE       = 12;
const DMX_PRO2_OFFSET_FADE_IN       = 13;
const DMX_PRO2_OFFSET_SUSTAIN       = 14;
const DMX_PRO2_OFFSET_FADE_OUT      = 15;
const DMX_PRO2_OFFSET_TRANSMITTER   = 16;
const DMX_PRO2_OFFSET_PIXEL         = 17;
const DMX_PRO2_OFFSET_ARG1          = 18;
const DMX_PRO2_OFFSET_ARG2          = 19;
const DMX_PRO2_OFFSET_ARG3          = 20;
const DMX_PRO2_OFFSET_CONFIRM       = 21;


function DMX_PRO2_EMPTY_PACKET() {
    // 22 bytes of emptyness
    return [
        0,0,0,0,0,0,0,0,0,0,0, 
        0,0,0,0,0,0,0,0,0,0,0
    ]
}


const DMX_PRO2_EFFECTS = {
    'blackout'      :   0,
    'solid'         :  16,
    'strobe'        :  32,
    'fade'          :  48,
    'pulse'         :  64,
    'pulse-close'   :  80,
    'pulse-open'    :  96,
    'background'    : 112,
    'pro'           : 128,
    'video'         : 144,
    'express'       : 160, // ...
    'transmitter'   : 224,
    'commando'      : 240
}


const DMX_PRO2_SPEEDS = {
    'fastest' :   0,
    'fast'    :  32,
    'medium'  :  64,
    'slow'    :  96,
    'slowest' : 128
}


const DMX_PRO2_PROBABILITIES = {
    '100' :   0,
    '85'  :  32,
    '65'  :  64,
    '50'  :  96,
    '30'  : 128,
    '15'  : 160,
    '10'  : 192,
    '5'   : 224
}


const DMX_PRO2_GROUPS = {
    'broadcast' :   0,
    'group 1'   :   8,
    'group 2'   :  16,
    'group 3'   :  24,
    'group 4'   :  32,
    'group 5'   :  40,
    'group 6'   :  48,
    'group 7'   :  56,
    'group 8'   :  64,
    'group 9'   :  72,
    'group 10'  :  80,
    'group 11'  :  88,
    'group 12'  :  96,
    'group 13'  : 104,
    'group 14'  : 112,
    'group 15'  : 120,
    'group 16'  : 128,
    'group 17'  : 136,
    'group 18'  : 144,
    'group 19'  : 152,
    'group 20'  : 160,
    'group 21'  : 168,
    'group 22'  : 176,
    'group 23'  : 184,
    'group 24'  : 192,
    'group 25'  : 200,
    'group 26'  : 208,
    'group 27'  : 216,
    'group 28'  : 224,
    'group 29'  : 232,
    'group 30'  : 240,
    'group 31'  : 248
}


const DMX_PRO2_COMMANDO = {
    // 'set_color_rgb'         :  0,
    'set_layer_active'      :  4,
    'set_layer_group'       :  8, // 'reserved' : 12, 'reserved' : 16,
    // 'get_battery_level'     : 20,
    // 'set_random_scale_rgb'  : 24,
    // 'set_envelop_delay'     : 28,
    // 'set_envelop_iteration' : 32,
    // 'set_tx_timeout'        : 36, // 'activate_automode'  : 40,   // by Ray, but we need to change it
    // 'set_random_scale_all'  : 44,
    // 'get_version_validation': 48, // 'reserved' : 52, 'set_automode_color' : 56,   // by Ray, but we need to change it
    // 'reset_all_params'      : 60,
}


const DMX_PRO2_NOT_APPLICABLE = {
    '-' : 0 
}


const DMX_PRO2_LAYERS = {
    'layer 0' :   0,
    'layer 1' :  32,
    'layer 2' :  64,
    'layer 3' :  96,
    'layer 4' : 128,
    'layer 5' : 160,
    'layer 6' : 192,
    'layer 7' : 224,
}


const DMX_PRO2_FEEDBACK = {
    'hidden' : 0, 
    'visible' : 128 
}


const DMX_PRO2_COLORS = {
    'index 1' : 0,
    'index 2' : 8,
    'index 3' : 16,
    'index 4' : 24,
    'background' : 128,
}


const DMX_PRO2_DEVIATION = {
    'no deviation' : 0,
    'full deviation' : 252,
}


var DMX_PRO2_TARGET_GROUPS = {};
Object.keys(DMX_PRO2_GROUPS).forEach(function(key) {
    if (key!='broadcast') {
        DMX_PRO2_TARGET_GROUPS[key] = DMX_PRO2_GROUPS[key];
    }
}); 


const DMX_PRO2_COMMANDO_ARGS = {
    'set_color_rgb' : {
        0 : DMX_PRO2_COLORS,
        1 : DMX_PRO2_NOT_APPLICABLE,
        2 : DMX_PRO2_FEEDBACK
    },

    'set_layer_active' : {
        0 : DMX_PRO2_NOT_APPLICABLE,
        1 : DMX_PRO2_LAYERS,
        2 : DMX_PRO2_FEEDBACK
    },

    'set_layer_group' : {
        0 : DMX_PRO2_TARGET_GROUPS,
        1 : DMX_PRO2_LAYERS,
        2 : DMX_PRO2_FEEDBACK
    },

    'get_battery_level' : {
        0 : DMX_PRO2_NOT_APPLICABLE,
        1 : DMX_PRO2_NOT_APPLICABLE,
        2 : DMX_PRO2_NOT_APPLICABLE
    },

    'set_random_scale_rgb' : {
        0 : DMX_PRO2_DEVIATION,
        1 : DMX_PRO2_DEVIATION,
        2 : DMX_PRO2_DEVIATION
    }
}

const DMX_PRO2_COMMANDO_CONFIRM = {
    'standby' : 0, 
    'confirm' : 255 
}



// dmx sentinelle
const DMX_SENTINELLE_OFF  = [64,0,0,0,0,0,0];
const DMX_SENTINELLE_ON   = [64,255,255,255,0,0,0];

// dmx tag
const DMX_TAG_OFF         = [64,0,0,0,0,0,0];
const DMX_TAG_ON_BOOKMARK = [64,0,255,255,0,0,0]; // cyan means bookmarking tag
const DMX_TAG_ON_TRACKING = [64,255,0,0,0,0,0];   // red means only tracking

// dmx pixel
const DMX_PIXEL_OFF       = [64,0,0,0,0,0,0];
const DMX_PIXEL_ON        = [64,0,255,255,0,0,0];

