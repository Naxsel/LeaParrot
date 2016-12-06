"use strict";

var Cylon = require("cylon");
var ffmpeg = require("ffmpeg");
var xbox = require("xbox-controller-node");
var cron = require("node-cron");

// xbox.listHIDDevices();

Cylon.api("http",{
    port: 8080,
    ssl: false
});


Cylon.robot({
    name: "LeaDrone",

    connections: {
        ardrone: { adaptor: 'ardrone', port: "192.168.1.1"},
        leapmotion: { adaptor: 'leapmotion'}
    },

    devices: {
        drone: {driver: 'ardrone'},
        nav : {driver: 'ardrone-nav'},
        leapmotion: { driver: 'leapmotion'}
    },

    work: function(my) {

        var landed = true;
        var land = 0;

        my.nav.on('lowBattery', function(data){
            console.log("LOW BATTERY: " +data +" %");
        });

        //Leap Motion Mapping

        //Xbox Controller Mapping
        xbox.on('leftstickDown', function () {
            console.log('Moving [LEFTSTICK] DOWN');
            my.drone.back(0.3);
            land = 0;
        });
        xbox.on('leftstickUp', function () {
            console.log('Moving [LEFTSTICK] UP');
            my.drone.front(0.3);
            land = 0;
        });
        xbox.on('rightstickLeft', function () {
            console.log('Moving [RIGHTSTICK] LEFT');
            my.drone.counterClockwise(0.2);
            land = 0;
        });
        xbox.on('rightstickRight', function () {
            console.log('Moving [RIGHTSTICK] RIGHT');
            my.drone.clockwise(0.2);
            land = 0;
        });

        xbox.on('rightstickDown', function () {
            console.log('Moving [RIGHTSTICK] DOWN');
            if(!landed){
                if (land > 20){
                    my.drone.land();
                    landed=true;
                }else{
                    my.drone.down(0.3);
                    land++;
                }
            }
        });
        xbox.on('rightstickUp', function () {
            console.log('Moving [RIGHTSTICK] UP');
            if(landed){
                my.drone.takeoff();
                landed = false;
            }else {
                my.drone.up(0.3);
                land = 0;
            }
        });
        xbox.on('leftstickRight', function () {
            console.log('Moving [LEFTSTICK] RIGHT');
            my.drone.right(0.3);
            land = 0;
        });
        xbox.on('leftstickLeft', function () {
            console.log('Moving [LEFTSTICK] LEFT');
            my.drone.left(0.3);
            land = 0;
        });

        // after((10).seconds(), function(){
        //     my.drone.land();
        // });
    }
});

Cylon.start();