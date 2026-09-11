// by JSR <jsr@pixmob.com>

KlikDmxTable = function(options=null) {
    KlikModule.call(this); // call super constructor

    this.label = 'table';
    this.container = null;
    this.table = null;
    this.cells = [];
    this.data = [];
    this.dim = {x:32, y:16};
    this.colors = null;

    for (k in options) {
        this[k] = options[k];
    }

    this.original_title = by_id(this.container.parentElement.id+'_title').innerHTML;

    this.init();
}

KlikDmxTable.prototype = Object.create(KlikModule.prototype);
KlikDmxTable.prototype.constructor = KlikDmxTable;


KlikDmxTable.prototype.init = function(data) {
    // add table
    this.table = proto.table.cloneNode(false)
    add_class(this.table, 'dmx_table')
    this.container.appendChild(this.table);

    // add cells
    var self = this;
    for (var j=0; j<this.dim.y; j++){
        var row = proto.tr.cloneNode(false)
        for (var i=0; i<this.dim.x; i++){
            var index = i+j*this.dim.x;
            this.cells[index] = proto.td.cloneNode(false)
            this.cells[index].innerHTML = '-';
            this.cells[index].index = index;

            this.cells[index].onmouseover = function() {
                add_class(this, 'highlighted');
                by_id(self.container.parentElement.id+'_title').innerHTML = 'ch '+(this.index+1)+' = '+self.data[this.index];
            }

            this.cells[index].onmouseout = function() {
                by_id(self.container.parentElement.id+'_title').innerHTML = self.original_title;
                rem_class(this, 'highlighted');
            }

            this.set_background(this.cells[index], index+1);

            row.appendChild(this.cells[index]);
        }
        this.table.appendChild(row);
    }
}


KlikDmxTable.prototype.set_background = function(node, channel) {
    for (var color in this.colors) {
        var start = this.colors[color][0];
        var end   = this.colors[color][1];
        if ((channel>=start) && (channel<=end)) {
            node.style.backgroundColor = color;
        }
    }
}


KlikDmxTable.prototype.update = function(data) {
    this.data = data;
    for (var j=0; j<this.dim.y; j++){
        for (var i=0; i<this.dim.x; i++){
            var index = i+j*this.dim.x;
            if (index<data.length) {
                this.cells[index].innerHTML = data[index];
            }
        }
    }
}
