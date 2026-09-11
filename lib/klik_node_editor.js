// Copyright 2016 Sketchpunk Labs
// modified by JSR

// Main Static Object

var NEditor = {};

NEditor.dragMode        = 0;
NEditor.dragItem        = null;
NEditor.startPos        = null;     // used for starting position of dragging lines
NEditor.offsetX         = 0;        // offsetX for dragging nodes
NEditor.offsetY         = 0;        // offsetY for dragging nodes
NEditor.svg             = null;     // SVG where the line paths are drawn.

NEditor.pathEnable      = 1;
NEditor.pathColor       = "#999999";
NEditor.pathColorA      = "#00ffb9";
NEditor.pathWidth       = 2;
NEditor.pathDashArray   = "20,5,5,5,5,5";

NEditor.lineEnable      = 0;
NEditor.lineColor       = "#999999";
NEditor.lineColorA      = "#f90";
NEditor.lineWidth       = 2;
NEditor.lineDashArray   = "10";

NEditor.segmEnable      = 0;
NEditor.segmColor       = "#999999";
NEditor.segmColorA      = "#f09";
NEditor.segmWidth       = 2;
NEditor.segmDashArray   = "3";

NEditor.init = function(){
    NEditor.svg = document.getElementById("connsvg");
    NEditor.svg.ns = NEditor.svg.namespaceURI;
};

/*--------------------------------------------------------
Global Function */

// trail up the parent nodes to get the X,Y position of an element
NEditor.get_offset = function(n){
    var pos = [0,0];
    while (n) {
        pos[0] += n.offsetLeft;
        pos[1] += n.offsetTop;
        n = n.offsetParent;
    }
    return pos;
};

// Gets the position of one of the connection points
NEditor.get_conn_pos = function(n){
    var pos = NEditor.get_offset(n);
    pos[0] += (n.offsetWidth  / 2) + 1.5; // Add some offset so its centers on the element
    pos[1] += (n.offsetHeight / 2) + 0.5;
    return pos;
};

// used to reset the svg path between two nodes
NEditor.update_points = function(wire){
    NEditor.set_line_points(wire.line, wire.output.get_pos(), wire.input.get_pos() );
    NEditor.set_quadratic_curve_d(wire.path, wire.output.get_pos(), wire.input.get_pos() );
    NEditor.set_segmented_line_points(wire.segm, wire.output.get_pos(), wire.input.get_pos() );
};

// create a straight line
NEditor.create_line = function(p1, p2) {
    var n = document.createElementNS(NEditor.svg.ns, 'line');
    n.setAttribute('stroke', NEditor.lineColor);
    n.setAttribute('stroke-width', NEditor.lineWidth);
    n.setAttribute("stroke-dasharray", NEditor.lineDashArray);
    // NEditor.set_line_points(n, p1, p2)
    return n;
}

// create a segmented line, with right angles, actually it a path
NEditor.create_segmented_line = function(p1, p2) {
    var n = document.createElementNS(NEditor.svg.ns, 'path');
    n.setAttribute("fill", "none");
    n.setAttribute('stroke', NEditor.segmColor);
    n.setAttribute('stroke-width', NEditor.segmWidth);
    n.setAttribute("stroke-dasharray", NEditor.segmDashArray);
    // NEditor.set_segmented_line_points(n, p1, p2)
    return n;
}

// creates an quadratic curve
NEditor.create_quadratic_curve = function(p1, p2) {
    var n = document.createElementNS(NEditor.svg.ns,"path");
    n.setAttribute("fill", "none");
    n.setAttribute("stroke", NEditor.pathColor);
    n.setAttribute("stroke-width", NEditor.pathWidth);
    n.setAttribute("stroke-dasharray", NEditor.pathDashArray);
    // NEditor.set_quadratic_curve_d(n, p1, p2);
    return n;
}

// the followings are separated from the create so it can be reused as a way 
// to update an existing path or line without duplicating code

NEditor.set_quadratic_curve_d = function(n, p1, p2){
    var dif = Math.abs(p1[0]-p2[0]) / 1.5;
    var pts = "M" + p1 + " ";
    pts += "C";
    pts += (p1[0] + dif) + "," + p1[1] + " ";
    pts += (p2[0] - dif) + "," + p2[1] + " ";
    pts += p2;
    n.setAttribute('d', pts);
}


NEditor.set_line_points = function(n, p1, p2){
    n.setAttribute('x1', p1[0]);
    n.setAttribute('y1', p1[1]);
    n.setAttribute('x2', p2[0]);
    n.setAttribute('y2', p2[1]);
}


NEditor.set_segmented_line_points = function(n, p1, p2){
    var mid = Math.abs(p1[0]-p2[0]) / 2;
    var pts = 'M' + p1 + ' ';
    pts += 'L' + (p1[0]+mid) + ',' + p1[1] + ' ';
    pts += 'L' + (p2[0]-mid) + ',' + p2[1] + ' ';
    pts += p2;

    // var dist_x = Math.abs(p1[0]-p2[0]);
    // var dist_y = Math.abs(p1[1]-p2[1]);

    // var pt1_x = p1[0]+30+Math.abs(50-(dist_y*0.25));
    // var pt2_x = p2[0]-(dist_y*0.25);

    // var pt1_y = p1[1]-(dist_y*0.25);

    // var pts = 'M' + p1 + ' ';
    // pts += 'L' + pt1_x + ',' + p1[1]  + ' ';
    // pts += 'L' + pt2_x + ',' + p2[1] + ' ';
    // pts += p2;

    n.setAttribute('d', pts);
}

NEditor.setPathColor = function(n, isActive){ 
    n.setAttribute('stroke', (isActive)? NEditor.pathColorA : NEditor.pathColor); 
}

NEditor.setLineColor = function(n, isActive){ 
    n.setAttribute('stroke', (isActive)? NEditor.lineColorA : NEditor.lineColor); 
}

NEditor.setSegmColor = function(n, isActive){ 
    n.setAttribute('stroke', (isActive)? NEditor.segmColorA : NEditor.segmColor); 
}



/*--------------------------------------------------------
Dragging Nodes */


NEditor.onNodeMouseDown = function(e, n) {
    if (n.className=='NodeContainer') {
        e.stopPropagation();
        NEditor.beginNodeDrag(n, e.pageX, e.pageY);
        return true;
    }
    return false;
}

NEditor.beginNodeDrag = function(n, x, y) {
    if (NEditor.dragMode != 0) {
        return;
    }
    NEditor.dragMode = 1;
    NEditor.dragItem = n;
    this.offsetX = n.offsetLeft - x;
    this.offsetY = n.offsetTop - y;
    window.addEventListener("mousemove", NEditor.onNodeDragMouseMove);
    window.addEventListener("mouseup"  , NEditor.onNodeDragMouseUp);
    window.addEventListener("touchmove", NEditor.onNodeDragMouseMove);
    window.addEventListener("touchend" , NEditor.onNodeDragMouseUp);
};

NEditor.onNodeDragMouseUp = function(e) {
    e.stopPropagation(); e.preventDefault();
    NEditor.dragItem = null;
    NEditor.dragMode = 0;
    window.removeEventListener("mousemove", NEditor.onNodeDragMouseMove);
    window.removeEventListener("mouseup"  , NEditor.onNodeDragMouseUp);
    window.removeEventListener("touchmove", NEditor.onNodeDragMouseMove);
    window.removeEventListener("touchend" , NEditor.onNodeDragMouseUp);
};

NEditor.onNodeDragMouseMove = function(e) {
    e.stopPropagation(); e.preventDefault();
    if (NEditor.dragItem) {
        NEditor.dragItem.style.left = e.pageX + NEditor.offsetX;
        NEditor.dragItem.style.top  = e.pageY + NEditor.offsetY;
        NEditor.dragItem.ref.update_wires();
    }
};



/*--------------------------------------------------------
Dragging Wires */

NEditor.begin_conn_drag  = function(n) {
    if (NEditor.dragMode != 0) {
        return;
    }
    NEditor.dragMode = 2;
    NEditor.dragItem = n;
    NEditor.startPos = n.output.get_pos();
    NEditor.setPathColor(n.path, false);
    NEditor.setLineColor(n.line, false);
    NEditor.setSegmColor(n.segm, false);
    window.addEventListener("click"         , NEditor.on_conn_drag_click);
    window.addEventListener("mousemove"     , NEditor.on_conn_drag_mousemove);
    window.addEventListener("touchstart"    , NEditor.on_conn_drag_click);
    window.addEventListener("touchmove"     , NEditor.on_conn_drag_mousemove);
};
 

NEditor.end_conn_drag = function() {
    NEditor.dragMode = 0;
    NEditor.dragItem = null;
    window.removeEventListener("click"      , NEditor.on_conn_drag_click);
    window.removeEventListener("mousemove"  , NEditor.on_conn_drag_mousemove);
    window.removeEventListener("touchstart" , NEditor.on_conn_drag_click);
    window.removeEventListener("touchmove"  , NEditor.on_conn_drag_mousemove);
}


NEditor.on_conn_drag_click = function(e) {
    e.stopPropagation();e.preventDefault();
    NEditor.dragItem.output.removeWire(NEditor.dragItem);
    NEditor.end_conn_drag();
};


NEditor.on_conn_drag_mousemove = function(e) {
    e.stopPropagation(); e.preventDefault();
    if (NEditor.dragItem) {
        NEditor.set_quadratic_curve_d(NEditor.dragItem.path, NEditor.startPos, [e.pageX, e.pageY] );
        NEditor.set_line_points(NEditor.dragItem.line, NEditor.startPos, [e.pageX, e.pageY] );
        NEditor.set_segmented_line_points (NEditor.dragItem.segm, NEditor.startPos, [e.pageX, e.pageY] );
    }
};


/*--------------------------------------------------------
Connection Event Handling */
NEditor.on_output_click = function(e) {
    e.stopPropagation(); e.preventDefault();
    var wire = e.target.parentNode.ref.add_wire();
    NEditor.begin_conn_drag(wire);
}

NEditor.on_input_click = function(e) {
    e.stopPropagation(); e.preventDefault();
    var n = this.parentNode.ref;
    switch (NEditor.dragMode) {
        // dragging wires
        case 2: 
            n.apply_wire(NEditor.dragItem);
            NEditor.end_conn_drag();
            break;
        // no dragging
        case 0: 
            var wire = n.clearWire();
            if (wire != null)
                NEditor.begin_conn_drag(wire);
            break;      
    }
}


//###########################################################################
// Connector Object
//###########################################################################

// Connector UI Object. Ideally this should be an abstract class as a base for an output and input class, but save time
// I wrote this object to handle both types. Its a bit hokey but if it becomes a problem I'll rewrite it in a better OOP way.
NEditor.Connector = function(n, is_input, name){
    this.name  = name;
    this.root  = document.createElement("li");
    this.dot   = document.createElement("i");
    this.label = document.createElement("span");
    this.wires = [];

    // input / output specific values
    if (is_input) {
        this.OutputConn = null;     // input can only handle a single connection.
    }
    // else  
    //     this.wires = [];            // outputs can connect to as many inputs is needed

    // create Elements
    n.appendChild(this.root);
    this.root.appendChild(this.dot);
    this.root.appendChild(this.label);

    // define the Elements
    this.root.className = (is_input) ? "Input" : "Output";
    this.root.ref = this;
    this.label.innerHTML = name;
    this.dot.innerHTML = "&nbsp;";

    this.dot.addEventListener("click", (is_input) ? NEditor.on_input_click : NEditor.on_output_click );
};

/*--------------------------------------------------------
Common Methods */

// get the position of the connection ui element
NEditor.Connector.prototype.get_pos = function(){
    return NEditor.get_conn_pos(this.dot);
}

// just updates the UI if the connection is currently active
NEditor.Connector.prototype.reset_state = function() {
    if ((this.wires && this.wires.length > 0) ||  
        (this.OutputConn != null)) {
        this.root.classList.add("Active");
    }
    else {
        this.root.classList.remove("Active");
    }
}

// used mostly for dragging nodes, so this allows the wires to be redrawn
NEditor.Connector.prototype.update_wires = function() {
    if (this.wires && this.wires.length > 0) {
        for (var i=0; i < this.wires.length; i++) {
            NEditor.update_points(this.wires[i]);
        }
    }
    else if (this.OutputConn) {
        NEditor.update_points(this.OutputConn);
    }
}


/*--------------------------------------------------------
Output Methods */

// add wire
NEditor.Connector.prototype.add_wire = function() {
    var pos = NEditor.get_conn_pos(this.dot);
    var dat = {
        path: NEditor.create_quadratic_curve(pos, pos),
        line: NEditor.create_line(pos, pos),
        segm: NEditor.create_segmented_line(pos, pos),
        input: null,
        output: this
    };

    dat.path.style.display = (NEditor.pathEnable) ? '' : 'none';
    dat.line.style.display = (NEditor.lineEnable) ? '' : 'none';
    dat.segm.style.display = (NEditor.segmEnable) ? '' : 'none';

    NEditor.svg.appendChild(dat.path); 
    NEditor.svg.appendChild(dat.line); 
    NEditor.svg.appendChild(dat.segm); 

    this.wires.push(dat);
    return dat;
}

// remove wire
NEditor.Connector.prototype.removeWire = function(n){
    var i = this.wires.indexOf(n);
    if (i > -1) {
        NEditor.svg.removeChild(n.path);
        NEditor.svg.removeChild(n.line);
        NEditor.svg.removeChild(n.segm);
        this.wires.splice(i, 1);
        this.reset_state();
    }
}


NEditor.Connector.prototype.connectTo = function(n){
    if (n.OutputConn === undefined) {
        console.log("connectTo - not an input");
        return
    }
    var wire = this.add_wire();
    n.apply_wire(wire);
}

/*--------------------------------------------------------
Input Methods */

//Applying a connection from an output
NEditor.Connector.prototype.apply_wire = function(n){

    // if a connection exists, disconnect it.
    if (this.OutputConn != null) {
        this.OutputConn.output.removeWire(this.OutputConn);
    }

    // if moving a connection to here, tell previous input to clear itself.
    if (n.input != null) {
        n.input.clearWire();
    }

    n.input = this;         // Saving this connection as the input reference
    this.OutputConn = n;    // Saving the path reference to this object
    this.reset_state();      // Update the state on both sides of the connection, TODO some kind of event handling scheme would work better maybe
    n.output.reset_state();

    NEditor.update_points(n);
    NEditor.setLineColor(n.line, true);
    NEditor.setPathColor(n.path, true);
    NEditor.setSegmColor(n.segm, true);
}


//clearing the connection from an output
NEditor.Connector.prototype.clearWire = function(){
    if (this.OutputConn != null){
        var tmp = this.OutputConn;
        tmp.input = null;
        this.OutputConn = null;
        this.reset_state();
        return tmp;
    }
}


//###########################################################################
// Node Object
//###########################################################################
NEditor.Node = function(title) {
    this.Title = title;
    this.Inputs = [];
    this.Outputs = [];

    // root
    this.eRoot = document.createElement("div");
    document.body.appendChild(this.eRoot);
    this.eRoot.className = "NodeContainer";
    this.eRoot.ref = this;

    // header
    this.eHeader = document.createElement("header");
    this.eRoot.appendChild(this.eHeader);
    this.eHeader.innerHTML = this.Title;

    // input fields
    if (title=='int' || title=='float') {
        this.input = document.createElement('input')
        this.input.value = 100;
        add_class(this.input, title)
        this.eRoot.appendChild(this.input)
    }

    this.eList = document.createElement("ul");
    this.eRoot.appendChild(this.eList);

    this.eRoot.addEventListener( (tech.ios) ? 'touchstart' : 'mousedown', this.on_root_down);
};



NEditor.Node.prototype.add_input = function(name) { 
    var n = new NEditor.Connector(this.eList, true, name) ;
    this.Inputs.push(n);
    return n;
}


NEditor.Node.prototype.add_output = function(name) {
    var n = new NEditor.Connector(this.eList, false, name);
    this.Outputs.push(n);
    return n;
}


NEditor.Node.prototype.get_input_pos = function(i) {
    return NEditor.get_conn_pos(this.Inputs[i].dot);
}


NEditor.Node.prototype.get_output_pos = function(i) {
    return NEditor.get_conn_pos(this.Outputs[i].dot);
}


NEditor.Node.prototype.update_wires = function() {
    var i;
    for (i=0; i < this.Inputs.length; i++) {
        this.Inputs[i].update_wires();
    }
    for (i=0; i < this.Outputs.length; i++) {
        this.Outputs[i].update_wires();
    }
}


NEditor.Node.prototype.on_root_down = function(e) {
    if (NEditor.onNodeMouseDown(e, e.target)) { return; }
    if (NEditor.onNodeMouseDown(e, e.target.parentNode)) { return; }
    if (NEditor.onNodeMouseDown(e, e.target.parentNode.parentNode)) { return; }
    if (NEditor.onNodeMouseDown(e, e.target.parentNode.parentNode.parentNode)) { return; }
    console.log(e.target);
};



NEditor.Node.prototype.set_params = function(obj){ 
    for (var k in obj) {
        if (k=='pos') {
            this.set_position(obj[k][0], obj[k][1])
        }
        else if (k=='width') {
            this.set_width(obj[k])
        }
    }
}


NEditor.Node.prototype.set_position = function(x,y){
    this.eRoot.style.left = x + "px";
    this.eRoot.style.top  = y + "px";
};


NEditor.Node.prototype.set_width = function(w){ 
    this.eRoot.style.width = w + "px"; 
}

