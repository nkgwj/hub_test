/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/11
 * Time: 14:38
 * To change this template use File | Settings | File Templates.
 */

var mainRef = new Firebase("https://rtc.firebaseio.com/hub_test_v1/");
var projectsRef = mainRef.child("projects");
var projectRef,nextIdRef,nodesRef;
var project;
var myId,parentId;
//var childrenIds = [];

function listen(myId) {
    parentId = Math.floor(myId / 2);
    log("Your ID:" + myId + "\nParent ID:" + parentId);
    nextIdRef.set(myId + 1);
    nodesRef.child(myId).child("queue").on('child_added', function (snapshot) {
        var data = snapshot.val();
        log(JSON.stringify(data));
        snapshot.ref().remove();
        switch (data.type) {
            case "offer":
                incomingOffer(data.offer, data.port, data.sender);
                break;
            case "answer":
                incomingAnswer(data.answer, data.port, data.sender);
                break;
        }
    });
}


function checkFeature(){
    if (!navigator.mozGetUserMedia) {
        error("Sorry, getUserMedia is not available! (Did you set media.navigator.enabled?)");
        return false;
    }
    if (!window.mozRTCPeerConnection) {
        error("Sorry, PeerConnection is not available! (Did you set media.peerconnection.enabled?)");
        return false;
    }
    return true;
}

function sdpbox(sdp){
    return $("<textarea>").addClass("sdp").text(sdp)[0].outerHTML;
}

function start() {
    if(!checkFeature()){
        return;
    }
    log("start");
}

function message(subject,body) {
    $("#log").prepend($("<p>").addClass("message").append(
        $("<span>").addClass('message-subject').html(subject)
    ).append(
        $("<span>").addClass('message-body').html(body)
    ));
}

function log(msg){
    $("#log").prepend($("<p>").addClass("system-log").html(Array.apply(null, arguments).join("")));
}

function error(e) {
    console.log(e);
    if (typeof e === typeof {}) {
        alert("Oh no! " + JSON.stringify(e));
    } else {
        alert("Oh no! " + e);
    }
    endCall();
}

function validateProjectName(projectName) {
    if (typeof projectName !== 'string') {
        return false;
    }

    if (projectName == ""){
        return false;
    }
    return true;
}
