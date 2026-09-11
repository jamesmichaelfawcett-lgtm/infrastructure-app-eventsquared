// by JSR <jsr@pixmob.com>

// specific to the logger (done as a test)


KlikInteractionsManager = function(uid) {

    var self = window[uid] = this; // local and global references to this instance

    this.functions = this.logger_functions;
}


KlikInteractionsManager.prototype.logger_functions = {

    callback : function(data) { 
        modal_btn_1.innerHTML = 'Again';
        modal_btn_2.innerHTML = 'Done';

        console.log(JSON.stringify(data, null, 2))

        modal_notes.innerHTML = data.message;
    },

    log_bookmark : function(id, callback, args) {
        modal_notes.innerHTML = '<p>Adding entry...</p><p>Bookmark in session ' + args.session+'</p>';
        setTimeout(function() {
            callback({
                id: id,
                message : '<p>All good !</p><p>Go bookmark more stuff !</p>',
                data : args,
            }); 
        }, 
        1000 );
    },

    log_friender : function(id, callback, args) {
        modal_notes.innerHTML = '<p>Adding entry...</p><p>Friender in session ' + args.session+'</p>';
        setTimeout(function() {
            callback({
                id: id,
                message : '<p>All good !</p><p>Go make more friends !</p>',
                data : args,
            }); 
        }, 
        1000 );
    },

    log_tracking : function(id, callback, args) {
        modal_notes.innerHTML = '<p>Adding entry...</p><p>Tracking in session ' + args.session+'</p>';
        setTimeout(function() {
            callback({
                id: id,
                message : '<p>All good !</p>Go visit more zones !</p>',
                data : args,
            }); 
        }, 
        1000 );
    },

    log_nothing : function(id, callback, args) {
        modal_notes.innerHTML = '<p>Adding entry...</p><p>Nothing in session ' + args.session+'</p>';
        setTimeout(function() {
            callback({
                id: id,
                message : '<p>All good !</p><p>Please do nothing more often !</p>',
                data : args,
            }); 
        }, 
        1000 );
    }
}

