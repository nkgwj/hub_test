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
  }

  MapReduceWorker.prototype.map = function (subsetDataset) {
    this.mapWorker.postMessage({command:'map', dataset:subsetDataset});
  };

  MapReduceWorker.prototype.reduce = function (subsetIntermediates) {
    this.reduceWorker.postMessage({command:'reduce', intermediates:subsetIntermediates});
  };

  return MapReduceWorker;
})();

