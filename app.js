"use strict";

var Cylon = require("cylon");
var ffmpeg = require("ffmpeg");
var xbox = require("xbox-controller-node");

Cylon.api("http",{
    port: 8080,
    ssl: false
});

var landed = true;

Cylon.robot({
    name: "LeaDrone",

    connections: {
        ardrone: { adaptor: 'ardrone', port: "192.168.1.1"},
        leapmotion: { adaptor: 'leapmotion'}
    },

    devices: {
        drone: {driver: 'ardrone'},
        leapmotion: { driver: 'leapmotion'}
    },

    work: function(my) {
        ["a","b","x","y"].forEach(function(button){
           xbox.on(button, function(){
               console.log('['+button+'] button press');
               if(landed){
                   my.drone.takeoff();
                   landed = false;
               }else{
                   my.drone.land();
                   landed = true;
               }
           });
        });
    }
});

Cylon.start();