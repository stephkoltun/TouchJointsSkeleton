/*
Stephanie Koltun
Body Drawing
Connecting joints to create an unusual skeleton
*/

// Declare kinectron
var kinectron = null;

var allConnections = []; // whether the joints are connected
var allowableConnections = []; // whether the joint connections CAN be toggled
var totalJoints = 20; // exclude spineshoulder, hand tips, and thumbs

var jointsToCompare; // declare array for later

var distThreshold = 30; // min dist to reset allowable connection
var connectDistance = 25;

function setup() {
    createCanvas(windowWidth, windowHeight);

    // set-up two dimensional array for tracking 
    // which body parts are connected
    // what the set distance was for two joints
    // where the joint has moved away enough to allow toggling state
    for (var j = 0; j < totalJoints; j++) {
        allConnections[j] = [];
        allowableConnections[j] = [];

        for (var k = 0; k < totalJoints; k++) {
            allConnections[j][k] = false;
            allowableConnections[j][k] = true;
        }
    }


    // KINECTRON SETUP
    // Define and create an instance of kinectron
    kinectron = new Kinectron("172.16.226.31");
    // Connect with application over peer
    kinectron.makeConnection();


    // JOINTS SETUP
    // select specific joints that can be connected
    // ignore spineshoulder, hand tips, thumbs
    // take out wrist (6,10) and foot (15,19) for all 
    // should really pass wrist to hand, and foot to ankle....
    var spineBaseComp = [];
    var spineMidComp = [];
    var neckComp = [];
    //var neckComp = [kinectron.ELBOWLEFT,kinectron.HANDLEFT,kinectron.ELBOWRIGHT,kinectron.HANDRIGHT,kinectron.KNEELEFT,kinectron.ANKLELEFT,kinectron.KNEERIGHT,kinectron.ANKLERIGHT];
    var headComp = [kinectron.SHOULDERLEFT, kinectron.ELBOWLEFT, kinectron.HANDLEFT, kinectron.SHOULDERRIGHT, kinectron.ELBOWRIGHT, kinectron.HANDRIGHT, kinectron.HIPLEFT, kinectron.KNEELEFT, kinectron.ANKLELEFT, kinectron.HIPRIGHT, kinectron.KNEERIGHT, kinectron.ANKLERIGHT];
    var shoLeftComp = [kinectron.HEAD, kinectron.HANDLEFT, kinectron.ELBOWRIGHT, kinectron.HANDRIGHT, kinectron.KNEELEFT, kinectron.ANKLELEFT, kinectron.KNEERIGHT, kinectron.ANKLERIGHT];
    var elbowLeftComp = [kinectron.HEAD, kinectron.SHOULDERRIGHT, kinectron.ELBOWRIGHT, kinectron.HANDRIGHT, kinectron.HIPLEFT, kinectron.KNEELEFT, kinectron.ANKLELEFT, kinectron.HIPRIGHT, kinectron.KNEERIGHT, kinectron.ANKLERIGHT];
    var wristLeftComp = [];
    var handLeftComp = [kinectron.HEAD, kinectron.SHOULDERLEFT, kinectron.SHOULDERRIGHT, kinectron.ELBOWRIGHT, kinectron.HANDRIGHT, kinectron.HIPLEFT, kinectron.KNEELEFT, kinectron.ANKLELEFT, kinectron.HIPRIGHT, kinectron.KNEERIGHT, kinectron.ANKLERIGHT];
    var shoRightComp = [kinectron.HEAD, kinectron.ELBOWLEFT, kinectron.HANDLEFT, kinectron.HANDRIGHT, kinectron.HIPLEFT, kinectron.KNEELEFT, kinectron.ANKLELEFT, kinectron.KNEERIGHT, kinectron.ANKLERIGHT];
    var elbowRightComp = [kinectron.HEAD, kinectron.SHOULDERLEFT, kinectron.ELBOWLEFT, kinectron.HANDLEFT, kinectron.HIPLEFT, kinectron.KNEELEFT, kinectron.ANKLELEFT, kinectron.HIPRIGHT, kinectron.KNEERIGHT, kinectron.ANKLERIGHT];
    var wristRightComp = [];
    var handRightComp = [kinectron.HEAD, kinectron.SHOULDERLEFT, kinectron.ELBOWLEFT, kinectron.HANDLEFT, kinectron.SHOULDERRIGHT, kinectron.HIPLEFT, kinectron.KNEELEFT, kinectron.ANKLELEFT, kinectron.HIPRIGHT, kinectron.KNEERIGHT, kinectron.ANKLERIGHT];
    var hipLeftComp = [kinectron.HEAD, kinectron.ELBOWLEFT, kinectron.HANDLEFT, kinectron.SHOULDERRIGHT, kinectron.ELBOWRIGHT, kinectron.HANDRIGHT, kinectron.KNEERIGHT, kinectron.ANKLERIGHT];
    var kneeLeftComp = [kinectron.HEAD, kinectron.SHOULDERLEFT, kinectron.ELBOWLEFT, kinectron.HANDLEFT, kinectron.SHOULDERRIGHT, kinectron.ELBOWRIGHT, kinectron.HANDRIGHT, kinectron.HIPRIGHT, kinectron.KNEERIGHT, kinectron.ANKLERIGHT];
    var ankleLeftComp = [kinectron.HEAD, kinectron.SHOULDERLEFT, kinectron.ELBOWLEFT, kinectron.HANDLEFT, kinectron.SHOULDERRIGHT, kinectron.ELBOWRIGHT, kinectron.WRISTRIGHT, kinectron.HIPRIGHT, kinectron.KNEERIGHT, kinectron.ANKLERIGHT];
    var footLeftComp = [];
    var hipRightComp = [kinectron.HEAD, kinectron.SHOULDERLEFT, kinectron.ELBOWLEFT, kinectron.WRISTLEFT, kinectron.ELBOWRIGHT, kinectron.HANDRIGHT, kinectron.KNEELEFT, kinectron.ANKLELEFT];
    var kneeRightComp = [kinectron.HEAD, kinectron.SHOULDERLEFT, kinectron.ELBOWLEFT, kinectron.HANDLEFT, kinectron.SHOULDERRIGHT, kinectron.ELBOWRIGHT, kinectron.HANDRIGHT, kinectron.HIPLEFT, kinectron.KNEELEFT, kinectron.ANKLELEFT];
    var ankleRightComp = [kinectron.HEAD, kinectron.SHOULDERLEFT, kinectron.ELBOWLEFT, kinectron.HANDLEFT, kinectron.SHOULDERRIGHT, kinectron.ELBOWRIGHT, kinectron.HANDRIGHT, kinectron.HIPLEFT, kinectron.KNEELEFT, kinectron.ANKLELEFT];
    var footRightComp = [];

    // add individual arrays to 2D for ease of looping
    jointsToCompare = [spineBaseComp, spineMidComp, neckComp, headComp, shoLeftComp, elbowLeftComp, wristLeftComp, handLeftComp, shoRightComp, elbowRightComp, wristRightComp, handRightComp, hipLeftComp, kneeLeftComp, ankleLeftComp, footLeftComp, hipRightComp, kneeRightComp, ankleRightComp, footRightComp];

    // Request all tracked bodies and pass data to your callback
    kinectron.startTrackedBodies(bodyTracked);

    background(0);
}

function draw() {
    //background(0);
}


function checkDistance(bodyObj, index1, index2) {
    // convert values to vectors
    var firstJoint = getPos(bodyObj.joints[index1]);
    var secondJoint = getPos(bodyObj.joints[index2]);

    var resultant = p5.Vector.sub(firstJoint, secondJoint);
    var dist = p5.Vector.mag(resultant);


    if (allowableConnections[index1][index2]) {

        if (dist < connectDistance) {

            if (allConnections[index1][index2] == true) {
                console.log("disconnect");
            } else {
                console.log("connect");
            }

            allConnections[index1][index2] = !allConnections[index1][index2];
            allowableConnections[index1][index2] = false;
        }
    } else {
        // check if the body part is far enough away now to be toggled
        if (dist > (connectDistance + distThreshold)) {
            console.log("connection is reset to be allowed");
            allowableConnections[index1][index2] = true;
        }
    }
}



function drawConnections(bodyObj) {
    for (j = 0; j < allConnections.length; j++) {
        for (k = 0; k < allConnections.length; k++) {

            if (allConnections[j][k] == true) {

                var firstJoint = getPos(bodyObj.joints[j]);
                var secondJoint = getPos(bodyObj.joints[k]);

                strokeWeight(3);
                stroke(255);
                noFill();
                line(firstJoint.x, firstJoint.y, secondJoint.x, secondJoint.y);
            }
        }
    }

}

function bodyTracked(body) {
    background(0);

    // Draw all the joints as circles
    drawJoints(body);

    //kinectron.getJoints(drawJoint);

    for (var j = 0; j < totalJoints; j++) {
        for (var k = 0; k < totalJoints; k++) {
            // only check acceptable joints
            if (jointsToCompare[j].includes(k)) {

                checkDistance(body, j, k);
            }
        }
    }

    drawConnections(body);
    noStroke();
    fill(255);
    text("connection threshold: " + connectDistance, 50, 50);
}

// Scale the data to fit the screen
// Move it to the center of the screen
// Return it as a vector
function getPos(joint) {
    return createVector((joint.cameraX * width / 3) + width / 2, (-joint.cameraY * width / 3) + height / 2);
}

function drawJoints(body) {
    var joint = null;
    for (var jointType in body.joints) {
        if (jointType == 3 || jointType == 4 || jointType == 5 || jointType == 7 || jointType == 8 || jointType == 9 || jointType == 11 || jointType == 12 || jointType == 13 || jointType == 14 || jointType == 16 || jointType == 17 || jointType == 18) {
            joint = body.joints[jointType];

            var pos = getPos(joint);
            stroke(255);
            strokeWeight(2);
            point(pos.x, pos.y);
        }

    }
}

// Draw points of all joints
function drawJoint(joint) {

    // MAKE SURE TO NOT DRAW THE JOINTS WE'RE NOT USING!
    //console.log("JOINT OBJECT", joint);
    var pos = getPos(joint);

    //Kinect location data needs to be normalized to canvas size
    stroke(255);
    strokeWeight(2);
    point(pos.x, pos.y);
}

function keyPressed() {

    if (key == "a" || key == "A") {
        console.log("down");
        connectDistance--;
    }

    if (key == "s" || key == "S") {
        connectDistance++;
    }

}
