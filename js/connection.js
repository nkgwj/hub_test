var connections = {};

function incomingOffer(offer, port, fromUser) {
  acceptCall(offer, port, fromUser);
}

function incomingAnswer(answer, port, fromUser) {
  connections[fromUser].answererPort = port || 5001;
  var connection = connections[fromUser];

  var pc = connection.peerConnection;

  pc.setRemoteDescription(JSON.parse(answer), function () {
    log("Recieved answer" + sdpbox(JSON.parse(answer).sdp));

    log("sdp negotiation finished");
    setTimeout(function () {
      pc.connectDataConnection(connection.offererPort, connection.answererPort);
      log("connectDataConnection(" + connection.offererPort + "," + connection.answererPort + ")");
    }, 3000);
  }, error);
}

function acceptCall(offer, port, fromUser) {
  log("Incoming call with offer" + sdpbox(JSON.parse(offer).sdp));
  connections[fromUser] = {};

  connections[fromUser].offererPort = port || 5000;

  navigator.mozGetUserMedia({audio:true, fake:true}, function (as) {

    var pc = new mozRTCPeerConnection();
    pc.addStream(as);

    pc.ondatachannel = function (channel) {
      log("pc2 onDataChannel = " + channel + ", label='" + channel.label + "'");
      log("pc2 created channel " + channel + " binarytype = " + channel.binaryType);

      channel.binaryType = "blob";

      log("pc2 new binarytype = " + channel.binaryType);

      connections[fromUser].dataChannel = setupChannel(channel, myId, fromUser);
      childrenIds.push(fromUser);
      $("#childrenIds").text(childrenIds.join(" "));

      if (channel.readyState !== 0) {
        log("*** pc2 no onopen??! possible race");
      }

    };

    pc.onaddstream = onaddstream;

    pc.onconnection = function () {
      log("pc2 onconnection");
    };

    pc.setRemoteDescription(JSON.parse(offer), function () {
      log("setRemoteDescription, creating answer");

      pc.createAnswer(function (answer) {
        pc.setLocalDescription(answer, function () {
          // Send answer to remote end.
          log("created Answer and setLocalDescription " + sdpbox(answer.sdp));
          connections[fromUser].peerConnection = pc;
          connections[fromUser].answererPort = connections[fromUser].offererPort + 1;
          var toSend = {
            type:"answer",
            sender:myId,
            port:connections[fromUser].answererPort,
            answer:JSON.stringify(answer)
          };

          log(toSend);
          nodesRef.child(fromUser).child("queue").push(toSend);
          log("--tosend--");

          setTimeout(function () {
            pc.connectDataConnection(connections[fromUser].answererPort, connections[fromUser].offererPort);
            log("connectDataConnection(" + connections[fromUser].answererPort + "," + connections[fromUser].offererPort + ")");
          }, 3000);
        }, error);
      }, error);
    }, error);
  }, error);

}


function setupChannel(channel, localPC, remotePC) {
  channel.onerror = error;
  channel.onmessage = function (evt) {
    var data = evt.data;
    if (data instanceof Blob) {
      log("file from ", remotePC, " ,length=", data.size);

      var objectURL = window.URL.createObjectURL(data);
      message(remotePC, " sent Blob: <a href='" + objectURL + "'>[File]</a>, type=" + data.type + ", length=" + data.size);
      console.dir(data);

    } else {
      log("message from", remotePC, " length=", data.length);
      message(remotePC, data);

      var json = JSON.parse(data);
      if (typeof json === "object" && json.command) {
        commandDispatcher(json.command, remotePC, json);
      }
    }
  };

  channel.onopen = function () {
    log(localPC + " onopen fired for " + channel);
    log(localPC + "state: " + channel.state);
  };
  channel.onclose = function () {
    log(localPC + " onclosed fired");
  };
  log(localPC + " state:" + channel.readyState);
  return channel;
}

function onaddstream(obj) {
  log("Got onaddstream of type " + obj.type);
}

function initiateCall() {
  log("initiateCall");

  connections[parentId] = {};

  navigator.mozGetUserMedia({audio:true, fake:true}, function (as) {
    console.log("gotMedia", as);

    log("gotMedia");

    var pc = new mozRTCPeerConnection();

    pc.addStream(as);

    pc.onaddstream = onaddstream;

    pc.onconnection = function () {
      log("pc1 onconnection");

      var channel = pc.createDataChannel("This is pc1", {}); // reliable (TCP-like)

      connections[parentId].dataChannel = setupChannel(channel, myId, parentId, "Hello out there.");
    };

    pc.ondatachannel = function (channel) {
      log("pc onDataChannel = " + channel + ", label='" + channel.label + "'");
      connections[parentId].dataChannel = channel;

      if (setupChannel(channel, myId, parentId).readyState !== 0) {
        log("*** pc1 no onopen??! possible race");
      }
    };

    pc.createOffer(function (offer) {
      log("Created offer" + sdpbox(offer.sdp));
      console.log(offer.sdp);
      pc.setLocalDescription(offer, function () {
        // Send offer to remote end.
        log("setLocalDescription, sending to remote");


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

function endCall() {
  log("Ending call");
}

if (checkFeature()) {
  start();
}

