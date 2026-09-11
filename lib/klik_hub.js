// by JSR <jsr@pixmob.com

KlikHub = function(options=null) {
    KlikModule.call(this); // call super constructor

    this.label = 'hub';
    this.localname = 'BRO';
    this.hw_id = null;
    this.commands = []

    for (k in options) {
        this[k] = options[k];
    }

    var self = this;


    this.advertise = function(commands, adv_changes=null) {
        if (self.hw_id==null) {
            return {
                error :'you need to provide a unique hw_id'
            };
        }

        var result = [];

        for (var i in commands) {
            var data = commands[i]
            const key = self.hw_id+'_'+data.duration+'_'+data.payload;

            var adv = {
                localname : self.localname,
                payload   : data.payload,
                duration  : data.duration
            }

            for (k in adv_changes) {
                adv[k] = adv_changes[k];
            }

            // cancel command when duration = 0
            if (adv.duration==0) {
                delete self.commands[key];
            }
            else {
                self.commands[key] = adv; 
            }

            // send to server
            result.push({ 
                hw_id: self.hw_id, 
                advertise: adv 
            });
        }

        return result;
    }


    this.stop = function() {
        return self.advertise(self.commands, { duration:0 });
    }
}


KlikHub.prototype = Object.create(KlikModule.prototype);
KlikHub.prototype.constructor = KlikHub;
