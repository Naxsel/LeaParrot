"use strict";

var Cylon = require("cylon");
var ffmpeg = require("ffmpeg");

Cylon.api("http",{
    port: 8080,
    ssl: false
});

var landed = true;

Cylon.robot({
    name: "LeaDrone",

    connections: {
        ardrone: { adaptor: 'ardrone', port: "192.168.1.1"},
        joystick:{ adaptor: 'joystick'}

    },

    devices: {
        drone: {driver: 'ardrone'},
        controller: {driver: 'xbox-360'}
    },

    work: function(my) {
        ["a", "b", "x", "y"].forEach(function(button) {
            my.controller.on(button + ":press", function() {
                console.log("Button " + button + " pressed.");
            });

            my.controller.on(button + ":release", function() {
                if (landed){
                    my.drone.takeoff();
                    landed = false
                }else{
                    my.drone.land();
                    landed = true
                }
                console.log("Button " + button + " released.");
            });
        });

        my.controller.on("left_x:move", function(pos) {
            console.log("Left Stick - X:", pos);
        });

        my.controller.on("left_y:move", function(pos) {
            console.log("Left Stick - Y:", pos);
            my.drone.up(0.1);

        });

        my.controller.on("right_x:move", function(pos) {
            console.log("Right Stick - X:", pos);

        });

        my.controller.on("right_y:move", function(pos) {
            console.log("Right Stick - Y:", pos);
        });

        my.controller.on("lt:move", function(pos) {
            console.log("Left Trigger: ", pos);
        });

        my.controller.on("rt:move", function(pos) {
            console.log("Right Trigger: ", pos);
        });
    }
});

Cylon.start();