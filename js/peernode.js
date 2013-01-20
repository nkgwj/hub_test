/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/19
 * Time: 0:55
 * To change this template use File | Settings | File Templates.
 */

var PeerNode = (function () {
  function PeerNode(id) {
    this.id = id;
    this.dataChannel = connections[id].dataChannel;
  }

  PeerNode.prototype.postMessage = function (str) {
    this.dataChannel.send(JSON.stringify(str))
  };

  PeerNode.prototype.command = function(command,parameter) {
    var message = typeof parameter === 'object' ? parameter : {};
    message.command = command;
    this.postMessage(message);
  };

  return PeerNode;
})();