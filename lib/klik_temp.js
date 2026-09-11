// by JSR <jsr@pixmob.com

// Random useless code (for now)
// more like a cheatsheet 


// function goto_cpanel() {
//     var win = window.open("", "Title", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=1300, height="+(screen.height)+", top=0, left="+(screen.width-1300));
//     //win.document.location = '../_.html';
//     win.document.location = 'https://staging.klik.co';
// }

// ctx.setLineDash([10, 10]);

// this is how you get the current script content
// var scripts = document.getElementsByTagName( 'script' );
// var me = scripts[ scripts.length - 1 ];

// function auto_zoom(time, target_scale, target_point, callback) {
//     var zoom = {'scale':viewports[vp].scale};
//     delta = 0;
//     $(zoom).animate({'scale':target_scale}, {
//         duration:time,  
//         step: function(){
//             var zoom_point = target_point;
//             var zoom_scale = zoom['scale']/viewports[vp].scale;
//             viewports[vp].zoom(zoom_scale, zoom_point);  
//         },
//         complete: function() {
//             callback();
//         }
//     });
// }

// mouse.position_on_canvas = function(viewport_id, event) {
//     var rect = viewports[vp].canvas.getBoundingClientRect();
//     return {
//         x: (event.clientX - rect.left),
//         y: (event.clientY - rect.top)
//     };
// }


 // var SCALE_ORIGIN = viewports[vp].scale;
        // var SCALE_TARGET = 5;
        // var pt = [event.clientX, event.clientY];
        // pt[0] += (event.clientX-window.innerWidth/2)/SCALE_TARGET; // relative to center
        // pt[1] += (event.clientY-window.innerHeight/2)/SCALE_TARGET;
        // auto_zoom(1000, SCALE_TARGET, pt, function() {
        //     auto_zoom(500, SCALE_ORIGIN, pt, function() {
        //        
        //     });
        // });


// function start_auto_zoom(beacon_id) {
//     if (beacon_id<1) {//beacons.length) {
//         index.beacon = beacon_id;
//         highlighted.beacon = beacon_id;

//         // This will zoom in and bring the beacon in the center
//         var old_scale = viewports[vp].scale;
//         var new_scale = 1.0;
        
//         // this one is good for using the mouse
//         // var dx_to_center = (window.innerWidth /2-event.clientX)/new_scale;
//         // var dy_to_center = (window.innerHeight/2-event.clientY)/new_scale;
//         // var pt = [event.clientX-dx_to_center*old_scale,
//         //           event.clientY-dy_to_center*old_scale];

//         // good for beacon.x and y
//         // var bc = beacons[beacon_id];
//         // var dx_to_center = (window.innerWidth /2-bc.x)/new_scale;
//         // var dy_to_center = (window.innerHeight/2-bc.y)/new_scale;
//         // var pt = [bc.x-dx_to_center*old_scale,
//         //           bc.y-dy_to_center*old_scale];

//         var bc = beacons[beacon_id];
//         var dx_to_center = (window.innerWidth /2-bc.x);
//         var dy_to_center = (window.innerHeight/2-bc.y);
//         var pt = [bc.x-dx_to_center*viewports[vp].scale,
//                   bc.y-dy_to_center*viewports[vp].scale];

//         auto_pan(1000,  delta, function() {
//             // auto_zoom(100, old_scale, pt, function() {
//                 //start_auto_zoom(++beacon_id);

//             // });
//         });
//     }
// }


// function pan(duration, target, callback) {
//     var start = viewports[vp].origin;
//     var counter = 0;
//     var steps = duration/33.3333;
//     var dx = last_x-target[0];
//     var dy = last_y-target[1];

//     var jump_x = dx/steps;
//     var jump_y = dy/steps;

//     var x = 0;
//     var y = 0;

//     var offset_x = last_x;
//     var offset_y = last_y;

//     // console.log('steps:', steps,', dx:', dx, ' dy:', dy);
//     var interval = setInterval(function() {
//         offset_x+=jump_x;
//         offset_y+=jump_y;
//         x = last_x+offset_x;
//         y = last_y+offset_y;
//         viewports[vp].pan(x,y);  
//         console.log(x,y)
//         if(++counter>=steps){
//             clearInterval(interval);
//             last_x = x;
//             last_y = y;
//             callback();
//         }
//     },  33.333);        
// }

// function start_auto_pan(beacon_id) {
//      if (beacon_id<beacons.length) {
//         index.beacon = beacon_id;
//         highlighted.beacon = beacon_id;
//         var bc = get_beacon();
//         var time  = 300.0;
//         var point = [bc.x, bc.y];

//         pan(time, point, function() {
//             console.log('done pan:', beacon_id);
//             start_auto_pan(++beacon_id);
//         });
//     }
// }


// for efficient push do this : 
// myArray[myArray.length] = XX ;

// for efficient pop do this
// var last=myArray[myArray.length--] ;

// best to allocate like this once, than using push all the time
// - operate on fixed sized arrays whenever possible.
// - using over-sized array is way better than changing often the size.
// function allocate_array(size, initial_value){
//     var arr = new Array(size); 
//     var i=0;
//     while (i<n) { 
//         arr[i]=initial_value;
//         i++; 
//     }
//     return arr;
// }

// function clear_array(array){
//     for (var i=0; i<array.size; i++) {
//         array[i] = null;
//         //delete array[i]; 
//     }
// }

// this unshift is around 4 to 10 times faster than the original
// (http://jsperf.com/array-unshift-vs-prepend/8)
// var unshift_array = function (arr, item) {
//     var len=arr.length;
//     while (len) { 
//         arr[len] = arr[len-1]; 
//         len--;
//     }
//     arr[0] = item;
// };
         

// var index_of = function(arr, item) {
//     for (var i=0, len=arr.length; i!=len ; i++) {
//         if (arr[i] === item) { 
//             return i;
//         }
//     }
//     return -1;
// };

// var last_index_of = function(arr, item) {
//     var i=arr.length;
//     while (i--) {
//         if (arr[i] === item) { 
//             break;
//         }
//     }
//     return i;
// };

