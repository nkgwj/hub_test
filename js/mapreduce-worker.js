/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/18
 * Time: 22:58
 * To change this template use File | Settings | File Templates.
 */

var MapReduceWorker = (function () {
  function MapReduceWorker(mapProgram, reduceProgram) {
    var createProgramObjectURL = function (sourceCode) {
      var blob = new Blob([sourceCode], {type:'text\/javascript'});
      return URL.createObjectURL(blob);
    };
    var mapObjectURL = createProgramObjectURL(mapProgram);
    var reduceObjectURL = reduceProgram ? createProgramObjectURL(reduceProgram) : mapObjectURL;

    this.mapWorker = new Worker(mapObjectURL);
    this.reduceWorker = new Worker(reduceObjectURL);
    /*
    this.mapWorker.onmessage = this.reduceWorker.onmessage = function (evt) {
      var json = evt.data;
      outputBox.log(JSON.stringify(json));

      if (json.command === 'intermediates') {
        if (json.intermediates) {
          outputBox.message('worker', 'send a intermediates (size=' + String(json.intermediates.length) + ')');
          intermediatesStore.store(json.intermediates);
        } else {
          outputBox.log('invalid intermediates');
        }
      } else {
        outputBox.log('Invalid commands(worker)');
      }
    };*/
  }

  MapReduceWorker.prototype.map = function (subsetDataset) {
    this.mapWorker.postMessage({command:'map', dataset:subsetDataset});
  };

  MapReduceWorker.prototype.reduce = function (subsetIntermediates) {
    this.reduceWorker.postMessage({command:'reduce', intermediates:subsetIntermediates});
  };

  return MapReduceWorker;
})();

