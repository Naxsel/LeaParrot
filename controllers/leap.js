"use strict";

var Cylon = require("cylon");
var ffmpeg = require("ffmpeg");
var arDrone = require('ar-drone');


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
Cylon.robot({
    name: "LeaDrone",

    //cylon connections
    connections: {
        leapmotion: { adaptor: 'leapmotion'},
        ardrone: { adaptor: 'ardrone', port: "192.168.1.1"}
    },

    devices: {
        leapmotion: { driver: 'leapmotion'},
        drone: {driver: 'ardrone'},
        nav : {driver: 'ardrone-nav'},//gives drone's information/state
    },
    work: function(my) {

        //Show percentage of battery if it's low
        my.nav.on('lowBattery', function(data){
            console.log("LOW BATTERY: " +data +" %");
        });

        my.leapmotion.on("gesture", function(gesture) {
            var type = gesture.type,
                state = gesture.state,
                progress = gesture.progress;

            var stop = (state === "stop");

            //KeyTap as click with a mouse
            if (type === "keyTap" || type === "screenTap") {
                if(landed) {//If it's not flying, it takes off
                    console.log("Leap - takeOff");
                    // my.drone.takeoff();
                }else{//If it's flying, it lands
                    console.log("Leap - Land");
                    // my.drone.land();
                }
            }

            //Flip with the gesture of a circle with the finger
            if (type === "circle" && stop && progress > CIRCLE_THRESHOLD) {
                if (gesture.normal[2] < 0) {
                    console.log("Leap - rightFlip");
                    // my.drone.rightFlip;
                }

                if (gesture.normal[2] > 0) {
                    console.log("Leap - leftFlipo");
                    // my.drone.leftFlip;
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
                        console.log("Leap - CounterClockwise");
                        // my.drone.counterClockwise(value);
                    }

                    if (signal < 0) {
                        console.log("Leap - CounterClockwise");
                        // my.drone.clockwise(value);
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
                        console.log("Leap - Up");
                        // my.drone.up(value);
                    }

                    if (signal < 0) {
                        console.log("Leap - Down");
                        // my.drone.down(value);
                    }
                }

                // DIRECTION FRONT/BACK
                if ((Math.abs(hand.palmNormal[2]) > DIRECTION_THRESHOLD)) {
                    if (hand.palmNormal[2] > 0) {
                        value = Math.abs(
                            Math.round(hand.palmNormal[2] * 10 + DIRECTION_THRESHOLD) *
                            DIRECTION_SPEED_FACTOR
                        );
                        console.log("Leap - Forward");
                        // my.drone.forward(value);
                    }

                    if (hand.palmNormal[2] < 0) {
                        value = Math.abs(
                            Math.round(hand.palmNormal[2] * 10 - DIRECTION_THRESHOLD) *
                            DIRECTION_SPEED_FACTOR
                        );
                        console.log("Leap - Backward");
                        // my.drone.back(value);
                    }
                }

                // DIRECTION LEFT/RIGHT
                if (Math.abs(hand.palmNormal[0]) > DIRECTION_THRESHOLD) {
                    if (hand.palmNormal[0] > 0) {
                        value = Math.abs(
                            Math.round(hand.palmNormal[0] * 10 + DIRECTION_THRESHOLD) *
                            DIRECTION_SPEED_FACTOR
                        );
                        console.log("Leap - Left");
                        // my.drone.left(value);
                    }

                    if (hand.palmNormal[0] < 0) {
                        value = Math.abs(
                            Math.round(hand.palmNormal[0] * 10 - DIRECTION_THRESHOLD) *
                            DIRECTION_SPEED_FACTOR
                        );
                        console.log("Leap - right");
                        // my.drone.right(value);
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
                    console.log("Leap - hover");
                    // my.drone.hover();
                }
            }

            if (!handOpen && !handWasClosedInLastFrame) {
                console.log("Leap - hover");
                // my.drone.hover();
            }

            handWasClosedInLastFrame = !handOpen;
        });

    }
});

Cylon.start();