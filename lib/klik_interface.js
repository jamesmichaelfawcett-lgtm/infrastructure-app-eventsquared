// by JSR <jsr@pixmob.com>

// Klik interface allowing us to talk to the pixels : hub, ipad, etc


KlikInterface = function(options=null) {
    KlikModule.call(this); // call super constructor

    // set some defaults
    this.label = 'interface';
    this.value = null;

    // you can overwrite the defaults
    for (k in options) {
        this[k] = options[k];
    }

    this.sections = [];

    var style_label = 'height:auto; width:calc(100% - 20px); display:inline-block; color:#789; font-size:17px; ';
    var style_input = 'height:40; width:100%; min-height:40; color:#fff; vertical-align:top; text-align:left; line-height:1.8; resize:vertical';

    this.navigation = [
        { title:'Interface', content:[
            { _t:'tab', _l:'NONE' },
            { _t:'tab', _l:'REMOTE' }, 
            { _t:'tab', _l:'LOCAL'}, // _c:'selected' 
            // { _t:'tab', _l:'ALL'}, 

            // targets 
            { _t:'label', _l:'targets', _s:style_label},
            { _t:'textarea', _s:style_input},
            
            // online - assigned to your project
            { _t:'label', _l:'available', _s:style_label},
            { _t:'textarea', _s:style_input},
            
            // offline - assigned to your project
            { _t:'label', _l:'offline', _s:style_label},
            { _t:'textarea', _s:style_input},
            
            // unassigned
            { _t:'label', _l:'unassigned', _s:style_label},
            { _t:'textarea', _s:style_input},

            // toggles - targets
            { _t:'label', _l:'targets - click to remove', _s:style_label},
            { _t:'div', _s:style_input},

            // toggles - available
            { _t:'label', _l:'assigned hubs - click to add to targets', _s:style_label},
            { _t:'div', _s:style_input},
        ]},
    ];


    klik_ui_adjust_navigation(this.navigation, this.uid);

    
    var self = this;

    this.update_ui = function(value) {
        var iface = null;

        if (value=='NONE') {
            for (var k in self.targets) {
                hide(self.labels[k]);
                hide(self.targets[k]);
            }
            iface = 'NONE';
        }

        else if (value=='LOCAL') {
            for (var k in self.targets) {
                hide(self.labels[k]);
                hide(self.targets[k]);
            }
            iface = 'LOCAL';
        }

        else if (value=='REMOTE') {
            for (var k in self.targets) {
                show(self.labels[k], 'inline-block');
                show(self.targets[k]);
            }
            iface = 'REMOTE';
        }

        else if (value=='ALL') {
            for (var k in self.targets) {
                show(self.labels[k], 'inline-block');
                show(self.targets[k]);
            }
            iface = 'ALL';
        }

        self.keep_things_hidden();

        return iface;
    }


    // define handlers
    this.callbacks = {
        onmouseup : function(event) {
            if (self.on_interface_change) {
                var value = event.target.innerText;
   
                var iface = self.update_ui(value);
           
                if (iface!=null) {
                    self.value = iface;
                    self.on_interface_change(self.value);
                }
            }
        },

        oninput : function(event) {

            if (self.on_hubs_change) {
                var hubs = event.target.value;

                for (var k in self.targets) {
                    if (self.targets[k] == event.target) {
                        self.on_hubs_change(k, hubs);
                        return;
                    }
                }
            }
        },
    }

    
    // init ui
    this.sections = tech.append_navigation(this.navigation, this.callbacks);


    // this.labels = {
    //     user        : by_id(this.uid+'_0_4'),
    //     online      : by_id(this.uid+'_0_6'),
    //     offline     : by_id(this.uid+'_0_8'),
    //     unassigned  : by_id(this.uid+'_0_10'),
    // }

    // this.targets = {
    //     user        : by_id(this.uid+'_0_5'),
    //     online      : by_id(this.uid+'_0_7'),
    //     offline     : by_id(this.uid+'_0_9'),
    //     unassigned  : by_id(this.uid+'_0_11'),
    // }



    this.labels = {
        user        : by_id(this.uid+'_0_3'),
        online      : by_id(this.uid+'_0_5'),
        offline     : by_id(this.uid+'_0_7'),
        unassigned  : by_id(this.uid+'_0_9'),
        toggles_1   : by_id(this.uid+'_0_11'),
        toggles_2   : by_id(this.uid+'_0_13'),
    }

    this.targets = {
        user        : by_id(this.uid+'_0_4'),
        online      : by_id(this.uid+'_0_6'),
        offline     : by_id(this.uid+'_0_8'),
        unassigned  : by_id(this.uid+'_0_10'),
        toggles_1   : by_id(this.uid+'_0_12'),
        toggles_2   : by_id(this.uid+'_0_14'),
    }

    this.keep_hidden =  {
        user        : false,
        online      : true,
        offline     : true,
        unassigned  : true,
    }

    this.keep_things_hidden = function() {
        for (k in this.keep_hidden) {
            if (this.keep_hidden[k]) {
                hide(this.targets[k]);
                hide(this.labels[k]);
            }
        }  
    }

    this.keep_things_hidden();


    this.set_targets = function(status, value) {
        self.targets[status].value = value;

        if (status=='user' || status=='online') {
            var arr_user = self.targets['user'].value.split(',');
            var arr_online = self.targets['online'].value.split(',');

            self.rebuild_targets_toggles(arr_user, arr_online);
        }
    }


    this.add_target = function(status, value) {
        if (self.targets[status].value.match(value)) {
            return;
        }
        var arr = self.targets[status].value.split(',');

        if (arr[0]=='') {
            arr = value;
        }
        else {
            arr.push(value);
        }
        
        self.targets[status].value = arr;

        if (self.on_hubs_change) {
            self.on_hubs_change(status, self.targets[status].value);  
        }
    }


    this.remove_target = function(status, value) {
        if (!self.targets[status].value.match(value)) {
            return;
        }
        var arr = self.targets[status].value.split(',');

        var i = arr.indexOf(value);
        if (i > -1) {
            arr.splice(i, 1);
        }

        self.targets[status].value = arr;

        if (self.on_hubs_change) {
            self.on_hubs_change(status, self.targets[status].value);  
        }
    }


    // set value, no callbacks
    this.set_value = function(value) {
        self.value = value;
        self.update_ui(self.value);

        klik_ui_tab_select(self.sections[0], self.value);
    }


    // make sure we cannot change online targets manually
    // this.targets.online.style.pointerEvents = 'none';

    // promote all online targets to the user targets
    this.labels.online.style.cursor = 'pointer';
    this.labels.online.onmousedown = function(event) {
        self.on_hubs_change('user', self.targets.online.value);
    }


    this.labels.unassigned.style.cursor = 'pointer';
    this.labels.unassigned.onmousedown = function(event) {
        // console.log('do you want to assign ?');
    }


    // setup toggles


    this.targets.toggles_1.style.display    = this.targets.toggles_2.style.position  = 'inline-block';
    this.targets.toggles_1.style.width      = this.targets.toggles_2.style.width  = '100%';
    this.targets.toggles_1.style.minWidth   = this.targets.toggles_2.style.minWidth  = 118;
    this.targets.toggles_1.style.height     = this.targets.toggles_2.style.height = 'auto';
    this.targets.toggles_1.style.backgroundColor = this.targets.toggles_2.style.backgroundColor = '#456';

    var style = 'color:white; width:auto; border:1px solid #123; margin:2px;';

    
    this.rebuild_targets_toggles = function(targets_user, targets_available) {

        // clear
        while (self.targets.toggles_1.firstChild) {
            self.targets.toggles_1.removeChild(self.targets.toggles_1.firstChild);
        }

        // for removing target hubs
        for (var i in targets_user) {

            if (targets_user[i]!='') {
                var item = add_node(self.targets.toggles_1, 'button',  {
                    _c:'small',
                    _l:targets_user[i],
                    _s:style,
                });

                item.onclick = function(event) {
                    self.remove_target('user', event.target.innerText);
                }
            }
        }


        // clear
        while (self.targets.toggles_2.firstChild) {
            self.targets.toggles_2.removeChild(self.targets.toggles_2.firstChild);
        }

        // for adding available hubs
        for (var i in targets_available) {
            if (targets_available[i]!='') {
                var item = add_node(self.targets.toggles_2, 'button',  {
                    _c:'small',
                    _l:targets_available[i],
                    _s:style,
                });

                item.onclick = function(event) {
                    self.add_target('user', event.target.innerText);
                }
            }
        }
    }


    // var test_items = [
    //     'hubdroid-0001',
    //     'hubdroid-0002',
    //     'hubdroid-0003',
    //     'hubdroid-0004',
    // ]

    // self.rebuild_targets_toggles(test_items, test_items);

}


KlikInterface.prototype = Object.create(KlikModule.prototype);
KlikInterface.prototype.constructor = KlikInterface;
