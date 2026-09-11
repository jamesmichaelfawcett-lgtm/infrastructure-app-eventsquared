// by JSR <jsr@pixmob.com>


function klik_sort_devices_by_rssi(data, direction='up') {
     // create array from dict
    var arr = [];
    for (var key in data) {
        arr.push([key, data[key]]);
    }

    // sort
    arr.sort(function(a, b) {
        if (direction=='up'){
            return a[1].rssi - b[1].rssi;
        }
        if (direction=='down'){
            return b[1].rssi - a[1].rssi ;
        }
    });

    var result = [];
    for (var i in arr) {  
        result.push({ id:arr[i][0], rssi:arr[i][1].rssi });
    }
    return result;
}


function klik_sort_tags_by_occurance(data, direction='up') {
    // first, create array from dict
    
    // dict :
    // { TAGT013:5, TAGT014:5, TAGT019:2 }

    // array :
    // [ ['TAGT013', 5], ['TAGT014', 5], ['TAGT019', 2]]

    var arr = [];
    for (var key in data) {
        arr.push([key, data[key]]);
    }

    // sort
    arr.sort(function(a, b) {
        if (direction=='up') {
            return a[1] - b[1];
        }
        if (direction=='down') {
            return b[1] - a[1];
        }
    });
    
    var total = 0;
    for (var i in arr) {
        total += arr[i][1];
    }
     
    var result = [];
    for (var i in arr) {  
        result.push({ id:arr[i][0], count:arr[i][1], percent:Math.round(1000*(arr[i][1]/total))/10.});
    }
    return result;
}


function value_from_object(obj, multikeys) {
    var value = 0 ;
    try {
        value = obj[multikeys[0]];
        for (var i=1; i<multikeys.length; i++) {
            value = value[multikeys[i]];
        } 
    }
    catch(e) {
        value = 0;
        // console.log('START ----------');
        // console.log(obj);
        // console.log('END ----------');
    }
    
    // if (multikeys.length>1) {
    //     console.log(multikeys, value);
    // }

    if (!value) {
        value = 0;
    }
    return value;     
}
   

// functions to sort up or down pretty much anything
// handles simple keys, and multilevels

function klik_sort_anything(key) {
    var parts = key.split('.');

    return {

        up : function(a,b) {
            var a_val = value_from_object(a, parts);
            var b_val = value_from_object(b, parts);
            if (typeof(a_val)=='number') {
                if (a_val < b_val) {
                    return -1;
                }
                if (a_val > b_val) {
                    return 1;
                }
            }
            else {
                if (a_val.toString().toLowerCase() < 
                    b_val.toString().toLowerCase()) { 
                    return -1; 
                }
                if (a_val.toString().toLowerCase() > 
                    b_val.toString().toLowerCase()) { 
                    return  1; 
                } 
            }
            return 0;
        },

        down : function(a,b) {
            var a_val = value_from_object(a, parts);
            var b_val = value_from_object(b, parts);
            if (typeof(a_val)=='number') {
                if (a_val < b_val) {
                    return 1;
                }
                if (a_val > b_val) {
                    return -1;
                }
            }
            else {
                if (a_val.toString().toLowerCase() < 
                    b_val.toString().toLowerCase()) {
                    return 1;
                }
                if (a_val.toString().toLowerCase() > 
                    b_val.toString().toLowerCase()) { 
                    return -1; 
                }
            }
            return 0;
        }
    }
}


// sorting array by item.key
var klik_sort = {
    id              : klik_sort_anything('id'), 
    x               : klik_sort_anything('x'), 
    y               : klik_sort_anything('y'), 
    name            : klik_sort_anything('name'), 
    last_name       : klik_sort_anything('last_name'), 
    display_name    : klik_sort_anything('display_name'),
    rssi            : klik_sort_anything('rssi'), 
    time_updated    : klik_sort_anything('time_updated'),
}
