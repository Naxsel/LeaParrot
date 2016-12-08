"use strict";

var Cylon = require('cylon');

var config = "/home/alex/Dropbox/JetBrains/LeaParrot/controller.json"

// States
var landed = true;

Cylon.robot({
    connections: {
        joystick: { adaptor: "joystick" },
        ardrone: { adaptor: "ardrone", port: "192.168.1.1" },
        opencv: { adaptor: "opencv" }
    },

    devices: {
        controller: { driver: "xbox-360" },
        drone: { driver: "ardrone", connection: "ardrone"},
        nav: { driver: "ardrone-nav", connection: "ardrone" },
        window: { driver: "window", connection: "opencv" }
    },

    work: function(my) {
        loadConfiguration(my.drone);

        // my.drone.getPngStream().on("data", function(png) {
        //     my.opencv.readImage(png, function(err, img) {
        //         my.window.show(img);
        //     });
        // });

        my.nav.on("hovering", function(data) {
            console.log("Hovering");
        });

        my.nav.on("landed", function(data) {
            console.log("Landed");
            landed = true;
        });

        my.nav.on("batteryChange", function(data) {
            console.log("Battery level: " + data + " %");
        });

        my.nav.on("lowBattery", function(data) {
            console.log("*** LOW BATTERY ***");
        });

        my.controller.on("start:press", function() {
            if (landed) {
                console.log("Flat trim & initiating take off...");
                my.drone.disableEmergency();
                my.drone.ftrim();
                my.drone.takeoff();
                landed = false;
            } else {
                console.log("Initiating landing sequence...");
                my.drone.land();
                my.drone.stop();
            }
        });

        my.controller.on("back:press", function() {
            console.log("*** EMERGENCY ***");
            my.drone.enableEmergency();
        });

        my.controller.on("rt:press", function() {
            my.drone.hover();
        });

        my.controller.on("left_x:move", function(pos) {
            if (pos > 0) {
                var speed = validatePitch(pos);
                console.log("Rotate right at " + speed);
                my.drone.clockwise(speed);
            } else if (pos < 0) {
                var speed = validatePitch(pos);
                console.log("Rotate left at " + speed);
                my.drone.counterClockwise(speed);
            } else {
                var speed = 0.0;
                console.log("Rotate right at " + speed);
                my.drone.clockwise(speed);
            }
        });

        my.controller.on("left_y:move", function(pos) {
            if (pos > 0) {
                var speed = validatePitch(pos);
                console.log("Down at " + speed);
                my.drone.down(speed);
            } else if (pos < 0) {
                var speed = validatePitch(pos);
                console.log("Up at " + speed);
                my.drone.up(speed);
            } else {
                var speed = 0.0;
                console.log("Down at " + speed);
                my.drone.down(speed);
            }
        });

        my.controller.on("right_x:move", function(pos) {
            if (pos > 0) {
                var speed = validatePitch(pos);
                console.log("Strafe right at " + speed);
                my.drone.right(speed);
            } else if (pos < 0) {
                var speed = validatePitch(pos);
                console.log("Strafe left at " + speed);
                my.drone.left(speed);
            } else {
                var speed = 0.0;
                console.log("Strafe right at " + speed);
                my.drone.right(speed);
            }
        });

        my.controller.on("right_y:move", function(pos) {
            if (pos > 0) {
                var speed = validatePitch(pos);
                console.log("Backward at " + speed);
                my.drone.back(speed);
            } else if (pos < 0) {
                var speed = validatePitch(pos);
                console.log("Forward at " + speed);
                my.drone.front(speed);
            } else {
                var speed = 0.0;
                console.log("Backward at " + speed);
                my.drone.back(speed);
            }
        });

    }
}).start();

function loadConfiguration(drone) {
    drone.config("general:navdata_demo", "TRUE");
    drone.config("control:altitude_max", "100000");

    // This settings tells the control loop that the AR.Drone is flying outside.
    // ￼Setting the indoor/outdoor flight will load the corresponding indoor/outdoor_control_yaw,
    // indoor/outdoor_eu- ler_angle_max and indoor/outdoor_control_vz_max.
    // Note : This settings enables the wind estimator of the AR.Drone 2.0,
    // and thus should always be enabled when flying outside.
    drone.config("control:outdoor", "TRUE");

    // This settings tells the control loop that the AR.Drone is currently using the outdoor hull.
    // Deactivate it when flying with the indoor hull
    drone.config("control:flight_without_shell", "TRUE");
}

function validatePitch(data) {
    var value = Math.abs(data);
    if (value >= 0.1) {
        if (value <= 1.0) {
            return Math.round(value * 100) / 100;
        } else {
            return 1;
        }
    } else {
        return 0;
    }
}