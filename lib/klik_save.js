// by JSR <jsr@pixmob.com>

// Function to download data to a file
// usage : 
// save_text(["Hello, world!"], "hello world.txt");
function klik_save_text(data, filename, callback=null) {
    var file = new Blob([data], {type: "text/plain;charset=utf-8"});
    var a = document.createElement("a");
    var url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
        if (callback) {
            callback();
        }
    }, 0);    
}

function klik_save_canvas(canvas_element, filename, callback=null) {
    canvas_element.toBlob(function(data_blob) {
        var a = document.createElement("a");
        var url = URL.createObjectURL(data_blob);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
            if (callback) {
                callback();
            }
        }, 0); 
    });
}

