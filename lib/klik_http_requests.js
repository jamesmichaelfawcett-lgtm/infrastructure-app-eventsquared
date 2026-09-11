// by JSR <jsr@pixmob.com>

function klik_http_delete(url, callback_success=null, callback_error=null, authorization=null) {
    var xhr = new XMLHttpRequest();

    // console.log(url);

    // xhr.open('DELETE', url);

    console.log(encodeURI(url));
    xhr.open('DELETE', encodeURI(url));

    if (authorization) {
        xhr.setRequestHeader("Authorization", authorization);
    }

    xhr.onload = function() {
        if (xhr.status === 204) {
            if (callback_success) {
                if (xhr.responseText=='') {
                    callback_success({success:true});
                }
                else {
                    callback_success(JSON.parse(xhr.responseText));
                }
            }
        }
        else {
            console.log('http DELETE - unhandled status:', xhr.status, xhr.responseText );
            if (callback_error) {
                callback_error({status:xhr.status, message:xhr.responseText });
            }
        }
    };
    xhr.send();
}


function klik_http_get(url, namespace=null, callback_success=null, callback_error=null, authorization=null) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', encodeURI(url) ); // if 3rd arg = false = sync
    xhr.setRequestHeader('Content-Type', 'application/json');

    // max timeout in seconds, for longer requests
    // xhr.timeout = 10000;

    if (authorization) {
        xhr.setRequestHeader("Authorization", authorization);
    }

    xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 201) {
            var result = JSON.parse(xhr.responseText)
            if (namespace) {
                try {
                    if (app.callbacks.on_app_data) {
                        app.callbacks.on_app_data(namespace, result);
                    }
                }
                catch(e) {
                    // console.log(e);
                }
            }
            if (callback_success) {
                callback_success(result); 
            }
        }
        else {
            console.log('http GET - unhandled status:', xhr.status, xhr.responseText );
            if (callback_error) {
                callback_error({status:xhr.status, message:xhr.responseText });
            }
        }
    };

    // xhr.onprogress = function(event) { // triggers periodically
    //     // event.loaded - how many bytes downloaded
    //     // event.lengthComputable = true if the server sent Content-Length header
    //     // event.total - total number of bytes (if lengthComputable)
    //     alert(`Received ${event.loaded} of ${event.total}`);
    // };

    xhr.send();
}

// var uri = "my test.asp?name=ståle&car=saab";
// var res = encodeURI(uri);

function klik_http_put(url, data, callback_success=null, callback_error=null, authorization=null) {
    var xhr = new XMLHttpRequest();
    xhr.open('PUT', encodeURI(url));
    xhr.setRequestHeader('Content-Type', 'application/json');

    if (authorization) {
        xhr.setRequestHeader("Authorization", authorization);
    }

    xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 201) {
            if (callback_success) {
                if (xhr.responseText=='') {
                    callback_success();
                }
                else {
                    callback_success(JSON.parse(xhr.responseText));
                }
            }
        }
        else {
            console.log('http PUT - unhandled status:', xhr.status, xhr.responseText );
            if (callback_error) {
                callback_error({status:xhr.status, message:xhr.responseText });
            }
        }
    };
    xhr.send(JSON.stringify(data));
}


function klik_http_post(url, data, callback_success=null, callback_error=null, authorization=null) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', encodeURI(url));
    xhr.setRequestHeader('Content-Type', 'application/json');

    if (authorization) {
        xhr.setRequestHeader("Authorization", authorization);
    }
    
    xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 201 || xhr.status === 0) {
            if (callback_success) {
                if (xhr.responseText=='') {
                    callback_success();
                }
                else {
                    callback_success(JSON.parse(xhr.responseText));
                }
            }
        }
        else {
            if (xhr.status == 202) {
                // multifactor authentication (is handled inside the callback_error in klik_api)
            }
            else {
                console.log('http POST - unhandled status:', xhr.status, xhr.responseText ); 
            }
            
            if (callback_error) {
                callback_error({status:xhr.status, message:xhr.responseText });
            }
        }
    };
    xhr.send(JSON.stringify(data));
}

