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

var distThreshold = 30; // min dist to reset allowable connection
var connectDistance = 20;


// joints for comparing
// take out wrist (6,10) and foot (15,19) for all 
// should pass wrist to hand, and foot to ankle....
//var jointsToCompare = [spineBaseComp, spineMidComp, neckComp, headComp, shoLeftComp, elbowLeftComp, wristLeftComp, handLeftComp, shoRightComp, elbowRightComp, wristRightComp, handRightComp, hipLeftComp, kneeLeftComp, ankleLeftComp, footLeftComp, hipRightComp, kneeRightComp, ankleRightComp, footRightComp];

var jointsToCompare = [[kinectron.HEAD], [kinectron.HEAD], [kinectron.HEAD], [3], [3], [3], [3], [3,11], [3], [3], [3], [3,7], [3], [3], [3], [3], [3], [3], [3], [3]];

// test everything with just the head
var spineBaseComp = [3];
var spineMidComp = [3];
var neckComp = [3];
var headComp = [3];
var shoLeftComp = [3];
var elbowLeftComp = [3];
var wristLeftComp = [];
var handLeftComp = [3];
var shoRightComp = [3];
var elbowRightComp = [3];
var wristRightComp = [];
var handRightComp = [3];
var hipLeftComp = [3];
var kneeLeftComp = [3];
var ankleLeftComp = [3];
var footLeftComp = [];
var hipRightComp = [3];
var kneeRightComp = [3];
var ankleRightComp = [3];
var footRightComp = [];




/*var spineBaseComp = [1, 2, 3, 4, 6, 8, 10, 12, 13, 15, 16, 17, 19, 20];
var spineMidComp = [0, 2, 3, 4, 6, 8, 10, 12, 15, 16, 19, 20];
var neckComp = [0, 1, 3, 4, 6, 8, 10, 15, 19, 20];
var headComp = [1, 6, 10, 15, 19, 20];
var shoLeftComp = [1, 2, 4, 5, 6, 10, 15, 19, 20];
var elbowLeftComp = [0, 1, 2, 5, 6, 7, 10, 15, 19, 20];
var wristLeftComp = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
var handLeftComp = [5, 6, 10, 15, 19];*/








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
    kinectron = new Kinectron("172.16.230.182");
    // Connect with application over peer
    kinectron.makeConnection();
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


    // do tests with HEAD and RIGHT HAND
    //if (index1 == 3 && index2 == 11) {

    if (allowableConnections[index1][index2]) {

        if (dist < connectDistance) {

            if (allConnections[index1][index2] == true) {
                console.log("disconnect");
            } else {
                console.log("connect");
            }

            allConnections[index1][index2] = !allConnections[index1][index2];

            console.log(allConnections[index1][index2]);
            allowableConnections[index1][index2] = false;
        }
    } else {
        // check if the body part is far enough away now to be toggled
        if (dist > (connectDistance + distThreshold)) {
            console.log("connection is reset to be allowed");
            allowableConnections[index1][index2] = true;
        }
    }
    //}
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
    kinectron.getJoints(drawJoint);

    for (var j = 0; j < totalJoints; j++) {
        for (var k = 0; k < totalJoints; k++) {
            // only check acceptable joints
            if (jointsToCompare[j].includes(k)) {

                checkDistance(body, j, k);
            }
        }
    }

    drawConnections(body);
}

// Scale the data to fit the screen
// Move it to the center of the screen
// Return it as a vector
function getPos(joint) {
    return createVector((joint.cameraX * width / 2) + width / 2, (-joint.cameraY * width / 2) + height / 2);
}

// Draw points of all joints
function drawJoint(joint) {

    //console.log("JOINT OBJECT", joint);
    var pos = getPos(joint);

    //Kinect location data needs to be normalized to canvas size
    stroke(255);
    strokeWeight(2);
    point(pos.x, pos.y);
}
