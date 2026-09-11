// by JSR <jsr@pixmob.com>


function klik_log_success(data) {
    app.cout('success', ':', data);
}


function klik_log_error(data) {
    app.cout('error', ':', data);
}


function klik_log_function(args) {
    var fname = args.callee.toString();
    fname = fname.substr('function '.length);
    fname = fname.substr(0, fname.indexOf('('));

    app.cout('function', ':', fname);
}