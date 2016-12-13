# LeaParrot
Project for Pervasive Computing - M7012E, Luleå University of Technology

## Objectives
* Pilot a Parrot AR Drone using the Leap Motion Controller
* Pilot a Parrot AR Drone using the XBox Controller
* Display the visuals from the camera into an Oculus Rift DK2
* Use motion planning systems to control the Drone ([LeapMotion](https://www.leapmotion.com/))

## Instructions
The drone can be pilot with three devices, keyboard, LMC and XBox controller asynchronously:
* Keyboard:
    - Take off and landing pressing space
    - Arrows for making flips that way

* LMC:
    - Take off and landing with KeyTap gesture (As the click of a mouse)
    - Up, down, left, right, backward and forward with the fingers not opened
    - Making a circle with the finger, the drone does a flip to that way

* XBox controller:

## Doc

* Node.js: How to [install](https://nodejs.org/es/)

* To be able to work with Leap Motion it is need the [Motion Leap SDK](https://www.leapmotion.com/setup)

* [Cylon: JavaScript Robotics](https://cylonjs.com/), framework for JavaScript, which has an extensible system for connecting to hardware devices such ARDrone or LeapMotion
     - [Drone](https://cylonjs.com/documentation/drivers/ardrone-flight/)
     - [Motion Leap](https://cylonjs.com/documentation/platforms/leapmotion/)


### Some Links
* [Control a Parrot AR Drone 2.0 using a Leap Motion in Node.js](https://github.com/charliegerard/leap_drone)
* [Control the Parrot AR Drone 2.0 with the Leap Motion in Cylon.js](https://github.com/charliegerard/cylon-projects/tree/master/cylon-drone-leapmotion)
     
    "cylon": "^1.3.0",
    "cylon-api-http": "^0.4.1",
    "cylon-ardrone": "^0.21.0",
    "cylon-keyboard": "^0.17.0",
    "cylon-leapmotion": "^0.21.0",
    "ffmpeg": "0.0.4",
    "xbox-controller-node": "^1.6.0"    