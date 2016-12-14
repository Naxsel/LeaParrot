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
        leapmotion: { driver: "leapmotion", connection: "leapmotion" }
        //keyboard: { driver: "keyboard", connection: "keyboard" }
    },

    work: function(my) {
        //my.keyboard.on("right", my.drone.rightFlip());
        //my.keyboard.on("left", my.drone.leftFlip());
        //my.keyboard.on("up", my.drone.frontFlip());
        //my.keyboard.on("down", my.drone.backFlip());

        //my.keyboard.on("w", my.drone.wave());
        //my.keyboard.on("s", my.drone.stop());
        //my.keyboard.on("l", my.drone.land());

        var landed = true;

        my.leapmotion.on("gesture", function(gesture) {
            var type = gesture.type,
                state = gesture.state,
                progress = gesture.progress;

            var stop = (state === "stop");

            // if (type === "circle" && stop && progress > CIRCLE_THRESHOLD) {
            //     if (gesture.normal[2] < 0) {
            //         my.drone.takeoff();
            //     }
            //
            //     if (gesture.normal[2] > 0) {
            //         my.drone.land();
            //     }
            // }

            // emergency stop
            if (type === "keyTap" || type === "screenTap") {
                if(landed){
                    my.drone.takeoff();
                    console.log("takeoff");
                    landed= false;
                }else{
                    my.drone.land();
                    console.log("land");
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
                        console.log("up");
                        my.drone.up(value);
                    }

                    if (signal < 0) {
                        console.log("down");
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
                        console.log("forward");
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
                    landed = true;
                }
            }

            if (!handOpen && !handWasClosedInLastFrame) {
                my.drone.stop();
                landed = true;
            }

            handWasClosedInLastFrame = !handOpen;
        });
    }
}).start();