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

        my.drone.takeoff();

        //Leap Motion Mapping

        //Xbox Controller Mapping
        xbox.on('leftstickDown', function () {
            console.log('Moving [LEFTSTICK] DOWN');
            my.drone.back(0.3);
        });
        xbox.on('leftstickUp', function () {
            console.log('Moving [LEFTSTICK] UP');
            my.drone.front(0.3);
        });
        xbox.on('rightstickLeft', function () {
            console.log('Moving [RIGHTSTICK] LEFT');
            my.drone.counterClockwise(0.2);
        });
        xbox.on('rightstickRight', function () {
            console.log('Moving [RIGHTSTICK] RIGHT');
            my.drone.clockwise(0.2);
        });

        xbox.on('rightstickDown', function () {
            console.log('Moving [RIGHTSTICK] DOWN');
            if (my.drone.fly)
            my.drone.down(0.3)
        });
        xbox.on('rightstickUp', function () {
            console.log('Moving [RIGHTSTICK] UP');
            my.drone.up(0.3)
        });
        xbox.on('leftstickRight', function () {
            console.log('Moving [LEFTSTICK] RIGHT');
            my.drone.right(0.3);
        });
        xbox.on('leftstickLeft', function () {
            console.log('Moving [LEFTSTICK] LEFT');
            my.drone.left(0.3);
        });


        after((10).seconds(), function(){
            my.drone.land();
        });
        after((15).seconds(), function(){
            my.drone.land();
        });
    }
});



Cylon.start();