// by JSR <jsr@pixmob.com


Utils = {};

Utils.is_identical = function(item_1, item_2) {
    if (typeof(item_1)=='object') {
        return item_1.equals(item_2);
    }
    else {
        return (item_1==item_2)
    }
}


Utils.is_different = function(item_1, item_2) {
    return ! Utils.is_identical(item_1, item_2);
}


Utils.utils_get_item = function(array, key, value) {
    for (var i in array) {
        if (array[i][key] == value) {
            return array[i];
        }
    }
    return null;
}




Utils.get_map = function(map_id) {
    return Utils.utils_get_item(maps, 'id', map_id);
}


Utils.get_tag = function(tag_id) {
    return Utils.utils_get_item(items.tags, 'id', tag_id);
}


// return a range of number, from start to end (inclusive)
Utils.range = function(start, end, prepend=null) {
    var arr = [];
    for (var i=0; i<=(end-start); ++i) {
        arr[i] = start+i;
        if (prepend) {
            arr[i] = prepend + arr[i];
        }
    }
    return arr;
} 


Utils.rgb_palette = function(levels=1) {
    var palette = [];
    for (var k in klik_colors_rgb_by_name) {
        var rgb = klik_colors_rgb_by_name[k];
        palette.push(rgb);

        var divisor = 2;
        for (var i=1; i<levels; i++) {
            var scaled_rgb = Utils.floor(Utils.multiply(rgb, 1/(divisor)))
            palette.push(scaled_rgb)
            divisor *= 2;
        }
    }
    return palette;
} 


Utils.rgb_palette_with_swatch = function(levels=1) {
    var palette = Utils.rgb_palette(levels);
    // console.log(palette);
    return palette;
} 



Utils.add = function(a,b) {
    var arr = [];
    for(var i=0; i<a.length; i++) {
        arr.push(a[i]+b);
    }
    return arr;
}


Utils.substract = function(a,b) {
    var arr = [];
    for(var i=0; i<a.length; i++) {
        arr.push(a[i]-b);
    }
    return arr;
}


Utils.multiply = function(a,b) {
    var arr = [];
    for(var i=0; i<a.length; i++) {
        arr.push(a[i]*b);
    }
    return arr;
}


Utils.floor = function(a) {
    var arr = [];
    for(var i=0; i<a.length; i++) {
        arr.push(Math.floor(a[i]));
    }
    return arr;
}


Utils.generate_uid = function(){
    var hex = "0123456789ABCDEF";
    var id = "";
    for (var i = 0; i < 16; i++) {
        id+=hex.charAt(Math.round(Math.random() * 15));
    }
    return id;
}


Utils.generate_fake_mac = function(){
    var hexDigits = "0123456789ABCDEF";
    var macAddress = "";
    for (var i = 0; i < 4; i++) {
        macAddress+=hexDigits.charAt(Math.round(Math.random() * 15));
        macAddress+=hexDigits.charAt(Math.round(Math.random() * 15));
        if (i != 3) macAddress += ":";
    }
    return macAddress;
}


Utils.generate_random_zone_id = function(){
    var hex = "0123456789ABCDEF";
    var id = "";
    for (var i = 0; i < 16; i++) {
        id+=hex.charAt(Math.round(Math.random() * 15));
    }
    return id;
}


Utils.get_item_by_mac = function (array, mac) {
    for (var i=0; i<array.length; i++) {
        if (array[i] && array[i].mac === mac) {
            return array[i];
        }
    }
    return null;
}


Utils.get_item_by_id = function(array, id) {
    for (var i=0; i<array.length; i++) {
        if (array[i] && array[i].id === id) {
            return array[i];
        }
    }
    return null;
}


Utils.get_item_by_name = function(array, name) {
    for (var i=0; i<array.length; i++) {
        if (array[i] && array[i].name === name) {
            return array[i];
        }
    }
    return null;
}


Utils.join = function(obj, obj_to_join) {
    for (var i in obj_to_join) {
        if (obj_to_join.hasOwnProperty(i)) {
           obj[i] = obj_to_join[i];
        }
    }
}


Utils.clone = function(obj) {
    var copy;

    // handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) {
        return obj;
    }

    // handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = Utils.clone(obj[i]);
        }
        return copy;
    }

    // handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = Utils.clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}
