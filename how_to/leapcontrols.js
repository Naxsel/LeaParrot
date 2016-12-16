/*
 * leap_ardrone.js
 *
 * Written by Giuliano Sposito and Fábio Uechi
 * Copyright (c) 2013-2014 CI&T Software
 * Licensed under the Apache 2.0 license.
 */

"use strict";

var Cylon = require("cylon");

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
    connections: {
        leapmotion: { adaptor: "leapmotion" },
        ardrone: { adaptor: "ardrone", port: "192.168.1.1" }
       // keyboard: { adaptor: "keyboard" }
    },

    devices: {
        drone: { driver: "ardrone", connection: "ardrone" },
        leapmotion: { driver: "leapmotion", connection: "leapmotion" },
        nav : {driver: 'ardrone-nav'}
        //keyboard: { driver: "keyboard", connection: "keyboard" }
    },

    work: function(my) {

        var landed = true;

        //Show percentage of battery if it's low
        my.nav.on('lowBattery', function(data){
            console.log("LOW BATTERY: " +data +" %");
        });

        my.leapmotion.on("gesture", function(gesture) {
            var type = gesture.type,
                state = gesture.state,
                progress = gesture.progress;

            var stop = (state === "stop");

            // emergency stop
            if (type === "keyTap" || type === "screenTap") {
                if(landed){
                    my.drone.takeoff();
                    console.log("Leap - Takeoff");
                    landed= false;
                }else{
                    my.drone.land();
                    console.log("Leap -Land");
                    landed = true
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
                        my.drone.counterClockwise(value);
                    }

                    if (signal < 0) {
                        console.log("Leap - Clockwise");
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
                        console.log("Leap - Up");
                        my.drone.up(value);
                    }

                    if (signal < 0) {
                        console.log("Leap - Down");
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
                        console.log("Leap - Forward");
                        my.drone.forward(value);
                    }

                    if (hand.palmNormal[2] < 0) {
                        value = Math.abs(
                            Math.round(hand.palmNormal[2] * 10 - DIRECTION_THRESHOLD) *
                            DIRECTION_SPEED_FACTOR
                        );
                        console.log("Leap - Backward");
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
                        console.log("Leap - Left");
                        my.drone.left(value);
                    }

                    if (hand.palmNormal[0] < 0) {
                        value = Math.abs(
                            Math.round(hand.palmNormal[0] * 10 - DIRECTION_THRESHOLD) *
                            DIRECTION_SPEED_FACTOR
                        );
                        console.log("Leap - right");
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
                    console.log("Leap - stop");
                    my.drone.stop();
                    landed = true;
                }
            }

            if (!handOpen && !handWasClosedInLastFrame) {
                console.log("Leap - stop");
                my.drone.stop();
                landed = true;
            }

            handWasClosedInLastFrame = !handOpen;
        });
    }
}).start();