// by JSR <jsr@pixmob.com>

// some numbers, from experience (mainly from AirBnb): 

// lowest operational voltage from Vadim
// 2.400 V

// lowest functional voltage seen @ AirBnb : 
// 2.230 V

// normal voltage provided by the 2 x AA batteries
// 3.000 V

// hub value is : 58.38 volts , and it's a bug in the hub

// values with new batteries @ AirBnb: 
// min : 3.146 V
// max : 3.230 V

var new_batteries = [
    3.158, 3.168, 3.155, 3.151, 3.163, 3.156, 3.212, 3.095,
    3.151, 3.151, 3.173, 3.179, 3.146, 3.158, 3.095, 3.153,
    3.119, 3.210, 3.223, 3.214, 3.215, 3.230, 3.230, 3.218
];

var klik_hub_voltage = 58.38; // this value is reported by the hub, and it's a

var klik_battery_voltage_fresh      = 3.000;
var klik_battery_voltage_min        = 2.300;
var klik_battery_voltage_avg        = klik_average_float(new_batteries);
var klik_battery_voltage_range      = klik_battery_voltage_fresh - klik_battery_voltage_min;
var klik_battery_voltage_warning    = klik_battery_voltage_min + 0.10*klik_battery_voltage_range; // warning under 1%
var klik_battery_voltage_critical   = klik_battery_voltage_min + 0.05*klik_battery_voltage_range; // critical under 5%


function klik_average_float(array) {
    var sum = 0;
    for(var i = 0; i < array.length; i++) {
        sum += parseFloat(array[i]);
    }
    return sum/array.length;
}

function klik_get_battery_percent(voltage) {
    var percent = ( (voltage-klik_battery_voltage_min) / klik_battery_voltage_range) * 100;
    if (percent<0) {
        percent = 0.0;
    }
    return percent;
}

function klik_get_battery_level_formatted(voltage) {
    var percent = klik_get_battery_percent(voltage);
    return voltage.toFixed(2) +'V '+ percent.toFixed(1) +'%';
}

function klik_get_battery_level_bar(voltage) {
    var percent = klik_get_battery_percent(voltage);
    var bars = '';
    for (var i=0; i<10; i++) {
        if (percent>=(i*10)) {
            bars += '|';
        }
    }
    return bars;
}
