// by JSR <jsr@pixmob.com>

KlikSmsTable = function(options=null) {
    KlikModule.call(this); // call super constructor

    this.label = 'sms';
    this.table = null;
    this.header = null;
    this.rows = {};
    this.data = {};
    this.last_entry_key = null;
    this.last_entry_index = null;

    this.params = { date:0, from:0, to:0, message:0, return:0 };

    // overwrite defaults
    this.set(options);
}

KlikSmsTable.prototype = Object.create(KlikModule.prototype);
KlikSmsTable.prototype.constructor = KlikSmsTable;


KlikSmsTable.prototype.update = function(data) {
    if (!this.table) { 
        // table creation with populate with existing data 
        this.add_table();
        this.add_header();
        this.add_old_rows(data);
    }
    else {
        // just an update
        this.add_new_rows(data);
    }
}


KlikSmsTable.prototype.add_new_rows = function(data) {
    if (!this.last_entry_key) {
        return;
    }
    data = data.reverse()
    for (var i=0; i<data.length; i++) {
        if (data[i].id==this.last_entry_key) {
            var j = i-1;
            while (j>=0) {
                this.insert_at_the_top(data[j]);
                j--;
            }
            return
        }
    }
}


KlikSmsTable.prototype.insert_at_the_top = function(sms_data) {
    var top_row = this.rows[this.last_entry_key]
    var new_row = this.create_row(sms_data, ++this.last_entry_index, 'new');
    top_row.parentNode.insertBefore(new_row, top_row);
    this.last_entry_key = sms_data.id;
}


KlikSmsTable.prototype.add_table = function(label) {
    if (!this.container) {
        return;
    }
    this.table = proto.table.cloneNode(false)
    this.table.classList.add('sms_table');
    this.container.appendChild(this.table);
}


KlikSmsTable.prototype.add_header = function(label) {
    if (!this.table) {
        return;
    }
    this.header = proto.tr.cloneNode(false);
    this.add_header_field('#');
    for (var k in this.params) {
        this.add_header_field(k.toUpperCase());
    }
    this.table.appendChild(this.header);
}


KlikSmsTable.prototype.add_header_field = function(label) {
    if (!this.header) {
        return;
    }
    var th = proto.th.cloneNode(false);
    th.appendChild(document.createTextNode(label));
    this.header.appendChild(th);
}


KlikSmsTable.prototype.add_old_rows = function(data) {
    var counter = data.length;

    data = data.reverse()
    for (var i=0; i<data.length; i++) {
        if (i==0) {
            this.last_entry_key = data[i].id;
            this.last_entry_index = counter;
        }
        this.table.appendChild(this.create_row(data[i], counter, 'old'));
        // - top row is the most recent
        // - bottom row is the oldest
        counter--;
    }
}


KlikSmsTable.prototype.create_row = function(sms_data, counter, type) {
    if (!this.table) {
        return;
    }

    // store data by key
    this.data[sms_data.id] = sms_data;

    // create one row per entry
    this.rows[sms_data.id] = proto.tr.cloneNode(false);
    this.rows[sms_data.id].id = sms_data.id;

    // print corresponding json data when clicking on the row
    var self = this;

    // data : line counter
    var cell = proto.td.cloneNode(false);
    cell.appendChild(document.createTextNode(counter));
    this.rows[sms_data.id].appendChild(cell);

    // data : other params
    for (var k in this.params) {
        var cell = proto.td.cloneNode(false)

        if (typeof(sms_data[k])=='object') {
            for (var i=0; i<sms_data[k].length; i++) {

                if (sms_data[k][i].type=='command') {

                    cell.appendChild(document.createTextNode(JSON.stringify(sms_data[k][i])));

                    var json = sms_data[k][i];
                    json.phone = sms_data['to'];

                    cell.onmousedown = function(event) {
                        if (self.callbacks.on_command_click) {
                            self.callbacks.on_command_click(json);
                        }
                    }

                    if (type=='new' && self.callbacks.on_new_command) {
                        self.callbacks.on_new_command(json);
                    }

                    if (type=='old' && self.callbacks.on_old_command) {
                        self.callbacks.on_old_command(json);
                    }
                }
            }
        }
        else if(sms_data[k]!=undefined) {
            cell.appendChild(document.createTextNode(sms_data[k]));
        }
        this.rows[sms_data.id].appendChild(cell);
    }
    return this.rows[sms_data.id];
}
