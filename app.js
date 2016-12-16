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

var speed = 0.2;
var landed = true;

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
                                                                // CYLON WEB SERVER CONFIG
//=====================================================================================================================================================//

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
        ardrone: { adaptor: 'ardrone', port: "192.168.1.1"},
        // keyboard: { adaptor: 'keyboard' }
    },

    devices: {
        ddrone: { driver: "ardrone", connection: "ardrone" },
        leapmotion: { driver: "leapmotion", connection: "leapmotion" },
        nav : {driver: 'ardrone-nav'}
        // keyboard: { driver: 'keyboard', connection:'keyboard' }
    },

    work: function(my) {

        var landed = true;

        //Show percentage of battery if it's low
        my.nav.on('lowBattery', function(data){
            console.log("LOW BATTERY: " +data +" %");
        });

//=====================================================================================================================================================//
                                                        //KEYBOARD MAPPING
//=====================================================================================================================================================//

        // my.keyboard.on("space", function(){
        //     console.log("space pressed");
        //     //If the drone is not flying, it takes off pressing the space
        //     if (landed) {
        //         my.drone.takeoff();
        //         landed = false;
        //     }else{//If the drone is flying, it lands pressing the space
        //         my.drone.land();
        //         landed = true;
        //     }
        // });

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
//=====================================================================================================================================================//
                                                    //XBOX CONTROLLER MAPPING
//=====================================================================================================================================================//

        xbox.on('leftstickDown', function () {
            console.log('Moving [LEFTSTICK] DOWN');
            my.drone.back(speed);
        });
        xbox.on('leftstickUp', function () {
            console.log('Moving [LEFTSTICK] UP');
            my.drone.front(speed);
        });

        xbox.on('leftstickRight', function () {
            console.log('Moving [LEFTSTICK] RIGHT');
            my.drone.right(speed);
        });
        //Move to the left
        xbox.on('leftstickLeft', function () {
            console.log('Moving [LEFTSTICK] LEFT');
            my.drone.left(speed);
        });
        xbox.on('rightstickLeft', function () {
            console.log('Moving [RIGHTSTICK] LEFT');
            my.drone.counterClockwise(0.3);
        });
        xbox.on('rightstickRight', function () {
            console.log('Moving [RIGHTSTICK] RIGHT');
            my.drone.clockwise(0.3);
        });

        xbox.on('rightstickDown', function () {
            console.log('Moving [RIGHTSTICK] DOWN');
            my.drone.down(0.3);
        });
        xbox.on('rightstickUp', function () {
            console.log('Moving [RIGHTSTICK] UP');
            //takeof if it's not flying
            if(landed){
                my.drone.takeoff();
                landed = false;
            }else { //If it's flying it goes up
                my.drone.up(0.3);
            }
        });
        xbox.on('rightstickLeft:release', function () {
            console.log('Moving [RIGHTSTICK] LEFT');
            my.drone.hover();
        });
        xbox.on('rightstickRight:release', function () {
            console.log('Moving [RIGHTSTICK] Right');
            my.drone.hover();
        });
        xbox.on('rightstickUp:release', function () {
            console.log('Moving [RIGHTSTICK] Up');
            my.drone.hover();
        });
        xbox.on('rightstickDown:release', function () {
            console.log('Moving [RIGHTSTICK] Down');
            my.drone.hover();
        });

        //FLIPS WITH THE a,b,x,y BUTTONS
        xbox.on('a', function() {
            console.log('[A] button press');
            my.drone.hover();
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

        xbox.on('start', function() {
            console.log('[Start] button press');
            my.drone.ftrim();
        });

        xbox.on('back', function(){
            console.log('[Back] button press');
            my.drone.disableEmergency();
        });

        //Only in linux, emergency stop
        xbox.on('xbox', function() {
            console.log('[xbox] button press');
            my.drone.stop();
        });
    }
});

Cylon.start();

var stream  = arDrone.createClient();
require('ar-drone-png-stream')(stream, { port: 8081 });