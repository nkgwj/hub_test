var connections = {};

function onAnswer(answer, port, fromUser) {
  connections[fromUser].answererPort = port || 5001;
  var connection = connections[fromUser];

  var peerConnection = connection.peerConnection;

  peerConnection.setRemoteDescription(JSON.parse(answer), function () {
    outputBox.log('Recieved a [answer]');

    outputBox.log('[Session Description Negotiation Completed]');
/*
    setTimeout(function () {
      peerConnection.connectDataConnection(connection.offererPort, connection.answererPort);
      outputBox.log('connectDataConnection(' + connection.offererPort + ',' + connection.answererPort + ')');
    }, 500); //3000 -> 500
*/
  }, error);
}

function onOffer(offer, port, fromUser) {
  connections[fromUser] = {offererPort:port || 5000};

  navigator.mozGetUserMedia({audio:true, fake:true}, function (audioStream) {

    var peerConnection = new mozRTCPeerConnection();
    peerConnection.addStream(audioStream);

    peerConnection.ondatachannel = function (event) {
      var channel = event.channel;
      outputBox.log('DataChannel(label=' + channel.label + ')');

      connections[fromUser].dataChannel = setupDataChannel(channel, myId, fromUser);
      childrenIds.push(fromUser);

      $('#childrenIds').text(childrenIds.join(' '));

    };

    peerConnection.onconnection = function () {
      outputBox.log('[Connected]');
    };

    peerConnection.setRemoteDescription(JSON.parse(offer), function () {
      outputBox.log('Received a [offer]');
      peerConnection.createAnswer(function (answer) {
        outputBox.log('Created a [answer]');
        peerConnection.setLocalDescription(answer, function () {

          outputBox.log('Sending:local -[answer]-> remote');
          connections[fromUser].peerConnection = peerConnection;
          //connections[fromUser].answererPort = connections[fromUser].offererPort + 1;

          var answerMessage = {
            type:'answer',
            sender:myId,
            //port:connections[fromUser].answererPort,
            answer:JSON.stringify(answer)
          };

          nodesRef.child(fromUser).child('queue').push(answerMessage);
/*
          setTimeout(function () {
            peerConnection.connectDataConnection(connections[fromUser].answererPort, connections[fromUser].offererPort);
            outputBox.log('connectDataConnection(' + connections[fromUser].answererPort + ',' + connections[fromUser].offererPort + ')');
          }, 500); //3000 -> 500
*/
        }, error);
      }, error);
    }, error);
  }, error);
}

function setupDataChannel(channel, localPC, remotePC) {
  channel.onerror = error;

  channel.onmessage = function (event) {
    var data = event.data;
    if (typeof data !== 'string') {
      return;
    }

    verboseOut.log('message from', remotePC, ' length=', data.length);
    verboseOut.message(remotePC, data);

    var json = JSON.parse(data);
    if (typeof json === 'object' && json.command) {
      Command.dispatch(json.command, remotePC, json);
    }
  };

  channel.onopen = function () {
    outputBox.log('DataChannel opened for (label=' + channel.label + '):' + channel.readyState);
  };

  channel.onclose = function () {
    outputBox.log('DataChannel closed for (label=' + channel.label + '):' + channel.readyState);
  };

  outputBox.log('DataChannel:' + channel.readyState);
  return channel;
}

function initPeerConnection() {
  outputBox.log('Initiate a PeerConnection');

  connections[parentId] = {};

  navigator.mozGetUserMedia({audio:true, fake:true}, function (audioStream) {
    outputBox.log('Created fake AudioStream');

    var peerConnection = new mozRTCPeerConnection();

    peerConnection.addStream(audioStream);

    peerConnection.onconnection = function () {
      outputBox.log('[Connected]');
      //var channel = peerConnection.createDataChannel(String(myId), {});
      //connections[parentId].dataChannel = setupDataChannel(channel, myId, parentId);
    };

    peerConnection.ondatachannel = function (event) {
      var channel = event.channel;
      outputBox.log('DataChannel(label=' + channel.label + ')');
      connections[parentId].dataChannel = channel;
    };

    var channel = peerConnection.createDataChannel(String(myId), {});
    connections[parentId].dataChannel = setupDataChannel(channel, myId, parentId);


    peerConnection.createOffer(function (offer) {
      outputBox.log('Created a [offer]');

      peerConnection.setLocalDescription(offer, function () {
        outputBox.log('Sending:local -[offer]-> remote');

        connections[parentId].peerConnection = peerConnection;
        //connections[parentId].offererPort = Math.floor(Math.random() * 5000) * 2;
        var offerMessage = {
          type:'offer',
          sender:myId,
         // port:connections[parentId].offererPort,
          offer:JSON.stringify(offer)
        };

        nodesRef.child(parentId).child('queue').push(offerMessage);

      }, error);
    }, error);
  }, error);
}

if (checkFeature()) {
  start();
}

