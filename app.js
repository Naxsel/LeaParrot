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

        my.leapmotion.on('frame', function(frame){
            if(frame.hands.length > 0){
                my.drone.takeoff();
            } else {
                my.drone.land();
            }

            if(frame.valid && frame.gestures.length > 0){
                frame.gestures.forEach(function(g){
                    if(g.type == 'swipe'){
                        var currentPosition = g.position;
                        var startPosition = g.startPosition;

                        var xDirection = currentPosition[0] - startPosition[0];
                        var yDirection = currentPosition[1] - startPosition[1];
                        var zDirection = currentPosition[2] - startPosition[2];

                        var xAxis = Math.abs(xDirection);
                        var yAxis = Math.abs(yDirection);
                        var zAxis = Math.abs(zDirection);

                        var superiorPosition  = Math.max(xAxis, yAxis, zAxis);

                        if(superiorPosition === xAxis){
                            if(xDirection < 0){
                                console.log('LEFT');
                                my.drone.left();
                            } else {
                                my.drone.right();
                                console.log('RIGHT');
                            }
                        }

                        if(superiorPosition === zAxis){
                            if(zDirection > 0){
                                console.log('BACKWARDS');
                                my.drone.back();
                            } else {
                                console.log('FORWARD');
                                my.drone.forward();
                            }
                        }

                        if(superiorPosition === yAxis){
                            if(yDirection > 0){
                                console.log('UP');
                                my.drone.up(1);
                            } else {
                                console.log('DOWN');
                                my.drone.down(1);
                            }
                        }
                    } else if(g.type === 'keyTap'){
                        my.drone.backFlip();
                        after((5).seconds(), function(){
                            my.drone.land();
                        })
                    }
                })
            }
        });

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