/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/21
 * Time: 10:18
 * To change this template use File | Settings | File Templates.
 */

var MapReduceConductor = (function () {
  var parentNode;
  function MapReduceConductor(mapReduceAgent, parentId) {
    this.mapReduceAgent = mapReduceAgent;
    this.parentId = parentId;
    if(!isRoot()){
      this.parentNode = function(){
        if(typeof parentNode === 'undefined') {
          parentNode = Command.sendto(parentId);
        }
        return parentNode;
      }
    }
  }

  MapReduceConductor.prototype.map = function (size) {
    this.mapReduceAgent.map(size);
  };

  MapReduceConductor.prototype.reduce = function (size) {
    this.mapReduceAgent.reduce(size);
  };

  MapReduceConductor.prototype.rise = function (size) {
    if(!isRoot()){
      var subset = intermediatesStore.withdraw(size);
      this.parentNode().command('intermediates', {intermediates:subset});
    } else {
      console.error("cannot rise at root node");
    }
  };

  MapReduceConductor.prototype.dataset = function (size) {
    if(!isRoot()){
      this.parentNode().command('request_dataset', {size:size});
    } else {
      console.error("cannot request dataset at root node");
    }
  };

  return MapReduceConductor;
})();