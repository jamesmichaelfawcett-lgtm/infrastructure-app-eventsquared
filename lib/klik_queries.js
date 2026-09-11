// by JSR <jsr@pixmob.com>

function query_param(url, param_name) {
    if (!url) {
        url = location.href;
    }
    param_name = param_name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+param_name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    return results == null ? null : results[1];
}