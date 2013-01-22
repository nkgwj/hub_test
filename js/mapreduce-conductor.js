/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/21
 * Time: 10:18
 * To change this template use File | Settings | File Templates.
 */

var MapReduceConductor = (function () {
  var parentNode;
  var that;
  function MapReduceConductor(mapReduceAgent, parentId) {
    that = this;
    this.agent = mapReduceAgent;
    this.parentId = parentId;

    if (!isRoot()) {
      this.parentNode = function () {
        if (typeof parentNode === 'undefined') {
          parentNode = Command.sendto(parentId);
        }
        return parentNode;
      }
    }

    this.isMapProcessing = false;
    this.isReduceProcessing = false;
    this.isRequestWaiting = false;
    this.agent.worker.mapWorker.onmessage = this.onMapMessage;
    this.agent.worker.reduceWorker.onmessage = this.onReduceMessage;

  }

  MapReduceConductor.prototype.map = function (size) {
    this.isMapProcessing = true;
    this.agent.map(size);
  };

  MapReduceConductor.prototype.reduce = function (size) {
    this.isReduceProcessing = true;
    this.agent.reduce(size);
  };

  MapReduceConductor.prototype.rise = function (size) {
    if (!isRoot()) {
      var subset = that.agent.intermediatesStore.withdraw(size);
      this.parentNode().command('intermediates', {intermediates:subset});
    } else {
      console.error("cannot rise at root node");
    }
  };

  MapReduceConductor.prototype.dataset = function (size) {
    if (!isRoot()) {
      this.parentNode().command('request_dataset', {size:size});
    } else {
      console.error("cannot request dataset at root node");
    }
  };

  MapReduceConductor.prototype.processMessage = function (workerName,json) {
    outputBox.log(JSON.stringify(json));

    if (json.command === 'intermediates') {
      if (json.intermediates) {
        outputBox.message(workerName, 'send a intermediates (size=' + String(Object.keys(json.intermediates).length) + ')');
        that.agent.intermediatesStore.store(json.intermediates);
      } else {
        outputBox.log('invalid intermediates');
      }
    } else {
      outputBox.log('Invalid commands(' + workerName + ')');
    }
  };

  MapReduceConductor.prototype.onMapMessage = function (evt) {
    that.isMapProcessing = false;
    that.processMessage('MapWorker', evt.data);
  };

  MapReduceConductor.prototype.onReduceMessage = function (evt) {
    that.isReduceProcessing = false;
    that.processMessage( 'ReduceWorker', evt.data);
  };



  return MapReduceConductor;
})();