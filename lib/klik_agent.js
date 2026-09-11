// by JSR <jsr@pixmob.com>

function get_agent() {
	
    console.log(navigator.userAgent);

    if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
        return 'ios';
    }
    else if (navigator.userAgent.match(/(Chrome)/g)) {
        return 'desktop';
    }
    else {
        return 'unknown';
    }
}
