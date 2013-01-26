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

  //Alias for long Signature
  var _intermediates;
  var _dataset;


  function MapReduceConductor(mapReduceAgent, parentId, cfg) {
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
    this.agent.worker.mapWorker.onerror = this.onError.bind(this, 'map');
    this.agent.worker.reduceWorker.onerror = this.onError.bind(this, 'reduce');
    this.requestThreshold = cfg.default.requestThreshold;
    this.incrementalReduceThreshold = cfg.default.incrementalReduceThreshold;

    this.requestDatasetSize = cfg.default.requestDatasetSize;

    this.clockCycle = cfg.default.clockCycle;

    this.mapSize = cfg.default.mapSize;
    this.reduceSize = cfg.default.reduceSize;
    this.riseSize = cfg.default.riseSize;

    this.isRunning = false;
    this.timerId;


    _intermediates = this.agent.intermediatesStore;
    _dataset = this.agent.datasetStore;

  }

  MapReduceConductor.prototype.dataset = function (size) {
    if (!isRoot()) {
      this.isRequestWaiting = true;
      this.parentNode().command('request_dataset', {size:size});
    } else {
      console.error("cannot request dataset at root node");
    }
  };

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
      var subset = _intermediates.withdraw(size);
      this.parentNode().command('intermediates', {intermediates:subset});
    } else {
      console.error("cannot rise at root node");
    }
  };

  MapReduceConductor.prototype.storeIntermediates = function (newIntermediates) {
    _intermediates.store(newIntermediates);
  };

  MapReduceConductor.prototype.processMessage = function (workerName, json) {
    if (typeof json !== 'object' && CONFIG.verbose) {
      console.log(json);
    }

    verboseOut.log(JSON.stringify(json));

    if (json.command === 'intermediates') {
      if (json.intermediates) {
        verboseOut.message(workerName, 'send a intermediates (size=' + String(Object.keys(json.intermediates).length) + ')');
        this.storeIntermediates(json.intermediates);
      } else {
        outputBox.log('invalid intermediates');
      }
    } else {
      outputBox.log('Invalid commands(' + workerName + ')');
      console.log(json);
    }
  };

  MapReduceConductor.prototype.onMapMessage = function (evt) {
    this.isMapProcessing = false;
    this.processMessage('MapWorker', evt.data);
  };

  MapReduceConductor.prototype.onReduceMessage = function (evt) {
    this.isReduceProcessing = false;
    this.processMessage('ReduceWorker', evt.data);
  };

  MapReduceConductor.prototype.onDataset = function (newDataset) {
    this.isRequestWaiting = false;

    _dataset.store(newDataset);

    if (CONFIG.verbose) {
      console.log(newDataset);
    }
  };

  MapReduceConductor.prototype.onError = function (workerType, error) {
    console.log(workerType, error);
  };

  MapReduceConductor.prototype.action = function () {

//TODO  use this.isParentRunoutDataset

    if (!(this.isRequestWaiting || isParentRunoutDataset || isRoot())) {
      if (_dataset.size() < this.requestThreshold) {
        if (CONFIG.verbose) {
          console.log('c:request_dataset');
        }

        this.dataset(this.requestDatasetSize);
      }
    }

    if (!this.isMapProcessing) {
      if (!_dataset.isEmpty()) {
        if (CONFIG.verbose) {
          console.log('c:map');
        }
        this.map(this.mapSize);
      }
    }

    if (!this.isReduceProcessing) {


      if (_intermediates.size() >= this.incrementalReduceThreshold && !_intermediates.isAllReduced) {

        this.reduce(this.reduceSize);

      } else if (!_intermediates.isEmpty()) {

        if (isRoot()) {
          if (!_intermediates.isAllReduced) {
            this.reduce(this.reduceSize)
          }
        } else if (isParentRunoutDataset) {
          this.rise(this.riseSize);
        }
      }

      var isChildrenRunoutIntermediates = isLeaf() || isAllChildrenCompleted();

      if (isChildrenRunoutIntermediates && _dataset.isEmpty()) {

        if (isRoot() && _intermediates.isAllReduced) {

          outputBox.message("All", "Completed");
          this.stop();
          outputBox.message("Time(s):", Math.round(this.stopTime - this.startTime) / 1000);
          this.showResult();

        } else if (!isRoot() && _intermediates.isEmpty() && isParentRunoutDataset) {

          Command.sendto(parentId).command('completed');
          outputBox.message("Subtree", "Completed");
          this.stop();

        }
      }
    }
  };


  MapReduceConductor.prototype.run = function () {
    this.startTime = performance.now();
    this.isRunning = true;
    this.timerId = setInterval(this.onClock.bind(this), this.clockCycle);
  };

  MapReduceConductor.prototype.stop = function () {
    this.stopTime = performance.now();
    clearInterval(this.timerId);
    this.isRunning = false;
  };

  MapReduceConductor.prototype.onClock = function () {
    this.action();
  };

  MapReduceConductor.prototype.showResult = function () {
    var link = $("<a>").attr({
      "href":intermediatesStore.objectURI(),
      "download":'result.csv'
    }).html("[click]");
    outputBox.message("Result:", link);
  };


  return MapReduceConductor;
})();
