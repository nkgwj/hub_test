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
  }

  DataStore.prototype.store = function (dataArray) {
    this.repository = this.repository.concat(dataArray);
    return this.repository;
  };

  DataStore.prototype.withdraw = function (size) {
    return this.repository.splice(0, size);
  };

  return DataStore;
})();
