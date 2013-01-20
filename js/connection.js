var connections = {};

function incomingAnswer(answer, port, fromUser) {
  connections[fromUser].answererPort = port || 5001;
  var connection = connections[fromUser];

  var peerConnection = connection.peerConnection;

  peerConnection.setRemoteDescription(JSON.parse(answer), function () {
    log('Recieved a [answer]');

    log('[Session Description Negotiation Completed]');
    setTimeout(function () {
      peerConnection.connectDataConnection(connection.offererPort, connection.answererPort);
      log('connectDataConnection(' + connection.offererPort + ',' + connection.answererPort + ')');
    }, 500); //3000 -> 500
  }, error);
}

function incomingOffer(offer, port, fromUser) {
  connections[fromUser] = {offererPort: port || 5000};

  navigator.mozGetUserMedia({audio:true, fake:true}, function (audioStream) {

    var peerConnection = new mozRTCPeerConnection();
    peerConnection.addStream(audioStream);

    peerConnection.ondatachannel = function (channel) {
      log('DataChannel(label=' + channel.label + ')');

      connections[fromUser].dataChannel = setupDataChannel(channel, myId, fromUser);
      childrenIds.push(fromUser);

      $('#childrenIds').text(childrenIds.join(' '));

    };

    peerConnection.onconnection = function () {
      log('[Connected]');
    };

    peerConnection.setRemoteDescription(JSON.parse(offer), function () {
      log('Received a [offer]');
      peerConnection.createAnswer(function (answer) {
        log('Created a [answer]');
        peerConnection.setLocalDescription(answer, function () {

          log('Sending:local -[answer]-> remote');
          connections[fromUser].peerConnection = peerConnection;
          connections[fromUser].answererPort = connections[fromUser].offererPort + 1;

          var toSend = {
            type:'answer',
            sender:myId,
            port:connections[fromUser].answererPort,
            answer:JSON.stringify(answer)
          };

          nodesRef.child(fromUser).child('queue').push(toSend);

          setTimeout(function () {
            peerConnection.connectDataConnection(connections[fromUser].answererPort, connections[fromUser].offererPort);
            log('connectDataConnection(' + connections[fromUser].answererPort + ',' + connections[fromUser].offererPort + ')');
          }, 500); //3000 -> 500
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

    log('message from', remotePC, ' length=', data.length);
    message(remotePC, data);

    var json = JSON.parse(data);
    if (typeof json === 'object' && json.command) {
      commandDispatcher(json.command, remotePC, json);
    }
  };

  channel.onopen = function () {
    log('DataChannel opened for (label=' + channel.label+'):' + channel.readyState);
  };

  channel.onclose = function () {
    log('DataChannel closed for (label=' + channel.label+'):' + channel.readyState);
  };

  log('DataChannel:' + channel.readyState);
  return channel;
}

function initiatePeerConnection() {
  log('Initiate a PeerConnection');

  connections[parentId] = {};

  navigator.mozGetUserMedia({audio:true, fake:true}, function (audioStream) {
    log('Created fake AudioStream');

    var peerConnection = new mozRTCPeerConnection();

    peerConnection.addStream(audioStream);

    peerConnection.onconnection = function () {
      log('[Connected]');
      var channel = peerConnection.createDataChannel(String(myId), {});
      connections[parentId].dataChannel = setupDataChannel(channel, myId, parentId);
    };

    peerConnection.ondatachannel = function (channel) {
      log('DataChannel(label=' + channel.label + ')');
      connections[parentId].dataChannel = channel;

    };

    peerConnection.createOffer(function (offer) {
      log('Created a [offer]');

      peerConnection.setLocalDescription(offer, function () {
        log('Sending:local -[offer]-> remote');

        connections[parentId].peerConnection = peerConnection;
        connections[parentId].offererPort = Math.floor(Math.random() * 5000) * 2;
        var toSend = {
          type:'offer',
          sender:myId,
          port:connections[parentId].offererPort,
          offer:JSON.stringify(offer)
        };

        nodesRef.child(parentId).child('queue').push(toSend);

      }, error);
    }, error);
  }, error);
}

if (checkFeature()) {
  start();
}

