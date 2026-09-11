// by JSR <jsr@pixmob.com>


function klik_load_file(event) {
    var file = event.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var data = JSON.parse(e.target.result);
        if (data && app.callbacks.on_file_loaded) {
            app.callbacks.on_file_loaded(data);
        }
    };
    reader.readAsText(file);
}


function klik_load_directory(event) {
    // console.log(event.target.files);
    for (var i=0; i<event.target.files.length; i++) {
        klik_read_csv_file(event.target.files[i]);
    }
}


function klik_load_csv_file(event) {
    klik_read_csv_file(event.target.files[0]);
}


function klik_read_csv_file(file) {
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        if (app.callbacks.on_csv_file_loaded) {
            app.callbacks.on_csv_file_loaded(e.target.result, file);
        }
    };
    reader.readAsText(file);
}




    
// Now you can upload directories with both drag and drop and input.

// <input type='file' webkitdirectory >
// and for drag and drop(For webkit browsers).

// Handling drag and drop folders.

// <div id="dropzone"></div>
// <script>
// var dropzone = document.getElementById('dropzone');
// dropzone.ondrop = function(e) {
//   var length = e.dataTransfer.items.length;
//   for (var i = 0; i < length; i++) {
//     var entry = e.dataTransfer.items[i].webkitGetAsEntry();
//     if (entry.isFile) {
//       ... // do whatever you want
//     } else if (entry.isDirectory) {
//       ... // do whatever you want
//     }
//   }
// };
// </script>