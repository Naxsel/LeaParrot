# LeaParrot
Project for Pervasive Computing - M7012E, Luleå University of Technology

## Objectives
* Pilot a Parrot AR Drone using the Leap Motion Controller
* Pilot a Parrot AR Drone using a gamepad controller
* Display the visuals from the camera into an Oculus Rift DK2
* Use motion planning systems to control the Drone ([LeapMotion](https://www.leapmotion.com/))

## Instructions
The drone can be pilot with three devices, keyboard, LMC and XBox controller asynchronously:
* Keyboard:
    - Take off and landing pressing space
    - Arrows for making flips that way
* LeapMC:
    - Take off and landing with KeyTap gesture (As the click of a mouse)
    - Up, down, left, right, backward and forward with the fingers not opened
    - Making a circle with the finger, the drone does a flip to that way
* Xbox controller:
    - RB and LB bumpers to take off and launch respectively
    - Right Joystick to go up, down, clockwise and counterclockwise movements. Up and Down movements and also be used to take off and land the drone
    - Left Joystick to go forward, backwards, left and right
    - a,b,x,y buttons for the respective direction flip
    - Xbox mid button for emergency stop(Linux Only)

## Set-Up

The OS available for the system platform can be any OSX or Linux version, but you may need to install some aditional drivers or libraries depending on the version. The system used was Ubuntu 14.04

* Node.js: How to [install](https://nodejs.org/en/download/package-manager/)
* To be able to work with Leap Motion it is need the [Motion Leap SDK V2](https://developer.leapmotion.com/sdk/v2)
* [Cylon: JavaScript Robotics](https://cylonjs.com/), framework for JavaScript, which has an extensible system for connecting to hardware devices such ARDrone or LeapMotion
     - [Drone](https://cylonjs.com/documentation/drivers/ardrone-flight/)
     - [Motion Leap](https://cylonjs.com/documentation/platforms/leapmotion/)
* Joystick: In this case a Xbox 360 Wireless Controller, and [xbox-controler-node](https://www.npmjs.com/package/xbox-controller-node) as the npm package. Check the link to install the necessary libraries for the gamepad. 


### Some Links
* [Control a Parrot AR Drone 2.0 using a Leap Motion in Node.js](https://github.com/charliegerard/leap_drone)
* [Control the Parrot AR Drone 2.0 with the Leap Motion in Cylon.js](https://github.com/charliegerard/cylon-projects/tree/master/cylon-drone-leapmotion)
* [HTTP png stream for Parrot AR Drone 2.0](https://www.npmjs.com/package/ar-drone-png-stream)
* [Leap Ardrone](https://cylonjs.com/documentation/examples/cylon/js/leap_ardrone/)  
