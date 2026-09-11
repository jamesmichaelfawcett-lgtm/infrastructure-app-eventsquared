// by JSR <jsr@pixmob.com>

// warn if overriding existing method
if (Array.prototype.equals) {
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
}

// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    if (!array) { 
        return false; // if the other array is a false value, return
    }

    if (this.length != array.length) { 
        return false; // compare lengths - can save a lot of time 
    }

    for (var i = 0, l=this.length; i < l; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) { // check if we have nested arrays
            if (!this[i].equals(array[i])) { // recurse into the nested arrays
                return false;       
            }
        }           
        else if (this[i] != array[i]) { 
            return false; // Warning - two different object instances will never be equal: {x:20} != {x:20}
        }           
    }       
    return true;
}

// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});