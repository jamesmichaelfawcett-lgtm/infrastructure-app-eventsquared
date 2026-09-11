// by JSR <jsr@pixmob.com>


var klik_counter_proto =  {
	zone : null,
	system : -1,
	manual : -1,
	mobile : -1,
	trust  : 100,
}

var klik_counters = []


var klik_counters_colors = {
    live   : klik_blue,
    system : klik_cyan,
    manual : klik_red,
    mobile : klik_orange,
}

function klik_counters_update() {

	// for all locations we need to store a manual counter
	for (var i=0; i<locations.length; i++) {
		klik_counters[i] = Utils.clone(klik_counter_proto);
		klik_counters[i].zone = locations[i].name;

		// check all mobiles devices from the infrastucture
		// and if the current device location and the location[i] is the same
		// we take the most recent entry that have the same location name.x
		// we are assuming entries have been entered in chronologically
	    for (var j=0; j<items.mobiles.length; j++) {
	        if (items.mobiles[j].custom.zone == locations[i].name) {
	            var entries = Utils.clone(items.mobiles[j].custom.history.entries);
	            entries.reverse();
	            for (var k=0; k<entries.length; k++) {
	                if (entries[k].zone===locations[i].name) {
	                	// get most recent entries for this location
	                	klik_counters[i].system = entries[k].system_counter;
	                    klik_counters[i].manual = entries[k].manual_counter;
	                    klik_counters[i].mobile = entries[k].mobile_counter;
	                    klik_counters[i].zone   = entries[k].zone;
	                    klik_counters[i].trust  = entries[k].trust;
	                    break;
	                }
	            }
	        }
	    }
	}
}

