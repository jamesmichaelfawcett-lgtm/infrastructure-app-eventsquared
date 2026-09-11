// by JSR <jsr@pixmob.com

// extending the KlikApi

const CHATBOT_URL = 'https://chatbot-test.klik.co/bot'

// change the conversation model
// POST https://chatbot-test.klik.co/bot/messages
KlikApi.prototype.chatbot_set_messages = function(data, callback) {
    var url = CHATBOT_URL+'/messages'
    klik_http_post(url, data, callback);
}

// retrieve the current conversation model
// GET https://chatbot-test.klik.co/bot/messages
KlikApi.prototype.chatbot_get_messages = function(callback) {
    var url = CHATBOT_URL+'/messages'
    klik_http_get(url, null, callback);
}

// retrieve the last entries from the last 5 minutes, maxed to 500 entries
// GET https://chatbot-test.klik.co/bot/latest
KlikApi.prototype.chatbot_get_latest = function(callback) {
    var url = CHATBOT_URL+'/latest'
    klik_http_get(url, null, callback);
}

// retrieve 500 entries starting at a particular timestamp, you can also change the limit
// GET https://chatbot-test.klik.co/bot/latest?start=2017-01-02T15:04:05.000Z&limit=6
KlikApi.prototype.chatbot_get_latest_with_options = function(options, callback) {
    var params = Object.keys(options).map(function(k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(options[k]);
    }).join('&');
    var url = CHATBOT_URL+'/latest?'+params;
    klik_http_get(url, null, callback);
}

// retrieve the current phone numbers registered
// GET https://chatbot-test.klik.co/bot/phones
KlikApi.prototype.chatbot_get_phones = function(callback) {
    var url = CHATBOT_URL+'/phones'
    klik_http_get(url, null, callback);
}

// delete one phone number
// DELETE https://chatbot-test.klik.co/bot/phones/+15144652453
KlikApi.prototype.chatbot_delete_phone = function(phone_number, callback) {
    var url = CHATBOT_URL+'/phones/'+phone_number
    klik_http_delete(url, callback);
}

// POST https://chatbot-test.klik.co/klik/events/<event_id>/attendees first_name=js last_name=jsr email=jsr@pixmob.com
// KlikApi.prototype.chatbot_add_attendee = function(data, callback) {
//     var url = 'https://chatbot-test.klik.co/klik/events/fuck_test/attendees'+phone_number
//     klik_http_post(url, data, callback);
// }
