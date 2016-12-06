"use strict";

var Cylon = require("cylon");
var ffmpeg = require("ffmpeg");
var xbox = require("xbox-controller-node");

xbox.listHIDDevices();

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
        xbox.on('leftstickDown', function () {
            console.log('Moving [LEFTSTICK] DOWN');
        });

        xbox.on('leftstickUp', function () {
            console.log('Moving [LEFTSTICK] UP');
        });

        xbox.on('rightstickLeft', function () {
            console.log('Moving [RIGHTSTICK] LEFT');
        });
        xbox.on('rightstickRight', function () {
            console.log('Moving [RIGHTSTICK] RIGHT');
        });

        xbox.on('rightstickDown', function () {
            console.log('Moving [RIGHTSTICK] DOWN');
        });
        xbox.on('rightstickUp', function () {
            console.log('Moving [RIGHTSTICK] UP');
        });
        xbox.on('leftstickRight', function () {
            console.log('Moving [LEFTSTICK] RIGHT');
        });
        xbox.on('leftstickLeft', function () {
            console.log('Moving [LEFTSTICK] LEFT');
        });
    }
});



Cylon.start();