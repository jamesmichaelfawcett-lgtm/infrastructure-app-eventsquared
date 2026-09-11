// by JSR <jsr@pixmob.com>


var klik_controller_html_title = function(title) {
    return '<div style="height:20; margin:1px; border:0px solid red;\
    padding:5; text-align:center; background-color:#123; user-select: none; cursor:default;"\
    >'+title.toUpperCase()+'</div>'
}

var klik_controller_html_buttons = function(dict) {
    var html = ''
    for (var p in dict) {
        var func = dict[p][0];
        var args = dict[p][1];
        html += '<button class="dmx_button" func="'+func+'" args="'+args+'"\
        style="cursor:pointer; font-family:monospace; font-size:14;"\
        >'+p+'</button>'
    }
    return html
}

var klik_controller_html_separator = function(height=24) {
    return '<div style="height:'+height+';"></div>'
}

var klik_controller_html_rgb_panel = function() {
    return '<div id="klik_controller_rgb_panel" style="width:100%; height:50;"></div>';
}

var klik_controller_html_column = function(modules, position) {
    var html = '';
    html += (position==='left') ? '<div class="dmx_left">' : '<div class="dmx_right">';
    for (var k in modules) {
        if (modules[k][0] && modules[k][1]===position) {
            
            if (k=='tests') {
                html += klik_controller_html_title('LIVE TESTS : Obj-C');
            }
            else {
                html += klik_controller_html_title(k);
            }
            html += klik_controller_html_buttons(modules[k][2]);
            html += klik_controller_html_separator();
        }
    }
    html += '</div>';
    return html;
}

var klik_controller_init = function(object_ref, div) {
    var html = '';
    html += klik_controller_html_rgb_panel();
    html += klik_controller_html_column(object_ref.modules, 'left');
    html += klik_controller_html_column(object_ref.modules, 'right');
    div.innerHTML = html;

    $('.dmx_button').on('click', function(e) {
        e.preventDefault();
        var func = $(this)[0].getAttribute('func');
        var args = $(this)[0].getAttribute('args').split(',').map(Number);
        if (isNaN(args[0])) {
            args = $(this)[0].getAttribute('args')
        }
        object_ref[func](args);
    });

    $('.dmx_button').on('keydown', function(e) {
        if (e.keyCode == 13) {
            $(this).trigger('click');
        }
    });

    $('.dmx_button').on('mouseover', function(e) {
        e.preventDefault();
        $(this).focus();
    });
}

const klik_controller_localnames = {
    'BRO - all pixels'    : ['set_localname', 'BRO' ],
    'GPS - all tags'      : ['set_localname', 'GPS' ],
    'VIZ - all visualizer': ['set_localname', 'VIZ' ],
}