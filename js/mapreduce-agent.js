/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/18
 * Time: 23:00
 * To change this template use File | Settings | File Templates.
 */

var MapReduceAgent = (function () {
  function MapReduceAgent(worker, datasetStore, intermediatesStore) {
    this.worker = worker;
    this.datasetStore = datasetStore;
    this.intermediatesStore = intermediatesStore;
  }

  MapReduceAgent.prototype.map = function (size) {
    var subset = this.datasetStore.withdraw(size);
    this.worker.map(subset);
  };

  MapReduceAgent.prototype.reduce = function (size) {
    var subset = this.intermediatesStore.withdraw(size, true);
    this.worker.reduce(subset);
  };

  return MapReduceAgent;
})();