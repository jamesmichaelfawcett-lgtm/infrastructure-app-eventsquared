// by JSR <jsr@pixmob.com


// local database

var klik_data = {};


function klik_data_init(data) {
    klik_data = data;
}


function klik_data_add(namespace, key, data) {
    klik_data[namespace][key] = data;
}


function klik_data_create_html(namespace, data, keyword, use_default_image=true) {
    var html = '';
    var count = 0;
    for (var i=0; i<data.length; i++) {
        var key = data[i][keyword];
        klik_data_add(namespace, key, data[i]);
        
        if (data[i].type==undefined) {
            // data[i].type = 'ir';
            data[i].type = 'eye';
        }

        html += klik_ui_list_item(namespace, data[i], use_default_image);  
        count++;
    }
    by_id('label_'+namespace).innerHTML = count+' '+namespace;
    return html;
}


function klik_data_select_item_onmouseup(event) {
    var parts = event.target.id.split('_'); // namespace_item_id_separated_with_underscore
    var namespace = parts[0];
    var key = parts[1];
    for (var i=2; i<parts.length; i++) {
        key += '_'+parts[i];
    }

    var obj = klik_data[namespace][key];
    if (app.callbacks.on_item_selected) {
       app.callbacks.on_item_selected(obj);
    }
}


function klik_data_select_item_onclick(event) {
    klik_ui_highlight(event.target);

    var parts = event.target.id.split('_'); // namespace_item_id_separated_with_underscore
    var namespace = parts[0];
    var key = parts[1];
    for (var i=2; i<parts.length; i++) {
        key += '_'+parts[i];
    }
    var obj = klik_data[namespace][key];

    if (!obj) {
        console.log('bad item', key);
        return;
    }

    var div = window['html_'+namespace];
    div.style.display = '';
    div.style.position = 'absolute';
    div.style.top = event.target.offsetTop;
    div.style.left =  event.target.offsetWidth + 10;
    div.innerHTML = klik_highlight(JSON.stringify(obj, klik_debug.inline_array, 2));


    if (app.callbacks.on_dmx_command && obj.description && obj.auto_command ) {
        if (obj.dmx==undefined) {
            var params = [
                'signal',
                'effect',
                'speed',
                'trigger',
                'red',
                'green',
                'blue',
                'prob',
                'group',
                'mix',
                'indexA',
                'indexB',
                'iterate',
                'fadein',
                'sustain',
                'fadeout',
                'xmitter',
                'pixel',
                'arg1',
                'arg2',
                'arg3',
                'confirm',

                // 2.5
                'id12',
                'id34',
                'id56',
                'id78',
                'byte0',
                'byte1',
                'byte2',
                'byte3',
                'byte4',
                'byte5',
                'byte6',
                'byte7',
            ]

            var data = [];
            for (var i=0; i<params.length; i++) {
                var key = params[i]
                if (obj[key]!=undefined) {
                    data.push(obj[key]);
                }
            }
            obj.dmx = data;
        }
        app.callbacks.on_dmx_command(obj.description, obj.auto_command, obj.dmx);
    }
}


function klik_data_dict(data, keyword) {
    var obj = {};
    for (var i=0; i<data.length; i++) {
        var key = data[i][keyword];
        obj[key] = data[i];
    }
    return obj;
}


KlikData = function(namespace, data) {

    if (namespace == '/infrastructures') {
        var obj = {};
        for (var i=0; i<data.length; i++) {
            var type = data[i].type;
            var key = data[i].id;
            if (!obj[type]) {
                obj[type] = {};
            }
            obj[type][key] = data[i];
        }
        // console.log(obj);
        return obj;
    }

    if (namespace == '/sessions') {
        return klik_data_dict(data, 'title');
    }

    if (namespace == '/locations') {
        return klik_data_dict(data, 'display_name');
    }

    if (namespace == '/attendees') {
        return klik_data_dict(data, 'email');
    }

    if (namespace == '/bridges') {
        return klik_data_dict(data, 'addr');
    }
}
