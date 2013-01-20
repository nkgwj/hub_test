/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/11
 * Time: 14:38
 * To change this template use File | Settings | File Templates.
 */

if (!window.setImmediate) {
  window.setImmediate = function(func, args){
    return window.setTimeout(func, 0, args);
  };
  window.clearImmediate = window.clearTimeout;
}

var datasetStore = new DataStore();

datasetStore.onrunout = function () {
  isRunoutDataset = isRoot() || isParentRunoutDataset;
  if (isRunoutDataset) {
    outputBox.log('dataset exhausted');
    if (!isLeaf()) {
      setImmediate(function(){
        Command.broadcast('runout_dataset')
      });
    }
  }
};


var command = new Command();

var isParentRunoutDataset;
var isRunoutDataset;

var intermediatesStore = new KeyValueStore();

var mapReduceAgent;

var mainRef = new Firebase('https://rtc.firebaseio.com/hub_test_v1/');
var projectsRef = mainRef.child('projects');
var projectRef, nextIdRef, nodesRef;
var project;
var myId, parentId;
var childrenIds = [];

var outputBox;


function rise(size) {
  var subset = intermediatesStore.withdraw(size);
  Command.sendto(parentId).command('intermediates', {intermediates:subset});
}

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
    outputBox.log('getUserMedia not supported.');
    return false;
  }
  if (!window.mozRTCPeerConnection) {
    outputBox.log('PeerConnection not supported.');
    return false;
  }
  return true;
}

function start() {
  if (!checkFeature()) {
    return;
  }
}

function error() {
  outputBox.log('Error');
}

function validateProjectName(projectName) {
  return (typeof projectName === 'string' && projectName != '');
}


$(function () {
  outputBox = new OutputBox("#log");
});
