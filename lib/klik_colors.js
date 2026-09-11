// by JSR <jsr@pixmob.com

const klik_red      = 'rgba(255,0, 0, 0.7)'; 
const klik_blue     = 'rgba(0,153,255, 0.7)'; // #09f
const klik_orange   = 'rgba(255,153,0, 0.7)'; // #90f
const klik_cyan     = 'rgba(0,255,255, 0.7)'; // #0f9
const klik_dark     = 'rgba(0,63,255, 0.7)';
const klik_white    = 'rgba(255,255,255, 0.7)';
const klik_pink     = 'rgba(255,0,255, 0.7)';


var klik_colors_rgb_by_name = {
    'red'       : [255,0,0],
    'orange'    : [255,127,0],
    'yellow'    : [255,255,0],
    'chartreuse': [127,255,0],
    'green'     : [0,255,0],
    'spring'    : [0,255,127],
    'cyan'      : [0,255,255],
    'azure'     : [0,127,255],
    'blue'      : [0,0,255],
    'violet'    : [127,0,255],
    'magenta'   : [255,0,255],
    'rose'      : [255,0,127],
    'white'     : [255,255,255],
    'black'     : [15,15,15],
}


klik_colors_rgb_by_index = {
    0  : klik_colors_rgb_by_name.red,
    1  : klik_colors_rgb_by_name.orange,
    2  : klik_colors_rgb_by_name.yellow,
    3  : klik_colors_rgb_by_name.chartreuse,
    4  : klik_colors_rgb_by_name.green,
    5  : klik_colors_rgb_by_name.spring,
    6  : klik_colors_rgb_by_name.cyan,
    7  : klik_colors_rgb_by_name.azure,
    8  : klik_colors_rgb_by_name.blue,
    9  : klik_colors_rgb_by_name.violet,
    10 : klik_colors_rgb_by_name.magenta,
    11 : klik_colors_rgb_by_name.rose,
    12 : klik_colors_rgb_by_name.white,
    13 : klik_colors_rgb_by_name.black,
}


function rgb_to_luma(rgb, alpha=1.0) {
    var luma = parseInt(0.299*rgb[0] + 0.587*rgb[1] + 0.114*rgb[2]);
    return 'rgba('+[luma, luma, luma]+','+alpha+')';
}


function rgb_to_luma_inversed(rgb, alpha=1.0) {
    var luma_inv = 255-parseInt(0.299*rgb[0] + 0.587*rgb[1] + 0.114*rgb[2]);
    return 'rgba('+[luma_inv, luma_inv, luma_inv]+','+alpha+')';
}


function rgb_to_contrast(rgb, alpha=1.0) {
    var luma = parseInt(0.299*rgb[0] + 0.587*rgb[1] + 0.114*rgb[2]);
    var val = (luma>127)?0:255;
    return 'rgba('+[val, val, val]+','+alpha+')';
}


function rgb_to_rgba(rgb, alpha=1.0) {
    return 'rgba('+rgb+','+alpha+')';
}


function rgb_to_rgba_inversed(rgb, alpha=1.0) {
    rgb = [255-rgb[0], 255-rgb[1], 255-rgb[2]];
    return 'rgba('+rgb+','+alpha+')';
}




/**
* HSV to RGB color conversion
*
* H runs from 0 to 360 degrees
* S and V run from 0 to 100
*
* Ported from the excellent java algorithm by Eugene Vishnevsky at:
* http://www.cs.rit.edu/~ncs/color/t_convert.html
*/
function hsv_to_rgb(h, s, v) {
    var r, g, b;
    var i;
    var f, p, q, t;
     
    // Make sure our arguments stay in-range
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));
     
    // We accept saturation and value arguments from 0 to 100 because that's
    // how Photoshop represents those values. Internally, however, the
    // saturation and value are calculated from a range of 0 to 1. We make
    // That conversion here.
    s /= 100;
    v /= 100;
     
    if(s == 0) {
        // Achromatic (grey)
        r = g = b = v;
        return [
            Math.round(r * 255), 
            Math.round(g * 255), 
            Math.round(b * 255)
        ];
    }
     
    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));
     
    switch(i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
     
        case 1:
            r = q;
            g = v;
            b = p;
            break;
     
        case 2:
            r = p;
            g = v;
            b = t;
            break;
     
        case 3:
            r = p;
            g = q;
            b = v;
            break;
     
        case 4:
            r = t;
            g = p;
            b = v;
            break;
     
        default: // case 5:
            r = v;
            g = p;
            b = q;
    }
     
    return [
        Math.round(r * 255), 
        Math.round(g * 255), 
        Math.round(b * 255)
    ];
}

// other option
// var RGB2HSL = function(a) {
//     var r = +a[0],
//         g = +a[1],
//         b = +a[2];
//     r /= 255, g /= 255, b /= 255;
//     var max = Math.max(r, g, b),
//         min = Math.min(r, g, b),
//         h, s, l = (max + min) / 2, d;
//     if (max === min) {
//         h = s = 0;
//     } else {
//         d = max - min;
//         s = l > .5 ? d / (2 - max - min) : d / (max + min);
//         switch (max) {
//             case r: h = (g - b) / d + (g < b ? 6 : 0); break;
//             case g: h = (b - r) / d + 2; break;
//             case b: h = (r - g) / d + 4; break;
//         }
//         h /= 6;
//     }
//     return [h, s, l];
// };