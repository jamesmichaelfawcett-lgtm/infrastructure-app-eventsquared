// by JSR <jsr@pixmob.com

menu_views_options = "\
<option value='map' selected>map</option>\
<option value='list'>list</option>\
"

menu_views_content_options = "\
<option value='attendees' selected>attendees</option>\
<option value='beacons'>beacons</option>\
<option value='tags'>tags</option>\
<option value='sentinelles'>sentinelles</option>\
<option value='hubs'>hubs</option>\
"

menu_themes_options = "\
<option value='klik' selected>klik</option>\
<option value='pixmob'>pixmob</option>\
<option value='dark'>dark</option>\
<option value='bright'>bright</option>\
<option value='transparent'>transparent</option>\
"

menu_tracking_options = "\
<option value='tags' selected>tags</option>\
<option value='beacons'>beacons</option>\
"

// conver this to vanilla
function get_text_width(text, font_size=20) {
    return text.length * font_size/2; // good approximation when font is 20pt
};


// center element inside <select> menu on all platforms
function klik_menu_center_text(menu, text) {
    var css = window.getComputedStyle(menu)
    var container_width = css.width.substring(0,css.width.length-2);
    var text_width = 1.15*(text.length * css.fontSize.substring(0,css.fontSize.length-2) / 2) // good approximation
    menu.style.textIndent =  (container_width - text_width)/2;
}


function klik_menu_select_text(menu, text){
    for (var i=0; i < menu.options.length; i++) {
        if (menu.options[i].text.toUpperCase() === text.toUpperCase()) {
            menu.selectedIndex = i;
            klik_menu_center_text(menu, menu.options[i].text);
            break;
        }
    }
}


function klik_menu_select_value(menu, value, center_text=true){
    for (var i=0; i < menu.options.length; i++) {
        if (menu.options[i].value === value) {
            menu.selectedIndex = i;
            if (center_text) {
                klik_menu_center_text(menu, menu.options[i].value);
            }
            break;
        }
    }
}


function klik_menu_clear(menu) {
    while (menu.options.length) {
        menu.remove(menu.options.length-1);
    }
}
