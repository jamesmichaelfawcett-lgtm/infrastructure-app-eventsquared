// by JSR <jsr@pixmob.com>

function klik_csv_to_object(csv){
    var lines = csv.split('\r\n');
    var result = [];
    var keys = lines[0].split(',');

    for (var i=1;i<lines.length;i++){
        var obj = {};
        var values = lines[i].split(',');

        for (var j=0; j<keys.length; j++) {
            var num = parseInt(values[j].split(' ')[0]);
            
            if (Number.isNaN(num)) {
                obj[keys[j]] = values[j];
            }
            else {
                obj[keys[j]] = num;
            }
        }
        result.push(obj);
    }
    return result;
}