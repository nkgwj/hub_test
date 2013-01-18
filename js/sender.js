/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/19
 * Time: 0:55
 * To change this template use File | Settings | File Templates.
 */

var Sender = (function () {
  function Sender(id) {
    this.id = id;
    this.dataChannel = connections[id].dataChannel;
  }

  Sender.prototype.postMessage = function (str) {
    this.dataChannel.send(JSON.stringify(str))
  };

  Sender.prototype.command = function(command,parameter) {
    var message = typeof parameter === 'object' ? parameter : {};
    message.command = command;
    this.postMessage(message);
  };

  return Sender;
})();