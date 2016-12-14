"use strict";

//=====================================================================================================================================================//
                                                                    //IMPORTS
//=====================================================================================================================================================//

var Cylon = require("cylon");
var ffmpeg = require("ffmpeg");
var xbox = require("xbox-controller-node");
var arDrone = require('ar-drone');



//=====================================================================================================================================================//
                                                        //LEAP MOTION PARAMETERS SETUP
//=====================================================================================================================================================//

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

//=====================================================================================================================================================//
                                                                //WEB SERVER CONFIG
//=====================================================================================================================================================//

var stream  = arDrone.createClient();
require('ar-drone-png-stream')(stream, { port: 8081 });

Cylon.api("http",{
    port: 8080,
    ssl: false
});

//=====================================================================================================================================================//
                                                                //DRONE CONTROL
//=====================================================================================================================================================//
Cylon.robot({
    name: "LeaDrone",

    //cylon connections
    connections: {
        leapmotion: { adaptor: 'leapmotion'},
        keyboard: { adaptor: 'keyboard' },
        ardrone: { adaptor: 'ardrone', port: "192.168.1.1"}
    },

    devices: {
        leapmotion: { driver: 'leapmotion'},
        keyboard: { driver: 'keyboard', connection:'keyboard' },
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

//=====================================================================================================================================================//
                                                        //KEYBOARD MAPPING
//=====================================================================================================================================================//

        //With keyboard arrows it does flips to that side
        my.keyboard.on("right", my.drone.rightFlip);
        my.keyboard.on("left", my.drone.leftFlip);
        my.keyboard.on("up", my.drone.frontFlip);
        my.keyboard.on("down", my.drone.backFlip);
        my.keyboard.on("w", my.drone.front());
        my.keyboard.on("a", my.drone.left());
        my.keyboard.on("s", my.drone.back());
        my.keyboard.on("d", my.drone.right());
        my.keyboard.on("i", my.drone.up());
        my.keyboard.on("k", my.drone.down());
        my.keyboard.on("j", my.drone.counterClockwise());
        my.keyboard.on("l", my.drone.clockwise());

        my.keyboard.on("space", function(){
            console.log("space pressed");
            //If the drone is not flying, it takes off pressing the space
            if (landed) {
                my.drone.takeoff();
                landed = false;
            }else{//If the drone is flying, it lands pressing the space
                my.drone.land();
                landed = true;
            }
        });

//=====================================================================================================================================================//
                                            //LEAP MOTION CONTROLLER MAPPING
//=====================================================================================================================================================//

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
                    landed = false;
                }else{//If it's flying, it lands
                    console.log("Leap - Land");
                    // my.drone.land();
                    landed = true;
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
//=====================================================================================================================================================//
                                                    //XBOX CONTROLLER MAPPING
//=====================================================================================================================================================//

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