// by JSR <jsr@pixmob.com>

// this was valid for the version of the hub that Ahmed did a while
// back, and it is not compatible with the production hub1 or the
// prototype hub2


// --------------------------------------------------------------
// constructor
// --------------------------------------------------------------

KlikHubApi = function(host, port) {
    this.host = host;
    this.port = port;
    this.intervals = {};
};

KlikHubApi.prototype.host_port = function() {
    return 'http://'+this.host+':'+this.port;
}



// --------------------------------------------------------------
// api calls
// --------------------------------------------------------------


KlikHubApi.prototype.get_status = function(callback) {
    $.ajax({
        url: this.host_port()+'/hub_get_status',
        method: 'GET',
        success: function(response) {
            if (callback) {
                callback(response);
            }
        }
    });           
}


KlikHubApi.prototype.set_ble = function(data) {
    console.log(data)
    $.ajax({
        url: this.host_port()+'/ble_send_data',
        method: 'POST',
        data: {'data':data},
        success: function(response) {
            // console.log(response);
        }
    });            
}


KlikHubApi.prototype.set_config = function(data) {
    console.log(data)
    $.ajax({
        url: this.host_port()+'/hub_set_config',
        method: 'POST',
        data: data,
        success: function(response) {
           // console.log(response);
        }
    });            
}


// curl http://10.10.11.58:1080/db_hub_get_mac?hubnum=HUB-001
// curl http://10.10.11.58:1080/db_hub_get_mac?hubnum=01
KlikHubApi.prototype.get_hub_mac = function(hub_id, callback) {
    $.ajax({
        url: this.host_port()+'/db_hub_get_mac',
        method: 'GET',
        data: {'hubnum':hub_id},
        success: function(response) {
            if (callback) {
                callback(response);
            }
        }
    });           
}


// curl http://10.10.11.58:1080/db_beacon_get_mac?bcnum=BC-001
// curl http://10.10.11.58:1080/db_beacon_get_mac?bcnum=01
KlikHubApi.prototype.get_beacon_mac = function(beacon_id, callback) {
    $.ajax({
        url: this.host_port()+'/db_beacon_get_mac',
        method: 'GET',
        data: {'bcnum':beacon_id},
        success: function(response) {
            if (callback) {
                callback(response);
            }
        }
    });           
}


// curl http://10.10.11.58:1080/db_beacon_get_num?bcmac=40:E9:CD:35
KlikHubApi.prototype.get_beacon_num = function(beacon_mac, callback) {
    $.ajax({
        url: this.host_port()+'/db_beacon_get_num',
        method: 'GET',
        data: {'bcmac':beacon_mac},
        success: function(response) {
            if (callback) {
                callback(response);
            }
        }
    });           
}



// --------------------------------------------------------------
// automation
// --------------------------------------------------------------

KlikHubApi.prototype.auto_set_ble = function(interval=500, data) {
    var self = this;
    clearInterval(self.intervals['auto_set_ble']);
    self.intervals['auto_set_ble'] = setInterval(function() { 
        self.set_ble(data);
    }, interval);  
    return self;
}


KlikHubApi.prototype.auto_get_status = function(interval=500, callback) {
    var self = this;
    clearInterval(self.intervals['auto_get_status']);
    self.intervals['auto_get_status'] = setInterval(function() { 
        self.get_status(callback);
    }, interval);  
    return self;
}



// --------------------------------------------------------------
// tests
// --------------------------------------------------------------

KlikHubApi.prototype.test_api = function() {

    // set ble packet (green)
    this.auto_set_ble(1000, 'tx 06FFE000FF0007040942524F');

    // get current status
    this.auto_get_status(600, update_status_ui);

    // change hub config
    config = {};
    config.broadcaster = "on";
    config.bridge_ble  = "on";
    config.bridge_xbee = "on";
    this.set_config(config);

    // get the mac of a hub mac from its number
    this.get_hub_mac('HUB-001', console.log);
    this.get_hub_mac('HUB-002', console.log);
    this.get_hub_mac('HUB-003', console.log);

    // get the mac of a beacon from its number
    this.get_beacon_mac('BC-001', console.log);
    this.get_beacon_mac('BC-002', console.log);
    this.get_beacon_mac('BC-003', console.log);

    // get the number of a beacon from its mac
    this.get_beacon_num('40:FB:A1:F2', console.log);
    this.get_beacon_num('40:FB:A1:E8', console.log);
    this.get_beacon_num('40:FB:A1:F6', console.log);
}


