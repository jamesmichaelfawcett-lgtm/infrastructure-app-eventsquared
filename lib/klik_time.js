// by JSR <jsr@pixmob.com>

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length<(size||2)) s='0'+s;
    return s;
}

// start = time in second
function time_since(start) {
    var diff = (new Date() - new Date(start*1000))/1000.; 
    return {
        d: Math.floor(diff/(3600*24)),
        h: Math.floor(diff/3600)%24,
        m: Math.floor(diff/60)%60,
        s: Math.floor(diff)%60
    }
}


function hh_mm_ss_since(start, append=null) {
    var t = time_since(start);
    var hh_mm_ss = (t.h).pad(2)+':'+(t.m).pad(2) +':'+(t.s).pad(2);
    var s ;
    if (t.d==0) {
        s = hh_mm_ss;
    }
    else if (t.d==1) {
        s = t.d +' day ' + hh_mm_ss;
    }
    else {
        s = t.d +' days ' + hh_mm_ss;
    }

    if (append)
        s+= ' '+append
    return s;
}


function date_now(last_heard) {
    return new Date(last_heard*1000);
}


Date.prototype.YYMMDD_hhmmss = function() {
    var MM = this.getMonth() + 1; // getMonth() is zero-based
    var DD = this.getDate();
    var hh = this.getHours();
    var mm = this.getMinutes();
    var ss = this.getSeconds();
    return [
        this.getFullYear(),
        (MM>9?'':'0')+MM,
        (DD>9?'':'0')+DD, '_',
        (hh>9?'':'0')+hh,
        (mm>9?'':'0')+mm,
        (ss>9?'':'0')+ss,
    ].join('');
};