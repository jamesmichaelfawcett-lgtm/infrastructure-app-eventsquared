// by JSR <jsr@pixmob.com>

// centralized styles / constants / settings for the maps


var MapStyle = {};

MapStyle.tracking = {
    info : {
        color : '#000',
        font : {
            size : 6,
            name : 'Arial',
        }
    },
    pixel : {
        color : '#f0d',
        outline : '#000',
        radius : 21,
    },
    tag : {
        color : '#00ffb9',
        outline : '#000',
        radius : 21,
    },
    location : {
        line : {
            color : '#fff',
            width : 2,
        },
    },
    notification : {
        color : '#fff',
        width : 2,
        timeout : 500,
    },
    line : {
        colors : ['#00ffb9', '#fd0', '#f0d'],
        width : 4,
        timeout : 500,
    },

}


MapStyle.manager = {
    beacon : { 
        color: '#f00',
    },
    tag : { 
        color: '#00ffb9',
        master: '#f09',
    },
    hub : { 
        color: '#09f',
    },
    default : { 
        color: '#555',
    },
}


// rendering
const TWOPI                     = 2*Math.PI;
const MAP_FRAMERATE             = 60.0
const TWO_HZ                    = MAP_FRAMERATE / 2;


const TOLERANCE                 = 8 // 8 good for mouse interaction

// touch
const TOUCH_EVENTS_ENABLED      = 1

// map scaling
const SCALE_MIN                 = 0.1
const SCALE_MAX                 = 20
const ZOOM_INTENSITY            = 0.02

// hotkeys
const KEY_CLEAR                 = 27 // escape

// icons
const DEVICE_SIDE               = 20

// ui on start
const ON_LOAD_HIDE_VIEWS        = true
const ON_LOAD_HIDE_TOOLBARS     = false
const ON_LOAD_HIDE_BADGES       = true

// shared colors
const COLOR_MAIN                = 'rgba(0, 250, 220, 1.0)'
const COLOR_OVER                = 'rgba(255, 255, 255, 0.5)'
const COLOR_DOWN                = 'rgba(255, 0, 0, 0.5)'
const COLOR_CRITICAL            = 'rgba(200, 0, 0, 1.0)'

// maps
const MAP_BACKGROUND_COLOR      = '#222'
const MAP_LABEL_COLOR           = 'white'
const MAP_LABEL_FONT            = '20px Arial'
const MAP_HIGHLIGHT_COLOR       = 'white'
const MAP_HIGHLIGHT_LINE        = 2

// beacons
const BC_LABEL_COLOR            = '#000'
const BC_LABEL_FONT             = '10px Arial'
const BC_RSSI_COLOR             = 'rgba(0, 250, 220, 0.2)'
const BC_RSSI_COLOR_DOWN        = 'rgba(0, 250, 220, 0.7)'
const BC_LINE_COLOR             = '#fff'
const BC_LINE                   = 4
const BC_LINK_COLOR             = '#fff'
const BC_LINK_RADIUS            = 40
const BC_EMERGENCY_COLOR        = COLOR_CRITICAL
const BC_EMERGENCY_LINE         = 4
const BC_MISSED_PACKETS_COLOR   = '#FF0'
const BC_MISSED_PACKETS_LINE    = 2

// locations
const LOC_LABEL_COLOR           = 'white'
const LOC_LABEL_FONT            = '10px Arial'

// location attendees
const LOC_ATTENDEES_COLOR       = 'rgba(0, 64, 128, 0.9)'
const LOC_ATTENDEES_COLOR_LABEL = 'rgba(0,0,0, 1.0)'
const LOC_ATTENDEES_FONT_SIZE   = 13
const LOC_ATTENDEES_FONT_NAME   = 'Arial'

// location inside zone
const LOC_INSIDE_COLOR          = 'rgba(255, 0, 0, 0.0)' 
const LOC_INSIDE_COLOR_OVER     = 'rgba(255, 0, 0, 0.5)' 

// location anchors
const LOC_ANCHOR_RADIUS         = 2
const LOC_ANCHOR_RADIUS_OVER    = 6
const LOC_ANCHOR_RADIUS_DOWN    = 12
const LOC_ANCHOR_COLOR          = 'rgba(255, 255, 255, 1.0)' 
const LOC_ANCHOR_COLOR_OVER     = COLOR_OVER
const LOC_ANCHOR_COLOR_DOWN     = COLOR_DOWN

