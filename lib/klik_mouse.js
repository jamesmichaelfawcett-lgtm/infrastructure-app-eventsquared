// by JSR <jsr@pixmob.com>

function klik_mouse_event(node, event_type) {
    var event = document.createEvent('MouseEvents');
    event.initEvent(event_type, true, true);
    node.dispatchEvent(event);
}