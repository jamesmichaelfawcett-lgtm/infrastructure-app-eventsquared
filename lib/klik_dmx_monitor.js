// by JSR <jsr@pixmob.com>

KlikDmxMonitor = function(options=null) {
    KlikModule.call(this); // call super constructor

    this.label = 'monitor';
    this.container = null;
    this.table = null;
    this.rows = {
        headers : null,
        dmx_in : null,
        dmx_out : null,
    };

    this.highlight_changes = false;
    this.old_data = {};

    this.headers = ['count', 'usbdmx', 'port', 'dir', 'fps-hw', 'fps-sw', 'status', 'dmx'];

    for (k in options) {
        this[k] = options[k];
    }
}

KlikDmxMonitor.prototype = Object.create(KlikModule.prototype);
KlikDmxMonitor.prototype.constructor = KlikDmxMonitor;


KlikDmxMonitor.prototype.get_key = function(value, dir) {
    // 'fps-hw' would become 'fps_out_hw'
    var parts = value.split('-');
    var key = parts[0]+'_'+dir;
    for (var i=1; i<parts.length; i++) {
        key += '_'+parts[i];
    }
    return key;
}


KlikDmxMonitor.prototype.set_dmx_in = function(data) {
    if (this.container) {
        data.dir_in = 'IN'
        this.update_table(this.container, data, 'in');
    }
    else {
        this.cout('you need to set the container');
    }
}


KlikDmxMonitor.prototype.set_dmx_out = function(data) {
    if (this.container) {
        data.dir_out = 'OUT'
        this.update_table(this.container, data, 'out');
    }
    else {
        this.cout('you need to set the container');
    }
}


KlikDmxMonitor.prototype.update_row = function(data, direction) { // direction is 'in' or 'out'

    // get proper row
    var row = this.rows['dmx_'+direction];
    
    // reset it
    row.innerHTML = '';


    // rebuild it
    for (var i=0; i<this.headers.length; i++) {
        var key = this.get_key(this.headers[i], direction);

        var val = data[key];
        td = proto.td.cloneNode(false);
        td.appendChild(document.createTextNode(val));

        add_class(td, this.headers[i]);

        if (this.highlight_changes) {
            if (Utils.is_different(this.old_data[key], val) ) {
                // td.style.color = this.highlight_color;
                add_class(td, 'changed')
            } 
            this.old_data[key] = val;
        }

        if (val=='no activity') {
            add_class(td, 'no_activity');
        }

        row.appendChild(td);
        row.style.lineHeight = 2;
        row.style.display = '';
    }
}


KlikDmxMonitor.prototype.update_table = function(div, data, direction) {

    if (div.innerHTML=='') {

        // create table
        this.table = proto.table.cloneNode(false)
        add_class(this.table, 'dmx_table')
        div.appendChild(this.table);

        // headers row
        this.rows.headers = proto.tr.cloneNode(false);
        for (var i=0; i<this.headers.length; i++) {
            var key = this.get_key(this.headers[i], direction);
            var th = proto.th.cloneNode(false); // table header
            th.appendChild(document.createTextNode(this.headers[i].toUpperCase()));
            this.rows.headers.appendChild(th);
            this.rows.headers.style.lineHeight = 2;
        }
        this.table.appendChild(this.rows.headers);

        // row for dmx in 
        this.rows.dmx_in = proto.tr.cloneNode(false);
        this.rows.dmx_in.style.display = 'none';
        this.table.appendChild(this.rows.dmx_in);

        // row for dmx out 
        this.rows.dmx_out = proto.tr.cloneNode(false);
        this.rows.dmx_out.style.display = 'none';
        this.table.appendChild(this.rows.dmx_out);
    }

    this.update_row(data, direction);
}
