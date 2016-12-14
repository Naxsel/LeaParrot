"use strict";

var Cylon = require("cylon");
var ffmpeg = require("ffmpeg");
var arDrone = require('ar-drone');

//var stream  = arDrone.createClient();
//require('ar-drone-png-stream')(stream, { port: 8081 });

Cylon.robot({
    name: "LeaDrone",

    //cylon connections
    connections: {
        ardrone: { adaptor: 'ardrone', port: "192.168.1.1"},
        keyboard: { adaptor: 'keyboard' }
    },

    devices: {
        drone: {driver: 'ardrone'},
        keyboard: { driver: 'keyboard', connection:'keyboard' }
        //nav : {driver: 'ardrone-nav'},//gives drone's information/state
    },

    work: function(my) {

        var landed = true;

        //Show percentage of battery if it's low
        //my.nav.on('lowBattery', function(data){
        //    console.log("LOW BATTERY: " +data +" %");
        //});

        //With keyboard arrows it does flips to that side
        my.keyboard.on("right", my.drone.rightFlip);
        my.keyboard.on("left", my.drone.leftFlip);
        my.keyboard.on("up", my.drone.frontFlip);
        my.keyboard.on("down", my.drone.backFlip);
        my.keyboard.on("w", my.drone.front);
        my.keyboard.on("a", my.drone.left);
        my.keyboard.on("s", my.drone.back);
        my.keyboard.on("d", my.drone.right);
        my.keyboard.on("i", my.drone.up);
        my.keyboard.on("k", my.drone.down);
        my.keyboard.on("j", my.drone.counterClockwise);
        my.keyboard.on("l", my.drone.clockwise);
        my.keyboard.on("c", my.drone.takeoff);
        my.keyboard.on("n", my.drone.land);


        my.keyboard.on("space", function(){
            console.log("space pressed");
            //If the drone is not flying, it takes off pressing the space
            if (landed) {
                console.log("launch");
                my.drone.takeoff();
                landed = false;
            }else{//If the drone is flying, it lands pressing the space
                my.drone.land();
                landed = true;
            }
        });
    }
});

Cylon.start();
