// by JSR <jsr@pixmob.com

// for touch device

var distance_current, distance_last;


function klik_calc_distance(event) {
    var result =  {'delta':0, 'center':[0,0]};
    var pt1 = [event.touches.item(0).pageX, event.touches.item(0).pageY];
    var pt2 = [event.touches.item(1).pageX, event.touches.item(1).pageY];
    var dx = pt2[0]-pt1[0];
    var dy = pt2[1]-pt1[1];
    distance_current = Math.sqrt(dx*dx+dy*dy);
    if (distance_last!=0) {
        result.delta = distance_current-distance_last;
        result.center = [pt1[0]+dx/2, pt1[1]+dy/2];
    }
    distance_last = distance_current;
    return result;
}

function klik_disable_panning(element=document.body) {

    // no overflow, no scrollbar
    element.style.overflow = 'hidden'; 

    // disable panning on touch devices
    element.ontouchmove  = function(e){ e.preventDefault(); }
}

function klik_handle_touchmove(event) {
    event.preventDefault();
    var obj = null;
    
    if (event.touches.length == 1 ) { // moving items or panning map using 1 finger
        var x = event.touches.item(0).pageX;
        var y = event.touches.item(0).pageY;

        obj = {
            'clientX':x, 
            'clientY':y, 
            'event':event
        };
    }
    else if (event.touches.length == 2 ) { // zooming with 2 fingers
        try {
            var distance = klik_calc_distance(event);
            if (distance.delta) {
                obj = {
                    'zoom' :{
                        'value': Math.exp((distance.delta/2) * ZOOM_INTENSITY),
                        'point': distance.center, 
                        'delta': distance.delta, 
                    },
                    'event':event
                };
            }
        }
        catch (e) {
           
        }
    }
    else if (event.touches.length == 3 ) {  // you can add more interactions

    }
    return obj;
}

function klik_handle_touchstart(event) {
    var obj = null
    try {
        var x = event.changedTouches.item(0).pageX; // good for ipad
        var y = event.changedTouches.item(0).pageY;
        obj = {
            'clientX':x, 
            'clientY':y, 
            'button':0, 
            'event':event
        };
        distance_last = 0;  
    }
    catch (e) {
    }
    return obj;
}

function klik_handle_touchend(event) {
    var obj = null;
    try {
        var x = event.changedTouches.item(0).pageX; // good for ipad
        var y = event.changedTouches.item(0).pageY;
        obj = {
            'clientX':x, 
            'clientY':y, 
            'button':0, 
            'event':event
        };
        distance_last = 0;
    }
    catch (e) { 
    }
    return obj;
}
