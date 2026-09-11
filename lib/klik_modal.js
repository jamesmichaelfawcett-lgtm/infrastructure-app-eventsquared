// by JSR <jsr@pixmob.com

const klik_modal_max_buttons = 256;

function klik_page_scrolling(state) {
    if (state) {
        document.body.style.overflow = ''; // allow scrolling 
        document.body.ontouchmove = function(e) { // allow scrolling on touch devices; 
            return true;
        } 
    }
    else {
        document.body.style.overflow = 'hidden'; 
        document.body.ontouchmove = function(e){ 
            e.preventDefault();
        }
    }
}


function klik_modal_view_handle_key(event) {
    if (event.keyCode==27) { // escape
        event.stopPropagation();
        klik_modal_close();
    } 
}


function klik_modal_open(event, event_handler=null) {
    klik_modal_reset();
    modal_view.style.display = 'block';
    document.addEventListener('keydown', klik_modal_view_handle_key, false);
    
    try {     
        if (event_handler) {
            if (event) {
                event_handler(event);
            }
            else {
                event_handler();
            }
        }
        else {
            on_modal_open(event);
        }
    }
    catch(e){
        
    }

    klik_modal_cleanup();

    // disable scrolling
    document.body.style.overflow = 'hidden'; 

    // disable scrolling on touch devices
    document.body.ontouchmove = function(e){ e.preventDefault(); }
}


function klik_modal_close() {
    document.removeEventListener('keydown', klik_modal_view_handle_key, false);
    modal_view.style.display = 'none';

    try {        
        on_modal_close();
    }
    catch(e){
        
    }

    klik_page_scrolling(true);

    document.body.style.overflow = ''; // allow scrolling 
    document.body.ontouchmove = function(e) { // allow scrolling on touch devices; 
        return true;
    } 
    
}


function klik_modal_reset() {
    modal_label.innerHTML = 'No handler'; 
    modal_notes.innerHTML = 'nothing will happen';

    for (var i=1; i<=klik_modal_max_buttons; i++) {
        var modal_btn = by_id('modal_btn_'+i);
        modal_btn.style.width = 'calc(100%/3 - 4px)';
        modal_btn.style.opacity = 1.0;
        modal_btn.style.textAlign = 'center';
        modal_btn.style.border = 'none';
        modal_btn.style.color = 'white';
        modal_btn.style.display = '';
        modal_btn.innerHTML = '...'; 
        modal_btn.onmousedown = null;
    }
}


// will hide buttons that have not been setup
function klik_modal_cleanup() {
    for (var i=1; i<=klik_modal_max_buttons; i++) {
        var modal_btn = by_id('modal_btn_'+i);
        if (modal_btn.innerHTML == '...' ) {
            modal_btn.style.opacity = 0.5;
            modal_btn.style.display = 'none';
        }
    }
}


function klik_modal_init(callback) {
    add_node(document.body, 'div'   , { _i:'modal_view'   , _c:'klik_modal_view' });
    add_node(modal_view   , 'div'   , { _i:'modal_content', _c:'klik_modal_content' });
    add_node(modal_content, 'div'   , { _i:'modal_section', _c:'klik_section centered' });
    add_node(modal_section, 'span'  , { _i:'modal_close'  , _c:'klik_modal_close', _l:'&times;', onclick:'klik_modal_close()'});
    add_node(modal_section, 'label' , { _i:'modal_label' });

    // var m1 = create_node('menu');
    // add_node(m1, 'button', { _i:'modal_btn_1', _l:'...', _s:'width:calc(100%/3 - 4px);' });
    // add_node(m1, 'button', { _i:'modal_btn_2', _l:'...', _s:'width:calc(100%/3 - 4px);' });
    // add_node(m1, 'button', { _i:'modal_btn_3', _l:'...', _s:'width:calc(100%/3); margin:0' });
    // add_node(modal_section, 'node', m1);

    // var m2 = create_node('menu');
    // add_node(m2, 'button', { _i:'modal_btn_4', _l:'...', _s:'width:calc(100%/3 - 4px);' });
    // add_node(m2, 'button', { _i:'modal_btn_5', _l:'...', _s:'width:calc(100%/3 - 4px);' });
    // add_node(m2, 'button', { _i:'modal_btn_6', _l:'...', _s:'width:calc(100%/3); margin:0' });
    // add_node(modal_section, 'node', m2);

    // var m3 = create_node('menu');
    // add_node(m3, 'button', { _i:'modal_btn_7', _l:'...', _s:'width:calc(100%/3 - 4px);' });
    // add_node(m3, 'button', { _i:'modal_btn_8', _l:'...', _s:'width:calc(100%/3 - 4px);' });
    // add_node(m3, 'button', { _i:'modal_btn_9', _l:'...', _s:'width:calc(100%/3); margin:0' });
    // add_node(modal_section, 'node', m3);

    var m1 = create_node('menu');
    for (var i=1; i<=klik_modal_max_buttons; i++) {
        add_node(m1, 'button', { _i:'modal_btn_'+i, _l:'...', _s:'width:calc(100%/3 - 4px);' });
    }
    add_node(modal_section, 'node', m1);


    // add notes
    add_node(modal_section, 'p', { _i:'modal_notes' } );

    // when the user clicks anywhere outside of the modal, we close it
    if (!tech.ios) {
        document.body.onclick = function(event) {
            if (event.target.id == 'modal_view') {
                klik_modal_close();
            }
        }
    }
}
