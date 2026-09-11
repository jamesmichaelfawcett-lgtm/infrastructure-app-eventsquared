// by JSR <jsr@pixmob.com>

function klik_polygon_add_point(event) {
    var loc = get('highlighted-location');

    // find at which index we need to insert a new point
    // where the location point is the same as the pt_start
    // and add a point from the already computed test points
    var temp_coords = [];
    for (var i=0; i<loc.coords.length; i++) {
        temp_coords.push(loc.coords[i]);

        if ((loc.coords[i][0]==mouse.test_pts[0][0]) &&
            (loc.coords[i][1]==mouse.test_pts[0][1])) {

            // just add a point from the already computed test points
            // taking a point in the middle of the segment
            var mid_index = Math.floor(mouse.test_pts.length/2);
        
            temp_coords.push(mouse.test_pts[mid_index]); 

            // OR 
            // add a point exactly under the mouse
            // temp_coords.push(mouse.xy_scaled);
             
            continue;
        }
    }

    // new coords
    loc.coords = temp_coords;

    // update location
    set_all(['locations']);
}


function klik_polygon_delete_point(event) {
    var loc = get('highlighted-location');

    var temp_coords = [];
    for (var i=0; i<loc.coords.length; i++) {

        // do not keep this point if the the point under the mouse
        if ((loc.coords[i][0]==location_anchor_point[0]) &&
            (loc.coords[i][1]==location_anchor_point[1])) {

        }
        // keep the other ones
        else {
            temp_coords.push(loc.coords[i]);
        }
    }

    // new coords
    loc.coords = temp_coords;
    
    // update location
    set_all(['locations']);
}

