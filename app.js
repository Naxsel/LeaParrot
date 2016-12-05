"use strict";

var Cylon = require("cylon");

Cylon.api("http",{
    port: 8080,
    ssl: false
});

Cylon.robot({
    name: "LeaDrone",

    connections: {
        ardrone: { adaptor: 'ardrone', port: "192.168.1.1"}
    },

    devices: {
        drone: {driver: 'ardrone'}
    },

    work: function(my) {
        my.drone.takeoff();
        after((10).seconds(), function() {
            my.drone.land();
        });
        after((15).seconds(), function() {
            my.drone.stop();
        });
    }
}).start();