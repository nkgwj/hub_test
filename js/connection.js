var connections = {};

function incomingAnswer(answer, port, fromUser) {
  connections[fromUser].answererPort = port || 5001;
  var connection = connections[fromUser];

  var pc = connection.peerConnection;

  pc.setRemoteDescription(JSON.parse(answer), function () {
    log("Recieved answer"); // + sdpbox(JSON.parse(answer).sdp));

    log("[SDP Negotiation Completed]");
    setTimeout(function () {
      pc.connectDataConnection(connection.offererPort, connection.answererPort);
      log("connectDataConnection(" + connection.offererPort + "," + connection.answererPort + ")");
    }, 500); //3000 -> 500
  }, error);
}

function incomingOffer(offer, port, fromUser) {
  connections[fromUser] = {};

  connections[fromUser].offererPort = port || 5000;

  navigator.mozGetUserMedia({audio:true, fake:true}, function (audioStream) {

    var pc = new mozRTCPeerConnection();
    pc.addStream(audioStream);

    pc.ondatachannel = function (channel) {
      log("DataChannel(label=" + channel.label + ")");

      connections[fromUser].dataChannel = setupChannel(channel, myId, fromUser);
      childrenIds.push(fromUser);

      $("#childrenIds").text(childrenIds.join(" "));

      if (channel.readyState !== 0) {
        log("*** pc2 no onopen??! possible race");
      }

    };

    pc.onaddstream = onaddstream;

    pc.onconnection = function () {
      log("[Connected]");
    };

    pc.setRemoteDescription(JSON.parse(offer), function () {
      log("Received offer");
      pc.createAnswer(function (answer) {
        log("Created answer")//+ sdpbox(answer.sdp))
        pc.setLocalDescription(answer, function () {

          log("Sending:local -[answer]-> remote");// + sdpbox(JSON.parse(offer).sdp));
          connections[fromUser].peerConnection = pc;
          connections[fromUser].answererPort = connections[fromUser].offererPort + 1;
          var toSend = {
            type:"answer",
            sender:myId,
            port:connections[fromUser].answererPort,
            answer:JSON.stringify(answer)
          };

          nodesRef.child(fromUser).child("queue").push(toSend);

          setTimeout(function () {
            pc.connectDataConnection(connections[fromUser].answererPort, connections[fromUser].offererPort);
            log("connectDataConnection(" + connections[fromUser].answererPort + "," + connections[fromUser].offererPort + ")");
          }, 500); //3000 -> 500
        }, error);
      }, error);
    }, error);
  }, error);
}

function setupChannel(channel, localPC, remotePC) {
  channel.onerror = error;
  channel.onmessage = function (evt) {
    var data = evt.data;
    if (typeof data !== 'string') {
      return;
    }

    log("message from", remotePC, " length=", data.length);
    message(remotePC, data);

    var json = JSON.parse(data);
    if (typeof json === "object" && json.command) {
      commandDispatcher(json.command, remotePC, json);
    }
  };

  channel.onopen = function () {
    log("DataChannel opened for (label=" + channel.label+"):" + channel.readyState);
  };
  channel.onclose = function () {
    log("DataChannel closed for (label=" + channel.label+"):" + channel.readyState);
  };
  log(localPC + " DataChannel:" + channel.readyState);
  return channel;
}

function onaddstream(obj) {
  log("Got onaddstream of type " + obj.type);
}

function initiateCall() {
  log("initiateCall");

  connections[parentId] = {};

  navigator.mozGetUserMedia({audio:true, fake:true}, function (audioStream) {
    log("got fakeStream");

    var pc = new mozRTCPeerConnection();

    pc.addStream(audioStream);

    pc.onaddstream = onaddstream;

    pc.onconnection = function () {
      log("[Connected]");
      var channel = pc.createDataChannel(String(myId), {});
      connections[parentId].dataChannel = setupChannel(channel, myId, parentId, "Hello out there.");
    };

    pc.ondatachannel = function (channel) {
      log("DataChannel(label=" + channel.label + ")");
      connections[parentId].dataChannel = channel;

      if (setupChannel(channel, myId, parentId).readyState !== 0) {
        log("*** pc1 no onopen??! possible race");
      }
    };

    pc.createOffer(function (offer) {
      log("Created offer");// + sdpbox(offer.sdp));

      pc.setLocalDescription(offer, function () {
        log("Sending:local -[offer]-> remote");

        connections[parentId].peerConnection = pc;
        connections[parentId].offererPort = Math.floor(Math.random() * 5000) * 2;
        var toSend = {
          type:"offer",
          sender:myId,
          port:connections[parentId].offererPort,
          offer:JSON.stringify(offer)
        };

        nodesRef.child(parentId).child("queue").push(toSend);

      }, error);
    }, error);
  }, error);
}

if (checkFeature()) {
  start();
}

