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
  function MapReduceConductor(mapReduceAgent, parentId,cfg) {
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

    this.requestThreshold = cfg.default.requestThreshold;
    this.incrementalReduceThreshold = cfg.default.incrementalReduceThreshold;

    this.requestDatasetSize = cfg.default.requestDatasetSize;

    this.clockCycle = cfg.default.clockCycle;

    this.mapSize = cfg.default.mapSize;
    this.reduceSize = cfg.default.reduceSize;

    this.isRunning = false;
    this.timerId;

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
    if(typeof json !== 'object'){
      console.log(json);
    }


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

    if(!this.isRequestWaiting && !isParentRunoutDataset){ //TODO; use this.isParentRunoutDataset
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

  MapReduceConductor.prototype.run = function(){
    this.isRunning = true;
    this.timerId = setInterval(this.onClock.bind(this),this.clockCycle);
  };

  MapReduceConductor.prototype.stop = function(){
    clearInterval(this.timerId);
    this.isRunning = false;
  };

  MapReduceConductor.prototype.onClock = function(){
    this.action();
  };

  return MapReduceConductor;
})();