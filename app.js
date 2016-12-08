"use strict";

//Imports
var Cylon = require("cylon");
var xbox = require("xbox-controller-node");

//Leap Config
var TURN_TRESHOLD = 0.2,
    TURN_SPEED_FACTOR = 2.0;

var DIRECTION_THRESHOLD = 0.25,
    DIRECTION_SPEED_FACTOR = 0.05;

var UP_CONTROL_THRESHOLD = 50,
    UP_SPEED_FACTOR = 0.01,
    CIRCLE_THRESHOLD = 1.5;

var handStartPosition = [],
    handStartDirection = [];

var handWasClosedInLastFrame = false;

Cylon.api("http",{
    port: 8080,
    ssl: false
});


Cylon.robot({
    name: "LeaDrone",

    connections: {
        ardrone: { adaptor: 'ardrone', port: "192.168.1.1"},
        leapmotion: { adaptor: 'leapmotion'},
        keyboard: { adaptor: 'keyboard' },
        opencv: {adaptor: "opencv"}
    },

    devices: {
        drone: {driver: 'ardrone'},
        nav : {driver: 'ardrone-nav'},
        leapmotion: { driver: 'leapmotion'},
        keyboard: { driver: 'keyboard', connection:'keyboard' },
        window: { driver: "window", connection: "opencv"}
    },

    work: function(my) {

        var landed = true;
        var land = 0;

        my.nav.on('lowBattery', function(data){
            console.log("LOW BATTERY: " +data +" %");
        });

        //Keyboard Mapping
        my.keyboard.on("right", my.drone.rightFlip);
        my.keyboard.on("left", my.drone.leftFlip);
        my.keyboard.on("up", my.drone.frontFlip);
        my.keyboard.on("down", my.drone.backFlip);
        my.keyboard.on("spaceboard", function(){
            if (landed) {
                my.drone.takeoff();
                landed = false;
            }else{
                my.drone.land();
                landed = true;
            }
        });

        //Leap Motion Mapping

        my.leapmotion.on("gesture", function(gesture) {
            var type = gesture.type,
                progress = gesture.progress;

            if (type === "keyTap" || type === "screenTap") {
                if(landed) {
                    my.drone.takeoff();
                    landed = false;
                }else{
                    my.drone.land();
                    landed = true;
                }
            }

            if (type === "circle" && stop && progress > CIRCLE_THRESHOLD) {
                if (gesture.normal[2] < 0) {
                    my.drone.rightFlip;
                }

                if (gesture.normal[2] > 0) {
                    my.drone.leftFlip;
                }
            }
        });

        my.leapmotion.on("hand", function(hand) {
            var signal, value;

            var handOpen = !!hand.fingers.filter(function(f) {
                return f.extended;
            }).length;

            if (handOpen) {
                if (handWasClosedInLastFrame) {
                    handStartPosition = hand.palmPosition;
                    handStartDirection = hand.direction;
                }

                var horizontal = Math.abs(handStartDirection[0] - hand.direction[0]),
                    vertical = Math.abs(hand.palmPosition[1] - handStartPosition[1]);

                // TURNS
                if (horizontal > TURN_TRESHOLD) {
                    signal = handStartDirection[0] - hand.direction[0];
                    value = (horizontal - TURN_TRESHOLD) * TURN_SPEED_FACTOR;

                    if (signal > 0) {
                        my.drone.counterClockwise(value);
                    }

                    if (signal < 0) {
                        my.drone.clockwise(value);
                    }
                }

                // UP and DOWN
                if (vertical > UP_CONTROL_THRESHOLD) {
                    if ((hand.palmPosition[1] - handStartPosition[1]) >= 0) {
                        signal = 1;
                    } else {
                        signal = -1;
                    }

                    value = Math.round(vertical - UP_CONTROL_THRESHOLD) * UP_SPEED_FACTOR;

                    if (signal > 0) {
                        my.drone.up(value);
                    }

                    if (signal < 0) {
                        my.drone.down(value);
                    }
                }

                // DIRECTION FRONT/BACK
                if ((Math.abs(hand.palmNormal[2]) > DIRECTION_THRESHOLD)) {
                    if (hand.palmNormal[2] > 0) {
                        value = Math.abs(
                            Math.round(hand.palmNormal[2] * 10 + DIRECTION_THRESHOLD) *
                            DIRECTION_SPEED_FACTOR
                        );

                        my.drone.forward(value);
                    }

                    if (hand.palmNormal[2] < 0) {
                        value = Math.abs(
                            Math.round(hand.palmNormal[2] * 10 - DIRECTION_THRESHOLD) *
                            DIRECTION_SPEED_FACTOR
                        );

                        my.drone.back(value);
                    }
                }

                // DIRECTION LEFT/RIGHT
                if (Math.abs(hand.palmNormal[0]) > DIRECTION_THRESHOLD) {
                    if (hand.palmNormal[0] > 0) {
                        value = Math.abs(
                            Math.round(hand.palmNormal[0] * 10 + DIRECTION_THRESHOLD) *
                            DIRECTION_SPEED_FACTOR
                        );

                        my.drone.left(value);
                    }

                    if (hand.palmNormal[0] < 0) {
                        value = Math.abs(
                            Math.round(hand.palmNormal[0] * 10 - DIRECTION_THRESHOLD) *
                            DIRECTION_SPEED_FACTOR
                        );

                        my.drone.right(value);
                    }
                }

                // AUTO FREEZE
                if (
                    // within left/right threshold
                (Math.abs(hand.palmNormal[0]) < DIRECTION_THRESHOLD) &&

                // within forward/back threshold
                (Math.abs(hand.palmNormal[2]) < DIRECTION_THRESHOLD) &&

                // within up/down threshold
                Math.abs(hand.palmPosition[1] - handStartPosition[1]) <
                UP_CONTROL_THRESHOLD &&

                // within turn threshold
                Math.abs(handStartDirection[0] - hand.direction[0]) <
                TURN_TRESHOLD) {
                    my.drone.stop();
                }
            }

            if (!handOpen && !handWasClosedInLastFrame) {
                my.drone.stop();
            }

            handWasClosedInLastFrame = !handOpen;
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
                    land = 0;
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
        xbox.on('a', function() {
            console.log('[A] button press');
            my.drone.backFlip();
        });
        xbox.on('b', function() {
            console.log('[B] button press');
            my.drone.leftFlip();
        });
        xbox.on('x', function() {
            console.log('[X] button press');
            my.drone.rightFlip();
        });
        xbox.on('y', function() {
            console.log('[Y] button press');
            my.drone.frontFlip();
        });
        //TODO
        //add triggers and instal cv


        //Stream
        my.drone.getPngStream().on("data", function(png) {
            my.opencv.readImage(png, function(err, img) {
                my.window.show(img);
            });
        });

    }
});

Cylon.start();

