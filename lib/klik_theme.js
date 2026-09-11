// by JSR <jsr@pixmob.com

function make_css_color(red, green, blue) {
    return 'rgb(' + red + ', ' + green + ',' + blue +')';    
}

KlikTheme = function() {
    this.update();
};

KlikTheme.prototype.update = function() {
    this.css = window.getComputedStyle(document.body);
    this.color = {
        main        : this.css.getPropertyValue('--color_main'         ),
        middle      : this.css.getPropertyValue('--color_middle'       ),
        dark        : this.css.getPropertyValue('--color_dark'         ),
        urgent      : this.css.getPropertyValue('--color_urgent'       ), 
        background  : this.css.getPropertyValue('--color_background'   ),
        over        : this.css.getPropertyValue('--color_over'         ),
        down        : this.css.getPropertyValue('--color_down'         ),
        
        light       : this.css.getPropertyValue('--color_light'        ),
        healthy     : this.css.getPropertyValue('--color_healthy'      ),
        warning     : this.css.getPropertyValue('--color_warning'      ),
        critical    : this.css.getPropertyValue('--color_critical'     ),
    }
}