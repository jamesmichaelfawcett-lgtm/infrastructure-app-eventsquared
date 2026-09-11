// by JSR <jsr@pixmob.com>
// vanilla javascript only in this file


// user inputs

function klik_prompt(msg, is_password=false) {
    var result = prompt(msg);
    return result;
}


function klik_alert(msg) {
    alert(msg);
}


function klik_confirm(msg) {
    confirm(msg);
}



// graphical user interfaces

var klik_ui_highlight_prev = {};

function klik_ui_highlight(button) {
    if (klik_ui_highlight_prev.button) {
        rem_class(klik_ui_highlight_prev.button, 'sidebar_selected')
    }
    add_class(button, 'sidebar_selected');
    klik_ui_highlight_prev.button = button;
}


function klik_ui_tabs(nav, args) {
    var inc = args.inc;
    var min = args.min;
    var num = (args.max-args.min) / inc; 
    for (var i=0; i<nav.length; i++) {
        for (var j=0; j<=num; j++) {
            var val = min + j * inc;
            var tab = { _t:'tab',  _l:val };
            if (val==args.value) {
                tab._c = 'selected';
            }
            nav[i].content.push(tab);
        }
    }
}


function klik_ui_populate_menu(menu, items, use_key_as_value=true) {
    for (var it in items) {
        const opt = document.createElement('option');
        opt.value = (use_key_as_value) ? it : items[it];
        opt.innerHTML = it;
        menu.appendChild(opt);
    }
}


function klik_ui_tab_select(section, value) {
    var tabs = section.childNodes;
    for (var i=0; i<tabs.length; i++) {
        rem_class(tabs[i], 'selected');
        if (tabs[i].innerHTML==value) {
            add_class(tabs[i], 'selected');
        }
    }
}


// https://tovic.github.io/color-picker/
function klik_ui_colorpicker(input, value, hidden_input=true, callback_on_change=null, callback_on_click=null, hidden_box=false) {

    if (!hidden_box) {
        var box = document.createElement('div');
        box.className = 'color-box';
        box.style.backgroundColor = value;
        box.setAttribute('data-color', value);
        insert_before(input, box);
        
        box.addEventListener('mousedown', function(event) {
            if (callback_on_click) {
                callback_on_click(box.style.backgroundColor);
            }
        });
    }

    // var box = document.createElement('div');
    // box.className = 'color-box';
    // box.style.backgroundColor = value;
    // box.setAttribute('data-color', value);
    // // input.parentNode.insertBefore(box, input);
    
    // insert_before(input, box);

    if (hidden_input) {
        input.type = 'hidden';
    }
    input.value = value;

    var picker = new CP(box);

    picker.on("create", function(data) {
        // console.log('create', data);
    });

    picker.on("destroy", function(data) {
        // console.log('destroy', data);
    });

    picker.on('change', function(color) {
        // input.value = '#' + color;
        input.value = CP.HEX2RGB(color).join(',');
        this.target.style.backgroundColor = '#' + color;
        if (callback_on_change) {
            callback_on_change(color);
        }
        // console.log("changing", input.value);
    });


    // todo : 
    // we might not want to create the picker right away
    // to be continued...

    picker.create();

    return picker;
}


// will adjust ui component
// focusing on the tabs and making sure they
// are the right width, but will also assign an id to 
// the element based on the uid and its creating order
// i = section index
// j = element index

function klik_ui_adjust_navigation(nav, uid=null) {

    for (var i=0; i<nav.length; i++) {
        var max = 0;
        for (var j=0; j<nav[i].content.length; j++) { 
            if (nav[i].content[j]._t=='tab') {
                max++;
            }
        }

        var w = 100/max;

        for (var j=0; j<nav[i].content.length; j++) { 
           
            if (nav[i].content[j]._t=='tab') {
                nav[i].content[j]._s = (j==(max-1))?'width:'+w+'%; margin-right:0;' : 'width:calc('+w+'% - 4px);';
            }
            
            if (uid) {
                nav[i].content[j]._g = uid+'_'+i;
                nav[i].content[j]._i = uid+'_'+i+'_'+j;
                // console.log(nav[i].content[j]._i);
            }
        }
    }
}


function klik_ui_adjust_widths(array) {
    var max = array.length;
    var w = 100/max;
    for (var j=0; j<array.length; j++) { 
        if (j==(max-1)) {
            array[j].style.width = w+'%';
            array[j].style.marginRight = 0;
        }
        else {
            array[j].style.width = 'calc('+w+'% - 4px)';
        }
    }
}


function klik_ui_adjust_section(section, callback) {
    section.style.display = 'block';
    var nodes = section.childNodes;
    klik_ui_adjust_widths(nodes);
    for (var i=0; i<nodes.length; i++) {
        nodes[i].onmousedown = callback;
    }
}


// build lists

function klik_ui_list_item(namespace, item, use_default_image=true, 
    callback_onclick='klik_data_select_item_onclick(event)', 
    callback_onmouseup='klik_data_select_item_onmouseup(event)'
    ) {

    var img_url = (use_default_image) ? klik_icons_ble : '../../lib/img/icon-'+item.type+'.png';

    var device =  {
        title : null,
        id : null,
    }

    if (namespace==='bridges') {
        device.title = item.addr;
        device.id = item.addr;
    }
    else if (namespace==='attendees') {
        device.title = item.last_name +', '+item.first_name;
        device.id = item.id;
    }
    else if (namespace==='locations') {
        device.title = item.display_name;
        device.id = item.name;
    }
    else if (namespace==='groups') {
        device.title = 'batch '+item.batch;
        device.id = item.batch;
    }
    else if (namespace==='commands') {
        device.title = item.description;
        device.id = item.description;
    }
    else {  
        device.title = item.id;
        device.id = item.id;
    }

return '\
<li id="'+namespace+'_'+device.id+'" onclick="'+callback_onclick+'" onmouseup="'+callback_onmouseup+'">\
    <div class="holder">\
        <img src="'+img_url+'"  style="border:2px solid white; border-radius:50%; background:#aaa"/>\
    </div>\
    <div>'+device.title+'</div>\
</li>';
}


function klik_ui_section_with_sidebar(ns) {
var ids = ['label_'+ns, 'list_'+ns, 'html_'+ns];

return '\
<div style="margin:0; padding:0; font-size:0;">\
    <div class="sidebar_list">\
        <label id="'+ids[0]+'" style="margin:0;">'+ns+'</label>\
        <ul id="'+ids[1]+'" ></ul>\
    </div>\
    <div id="'+ids[2]+'" class="sidebar_details" style="display:none" ></div>\
</div>';
}

// check for valid range
// and also update corresponding number box
function klik_ui_slider_update(event, range) {

    var id = event.target.id;

    if (id.match('_number_')) {
        id = id.replace('_number_', '_slider_')
    }
    else if (id.match('_slider_')) {
        id = id.replace('_slider_', '_number_')
    }

    if (event.target.valueAsNumber<range[0]) {
        event.target.value = range[0];
    }
    else if (event.target.valueAsNumber>range[1]) {
        event.target.value = range[1];
    }
    else if(event.target.value=='') {
        event.target.value = 0;
    }

    by_id(id).value = event.target.value;
}


var slider_mouse_down = false;

function klik_ui_slider(target, name, label, range, value, callbacks=null, style=null) {

    var css = window.getComputedStyle(document.body);
    var common_height = css.getPropertyValue('--item_height');
    var common_style = 'height:'+common_height+'; text-align:center; ';
    
    var style_button = common_style+'width:104px; ';
    var style_input_number = common_style+'width:50; ';
    var style_input_range  = common_style+'width:calc(100% - 164px); ';

    // console.log(style);

    if (style) {
        if (style.button) style_button       += style.button;
        if (style.number) style_input_number += style.number;
        if (style.slider) style_input_range  += style.slider;
    }

    var button = add_node(target, 'button', {id:'ui_button_'+name, _l:label, _s:style_button});
    var number = add_node(target, 'input' , {id:'ui_number_'+name, type:'number', min:range[0], max:range[1], value:value, _s:style_input_number });
    var slider = add_node(target, 'input' , {id:'ui_slider_'+name, type:'range' , min:range[0], max:range[1], value:value, _s:style_input_range });

    add_class(slider, 'horizontal_slider')
    

    function handle_change(event) {
        klik_ui_slider_update(event, range);
        if (callbacks && callbacks.oninput) {
            callbacks.oninput(event);
        }
    }

    function handle_slider_move(event) {
        if (slider_mouse_down) {
            handle_change(event);
        }
    }

    function handle_slider_down(event) {
        slider_mouse_down = true;

        if (!tech.ios) {
            handle_change(event);
        }
    }

    function handle_slider_reset(event) {
        slider_mouse_down = false;
    }


    number.oninput = handle_change;

    slider.onmousemove  = handle_slider_move;
    slider.oninput      = handle_slider_down; // slider.onmousedown  = handle_slider_down;
    slider.onmouseup    = handle_slider_reset;
    slider.onmouseout   = handle_slider_reset;

    if (tech.ios) {
        slider.ontouchmove  = handle_slider_move;
        slider.ontouchstart = handle_slider_down;
        slider.ontouchend   = handle_slider_reset;
    }
}


function klik_ui_slider_set_value(uid, value) {
    var number = by_id('ui_number_'+uid);
    var slider = by_id('ui_slider_'+uid);
    number.value = value;
    slider.value = value;
}


// klik_ui_json

function klik_ui_json(target, object) {
    var page_y = document.getElementsByTagName("body")[0].scrollTop;
    target.innerHTML = klik_highlight(JSON.stringify(object, klik_debug.inline_array, 2));
    target.style.height = 'auto';
    target.style.height = target.scrollHeight+'px';
    target.style.fontSize = '12px';
    target.style.backgroundColor = '#345';
    document.getElementsByTagName("body")[0].scrollTop = page_y;
}


// subsection - valid global actions are : 'show', 'hide', 'deselect'

function subsection_tabs(action, index, name, data, do_subtitle=true) {
    if (do_subtitle) {
        window[action](by_id(ui_id('subtitle', index, name))); // ui_subtitle_0_color
    }
    for (i=0; i<data[name].length; i++) {
        window[action](by_id(ui_id('tab', index, name, i))); // ui_tab_0_color_1
    } 
}


function subsection_sliders(action, index, name) {
    window[action](by_id('ui_subtitle_'+index+'_'+name));
    window[action](by_id('ui_button_'+index+'_'+name)); // ui_button_0_signal
    window[action](by_id('ui_number_'+index+'_'+name)); // ui_number_0_signal
    window[action](by_id('ui_slider_'+index+'_'+name)); // ui_slider_0_signal
}


// 


function set_value(a, b)  {
    a.innerHTML = b;
}


function toggle(a) {
    a.style.display = (a.style.display==='none') ? '' : 'none';
    return a;
}


function toggle_all(a){
    var elements = document.getElementsByClassName(a);
    for (var i = 0; i < elements.length; i++){
        elements[i].style.display = elements[i].style.display === 'none' ? '' : 'none';
    }
    return elements;
}


function deselect(a) {
    rem_class(a, 'selected');
}


function show_all(a){
    var b = document.getElementsByClassName(a);
    for (var i = 0; i < b.length; i++){
        b[i].style.display = '';
    }
    return b;
}


function hide_all(a){
    var b = document.getElementsByClassName(a);
    for (var i = 0; i < b.length; i++){
        b[i].style.display = 'none';
    }
    return b;
}


function turn_on(a) {
    a.classList.add('on') ;
    a.classList.remove('off');
}


function turn_off(a) {
    a.classList.add('off') ;
    a.classList.remove('on');
}


function add_class_to_all(a, b) {
    var c = document.getElementsByClassName(a)
    for (var i=0; i<c.length; i++) {
        c[i].classList.add(b);
    }
}


function rem_class_to_all(a, b) {
    var c = document.getElementsByClassName(a)
    for (var i=0; i<c.length; i++) {
         c[i].classList.remove(b);
    }
}


function get_mouse_x(event) {
    return event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
}


function get_mouse_y(event) {
    return event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
}


// function add_bits(i) {
//     for (var j=7; j>=0; j--) {
//         var cb_label = add_node(sections[i], 'label', { class:'klik_wand_cb_label' });
//         cb_label.innerHTML = 'b'+j;
//         var cb_input = create_node('input',  { type:'checkbox', class:'klik_wand_cb_input' } );
//         cb_label.appendChild(cb_input);   
//     }
// }


// function add_toggles(i) {

//     var callback_auto = function(event) {
//         console.log('auto', event.target.id, event.target.checked);

//         if ( ! event.target.checked) {
//             wand.trigger(0);
//         }
//         // else {
//         //     wand.trigger(1);
//         // }
//     }

//     var callback_stop = function(event) {
//         // console.log('stop', event.target.id, event.target.checked);
//         wand.stop();

//         setTimeout(function() {
//             event.target.checked = false; 
//         }, 100);
//     }


//     var toggles = [ 
//         ['auto', callback_auto ],
//         ['stop', callback_stop ] 
//     ];

//     for (var j in toggles) {

//         var label = toggles[j][0];
//         var callback = toggles[j][1];

//         var cb_label = add_node(sections[i], 'label', { class:'klik_wand_cb_label' });
//         cb_label.innerHTML = label;

//         var cb_input = create_node('input',  { _i:'section_'+i+'_input_'+label, type:'checkbox', class:'klik_wand_cb_input' } );
//         cb_label.appendChild(cb_input);
//         cb_input.onchange = callback; 
//     }          
// }
