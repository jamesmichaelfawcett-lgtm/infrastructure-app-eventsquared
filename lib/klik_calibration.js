// by JSR <jsr@pixmob.com>

function get_location_tuner_url(loc) {
    var url = './tuner.html';
    url += "?env="+api.env_name;
    url += "&event="+api.event;
   
    if (loc) {
        var inside = [];
        var outside = [];

        for (var i=0; i<items.sentinelles.length; i++) {
            if (loc.name == items.sentinelles[i].custom.assigned_zone) {
                inside.push(items.sentinelles[i].id);
            }
            else {
                outside.push(items.sentinelles[i].id);
            }
        }

        if (inside.length>0) {
            url += "&sentinelles_in="+inside;
        }

        if (outside.length>0) {
            url += "&sentinelles_out="+outside;
        }

        url += "#"+loc.display_name;
    }
    return url
}

function calibrate_location(event) {
    var loc = get('highlighted-location');
    window.open(get_location_tuner_url(loc), '_blank');
}
