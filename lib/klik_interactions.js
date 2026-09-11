// by JSR <jsr@pixmob.com>


var KlikInteractions = function(uid, interactions_manager=null) {

    // local and global references to this instance
    var self = window[uid] = this;

    var controller = null;

    if (interactions_manager) {
        controller = interactions_manager.functions;
    }

    if (controller && controller.callback) {
        this.cb = controller.callback;
    }
    else {
        this.cb = this.default_callback;
    }

    var get_function = function(action_name) {
        if (controller && controller[action_name]) {
            return controller[action_name];
        }
        else {
            return self.default_functions[action_name];
        }
    }

    this.authorized_actions = [
        'tag_scan',

        'tag_convert',

        'tag_assign', 
        'tag_config', 
        'tag_delete', 
        'tag_cancel', 

        'tag_undo', 
        'tag_redo', 
        'tag_identify', 
        'tag_monitor',
        'tag_clone', 

        'log_bookmark',
        'log_friender', 
        'log_tracking', 
        'log_nothing',
    ];

    this.actions = {};
    for (var i in this.authorized_actions) {
        var aa = this.authorized_actions[i];
        this.actions[aa] = {
            func     : get_function(aa) , 
            callback : this.cb  // applying same callback to all
        }; 
    }
};


KlikInteractions.prototype.go = function(action_name, args) {
    if (this.actions[action_name]) {
        var func     = this.actions[action_name].func;
        var callback = this.actions[action_name].callback;

        func(action_name, callback, args);
    }
    else {
        this.cb({
            id: 'error',
            message: 'unauthorized action'
        });
    }
}


KlikInteractions.prototype.default_callback = function(data) {
    if      (data.id==='tag_scan')      { console.log('default_callback - tag scanned'      , data) }
    else if (data.id==='tag_add')       { console.log('default_callback - tag added'        , data) }
    else if (data.id==='tag_delete')    { console.log('default_callback - tag deleted'      , data) }
    else if (data.id==='tag_clone')     { console.log('default_callback - tag cloned'       , data) }

    else if (data.id==='log_bookmark')  { console.log('default_callback - logged bookmark'  , data) }
    else if (data.id==='log_friender')  { console.log('default_callback - logged friender'  , data) }
    else if (data.id==='log_tracking')  { console.log('default_callback - logged tracking'  , data) }
    else if (data.id==='log_nothing')   { console.log('default_callback - logged nothing'   , data) }
    
    else if (data.id==='error') {
        console.log('default_callback - error data', data);
    }
    else { 
        console.log('default_callback - unhandled data', data);
    }
}


KlikInteractions.prototype.default_functions = {
    // UI TAGS
    tag_scan : function(id, callback) {
        console.log('default_functions -', id);
        setTimeout(function() { 
            callback({
                id: id,
                tag: 'TAG1234',
            }); 
        },
        500 );
    },

    tag_convert : function(id, callback) {
        console.log('default_functions -', id);
        setTimeout(function() { 
            callback({
                id: id,
                tag: 'TAG1234',
            }); 
        }, 
        500 );
    },

    tag_assign : function(id, callback) {
        console.log('default_functions -', id);
        setTimeout(function() { 
            callback({
                id: id,
                tag: 'TAG1234',
            }); 
        }, 
        500 );
    },

    tag_config : function(id, callback) {
        console.log('default_functions -', id);
        setTimeout(function() { 
            callback({
                id: id,
                tag: 'TAG1234',
            }); 
        }, 
        500 );
    },

    tag_delete: function(id, callback) {
        console.log('default_functions -', id);
        setTimeout(function() { 
            callback({
                id: id,
                tag: 'TAG1234',
            }); 
        }, 
        500 );
    },

    tag_cancel : function(id, callback) {
        console.log('default_functions -', id);
        setTimeout(function() {
            callback({
                id: id,
                tag: 'TAG1234'
            }); 
        }, 
        500 );
    },

    tag_undo : function(id, callback) {
        console.log('default_functions -', id);
        setTimeout(function() {
            callback({
                id: id,
                tag: 'TAG1234'
            }); 
        }, 
        500 );
    },

    tag_redo : function(id, callback) {
        console.log('default_functions -', id);
        setTimeout(function() {
            callback({
                id: id,
                tag: 'TAG1234'
            }); 
        }, 
        500 );
    },

    tag_identify : function(id, callback) {
        console.log('default_functions -', id);
        setTimeout(function() {
            callback({
                id: id,
                tag: 'TAG1234'
            }); 
        }, 
        500 );
    },

    tag_monitor : function(id, callback) {
        console.log('default_functions -', id);
        setTimeout(function() {
            callback({
                id: id,
                tag: 'TAG1234'
            }); 
        }, 
        500 );
    },

    tag_clone : function(id, callback) {
        console.log('default_functions -', id);
        setTimeout(function() {
            callback({
                id: id,
                tag: 'TAG1234'
            }); 
        }, 
        500 );
    },


    // UI TAGS

    log_bookmark : function(id, callback) {
        console.log('default_functions -', id);
        setTimeout(function() {
            callback({
                id: id
            }); 
        }, 
        500 );
    },

    log_friender : function(id, callback) {
        console.log('default_functions -', id);
        setTimeout(function() {
            callback({
                id: id
            }); 
        }, 
        500 );
    },

    log_tracking : function(id, callback) {
        console.log('default_functions -', id);
        setTimeout(function() {
            callback({
                id: id
            }); 
        }, 
        500 );
    },

    log_nothing : function(id, callback) {
        console.log('default_functions -', id);
        setTimeout(function() {
            callback({
                id: id
            }); 
        }, 
        500 );
    }
}

