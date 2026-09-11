// by JSR <jsr@pixmob.com


BleController = function(div, websocket_send_function) {

    this.send = function(data) {
        websocket_send_function(data);
        if (data.rgb) {
            $('#klik_controller_rgb_panel').css('background-color', data.rgb);
        }
    }

    this.modules = {
        targets       : [ 1, 'left' , klik_controller_localnames         ],
        tests         : [ 1, 'left' , klik_controller_pro_tests          ], 
        colors        : [ 1, 'left' , klik_controller_pro_colors         ],
        groups        : [ 1, 'left' , klik_controller_pro_groups         ],
        
        effects       : [ 1, 'right', klik_controller_pro_effects        ],
        speeds        : [ 1, 'right', klik_controller_pro_speeds         ],
        probabilities : [ 1, 'right', klik_controller_pro_probabilities  ],
        triggers      : [ 1, 'right', klik_controller_pro_triggers       ],
        iterations    : [ 1, 'right', klik_controller_pro_iterations     ],
    }
    
    klik_controller_init(this, div);
};

BleController.prototype.set_effect      = function(value) { this.send({'effect'        : +value }); }
BleController.prototype.set_speed       = function(value) { this.send({'speed'         : +value }); }
BleController.prototype.set_trigger     = function(value) { this.send({'trigger'       : +value }); }
BleController.prototype.set_group       = function(value) { this.send({'group'         : +value }); }
BleController.prototype.set_probability = function(value) { this.send({'probability'   : +value }); }
BleController.prototype.set_iterate     = function(value) { this.send({'iterate'       : +value }); }
BleController.prototype.set_iterations  = function(value) { this.send({'iterations'    : +value }); }
BleController.prototype.set_test        = function(value) { this.send({'command'       :  value }); }


var last_rgb = [0,0,0];

BleController.prototype.set_rgb = function(value) { 
    this.send({'rgb':value}); 
    last_rgb = value;
}

BleController.prototype.set_localname  = function(value) { 
    this.send({'localname':value}); 
    this.send({'rgb':last_rgb});
}

const klik_controller_ble_tests = {
    'off'           : ['set_test', 'test_off' ],
    'rgb'           : ['set_test', 'test_rgb' ],
    'ramp'          : ['set_test', 'test_ramp' ],
    'ramp fast'     : ['set_test', 'test_ramp_fast' ],
    'strobe'        : ['set_test', 'test_strobe' ]
}

const klik_controller_ble_colors = {
    'red'           : ['set_rgb', [255,0,0] ],
    'green'         : ['set_rgb', [0,255,0] ],
    'blue'          : ['set_rgb', [0,0,255] ],
    'white'         : ['set_rgb', [255,255,255] ],
    'magenta'       : ['set_rgb', [255,0,255] ],
    'yellow'        : ['set_rgb', [255,255,0] ],
    'cyan'          : ['set_rgb', [0,255,255] ],
    'black'         : ['set_rgb', [0,0,0] ],
}

const klik_controller_ble_effects = {
    '0 : blackout'      : ['set_effect', 0 ],
    '1 : solid'         : ['set_effect', 1 ],
    '2 : strobe'        : ['set_effect', 2 ],
    '3 : fade'          : ['set_effect', 3 ],
    '4 : pulse'         : ['set_effect', 4 ],
    '5 : pulse close'   : ['set_effect', 5 ],
    '6 : pulse open'    : ['set_effect', 6 ],
    '7 : background'    : ['set_effect', 7 ],
}

const klik_controller_ble_iterations = {
    'iterate once'  : ['set_iterate', 0 ],
    'iterate n'     : ['set_iterate', 1 ],

    'set n = 1'     : ['set_iterations', 1],
    'set n = 4'     : ['set_iterations', 4],
    'set n = 8'     : ['set_iterations', 8],
    'set n = 16'    : ['set_iterations', 16],
}

const klik_controller_ble_groups = {
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

const klik_controller_ble_speeds = {
    '0 : fastest'       : ['set_speed', 0 ],
    '1 : fast'          : ['set_speed', 1 ],
    '2 : medium'        : ['set_speed', 2 ],
    '3 : slow'          : ['set_speed', 3 ],
    '4 : slowest'       : ['set_speed', 4 ],
}

const klik_controller_ble_probabilities = {
    '0 : 100 %'         : ['set_probability', 0 ],
    '1 : 85 %'          : ['set_probability', 1 ],
    '2 : 65 %'          : ['set_probability', 2 ],
    '3 : 50 %'          : ['set_probability', 3 ],
    '4 : 30 %'          : ['set_probability', 4 ],
    '5 : 15 %'          : ['set_probability', 5 ],
    '6 : 10 %'          : ['set_probability', 6 ],
    '7 : 5 %'           : ['set_probability', 7 ],
}

const klik_controller_ble_triggers = {
    '0 : always'        : ['set_trigger', 0 ],
    '1 : on impact'     : ['set_trigger', 1 ],
    '2 : on change'     : ['set_trigger', 2 ],
    '3 : on impact + on change' : ['set_trigger', 3 ],
}
