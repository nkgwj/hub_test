/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/19
 * Time: 0:55
 * To change this template use File | Settings | File Templates.
 */

var DataStore = (function () {
  function DataStore(dataArray) {
    this.repository = dataArray || [];
    this.onrunout = function(){};
  }

  DataStore.prototype.store = function (dataArray) {
    this.repository = this.repository.concat(dataArray);
    return this.repository;
  };

  DataStore.prototype.withdraw = function (size) {
    subset = this.repository.splice(0, size);
    if (this.isEmpty()) {
      this.onrunout();
    }

    return subset;
  };

  DataStore.prototype.isEmpty = function () {
    return this.repository.length === 0;
  };


  return DataStore;
})();
