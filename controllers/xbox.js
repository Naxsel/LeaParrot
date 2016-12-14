"use strict";

var Cylon = require("cylon");
var ffmpeg = require("ffmpeg");
var xbox = require("xbox-controller-node");

var stream  = arDrone.createClient();
require('ar-drone-png-stream')(stream, { port: 8081 });

// Cylon.api("http",{
//     port: 8080,
//     ssl: false
// });

Cylon.robot({
    name: "LeaDrone",

    //cylon connections
    connections: {
        ardrone: { adaptor: 'ardrone', port: "192.168.1.1"}
    },

    devices: {
        drone: {driver: 'ardrone'},
        nav : {driver: 'ardrone-nav'},//gives drone's information/state
    },

    work: function(my) {
        var landed = true;
        var land = 0;

        //Show percentage of battery if it's low
        my.nav.on('lowBattery', function(data){
            console.log("LOW BATTERY: " +data +" %");
        });
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
                //If it receives 20 frames down, it lands
                if (land > 20){
                    my.drone.land();
                    landed=true;
                    land = 0;
                }else{
                    //Otherwise it goes down
                    my.drone.down(0.3);
                    land++;
                }
            }
        });
        xbox.on('rightstickUp', function () {
            console.log('Moving [RIGHTSTICK] UP');
            //takeof if it's not flying
            if(landed){
                my.drone.takeoff();
                landed = false;
            }else { //If it's flying it goes up
                my.drone.up(0.3);
                land = 0;
            }
        });
        //Move to the right
        xbox.on('leftstickRight', function () {
            console.log('Moving [LEFTSTICK] RIGHT');
            my.drone.right(0.3);
            land = 0;
        });
        //Move to the left
        xbox.on('leftstickLeft', function () {
            console.log('Moving [LEFTSTICK] LEFT');
            my.drone.left(0.3);
            land = 0;
        });

        //FLIPS WITH THE a,b,x,y BUTTONS
        xbox.on('a', function() {
            console.log('[A] button press');
            my.drone.takeoff();
        });
        xbox.on('b', function() {
            console.log('[B] button press');
            my.drone.land();
        });
        xbox.on('x', function() {
            console.log('[X] button press');
            my.drone.rightFlip();
        });
        xbox.on('y', function() {
            console.log('[Y] button press');
            my.drone.frontFlip();
        });

        //take off and land
        xbox.on('rb', function () {
            console.log('[LR] button release');
            my.drone.takeoff();
            landed = false
        });
        xbox.on('lb', function() {
            console.log('[LB] button press');
            my.drone.land();
        });

        //Only in linux, emergency stop
        xbox.on('xbox', function() {
            console.log('[xbox] button press');
            my.drone.stop();
        });
    }
});

Cylon.start();