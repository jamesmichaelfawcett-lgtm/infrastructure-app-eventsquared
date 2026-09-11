// by JSR <jsr@pixmob.com>

function get_test_box(pt1, pt2, tol) {
    return[
        [ pt1[0]-tol, pt1[1]-tol ],
        [ pt2[0]+tol, pt1[1]-tol ],
        [ pt2[0]+tol, pt2[1]+tol ],
        [ pt1[0]-tol, pt2[1]+tol ] ];
}


function get_test_pts(pt1, pt2, tol) {
    var dx = pt2[0]-pt1[0];
    var dy = pt2[1]-pt1[1];
    var distance = Math.sqrt(dx*dx+dy*dy);
    var sections = Math.floor(distance/tol);
    var offset = [dx/sections, dy/sections];
    var points = [];
    for (var i=0; i<(sections+1); i++) {
        points.push( [pt1[0]+offset[0]*i, pt1[1]+offset[1]*i] );
    }
    return points;
}


function is_inside_circle(x, y, device) {
    if (device === 'undefined') { 
        return false; 
    }
    var dx = device.x - x;
    var dy = device.y - y;
    var d = Math.sqrt(dx*dx + dy*dy);
    return d < device.radius;
}


function is_inside_poly(xy, points) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = xy[0];
    var y = xy[1];
    var inside = false;
    for (var i = 0, j = points.length - 1; i < points.length; j = i++) {
        var xi = points[i][0], yi = points[i][1];
        var xj = points[j][0], yj = points[j][1];
        var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) {
            inside = !inside;
        }
    }
    return inside;
};


function is_inside_box(xy, box) {
    return ( 
        xy[0] >= box.left  && 
        xy[0] <= box.right && 
        xy[1] >= box.top   && 
        xy[1] <= box.bottom 
    );
}


function is_inside_line(xy, pts, tol, scale) {
    for (var i=0; i<pts.length; i++){
        var box = {};
        box.left   = scale*(pts[i][0]-tol);
        box.right  = scale*(pts[i][0]+tol);
        box.top    = scale*(pts[i][1]-tol);
        box.bottom = scale*(pts[i][1]+tol);
        if (is_inside_box(xy, box)) {
            return true;
        }
    }
    return false;
}

