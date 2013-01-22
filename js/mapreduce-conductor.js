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
    this.agent.worker.mapWorker.onmessage = this.onMapMessage.bind(this);
    this.agent.worker.reduceWorker.onmessage = this.onReduceMessage.bind(this);

    this.requestThreshold = 1;
    this.incrementalReduceThreshold = 1;

    this.requestDatasetSize = 1;
    this.mapSize = 1;
    this.ReduceSize = 1;



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
    this.isMapProcessing = false;
    this.processMessage('MapWorker', evt.data);
  };

  MapReduceConductor.prototype.onReduceMessage = function (evt) {
    this.isReduceProcessing = false;
    this.processMessage( 'ReduceWorker', evt.data);
  };

  MapReduceConductor.prototype.onDataset = function(_dataset){
    this.isRequestWaiting = false;

    this.agent.datasetStore.store(_dataset);
    console.log(_dataset);
  };

  MapReduceConductor.prototype.action = function(){

    if(!this.isRequestWaiting){
      if(this.agent.datasetStore.size() < this.requestThreshold){
        console.log('c:request_dataset');
        this.isRequestWaiting = true;
        this.dataset(this.requestDatasetSize);
      }
    }

    if(!this.isMapProcessing){
      if(this.agent.datasetStore.size() >= 1){
        console.log('c:map');
        this.isMapProcessing = true;
        this.map(this.mapSize);
      }
    }
/*
    if(!isReduceProcessing){
      this.isReduceProcessing = true;
    }
*/
  };

  return MapReduceConductor;
})();