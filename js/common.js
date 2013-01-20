/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/11
 * Time: 14:38
 * To change this template use File | Settings | File Templates.
 */
var datasetStore = new DataStore();
var intermediatesStore = new KeyValueStore();

var mapReduceAgent;

var mainRef = new Firebase('https://rtc.firebaseio.com/hub_test_v1/');
var projectsRef = mainRef.child('projects');
var projectRef, nextIdRef, nodesRef;
var project;
var myId, parentId;
var childrenIds = [];

function listen(myId) {
  $('#myId').html(myId);
  parentId = Math.floor(myId / 2);

  if (parentId > 0) {
    $('#parentId').text(parentId);
  } else {
    $('#parentId').text('<*>').addClass('none');
  }

  nextIdRef.set(myId + 1);
  nodesRef.child(myId).child('queue').on('child_added', function (snapshot) {
    var data = snapshot.val();
    snapshot.ref().remove();
    switch (data.type) {
      case 'offer':
        incomingOffer(data.offer, data.port, data.sender);
        break;
      case 'answer':
        incomingAnswer(data.answer, data.port, data.sender);
        break;
    }
  });
}

function isLeaf() {
  return childrenIds.length === 0;
}

function isRoot() {
  return parentId === 0;
}

function checkFeature() {
  if (!navigator.mozGetUserMedia) {
    log('getUserMedia not supported.');
    return false;
  }
  if (!window.mozRTCPeerConnection) {
    log('PeerConnection not supported.');
    return false;
  }
  return true;
}

function sdpbox(sdp) {
  return $('<textarea>').addClass('sdp').text(sdp)[0].outerHTML;
}

function start() {
  if (!checkFeature()) {
    return;
  }
  log('start');
}

function message(subject, body) {
  $('#log').prepend($('<p>').addClass('message').append(
    $('<span>').addClass('message-subject').html(subject)
  ).append(
    $('<span>').addClass('message-body').html(body)
  ));
}

function log(msg) {
  $('#log').prepend($('<p>').addClass('system-log').html(Array.apply(null, arguments).join('')));
}

function error() {
  log('Error');
}

function validateProjectName(projectName) {
  return (typeof projectName === 'string' && projectName != '');
}
