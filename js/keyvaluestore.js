/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/19
 * Time: 0:56
 * To change this template use File | Settings | File Templates.
 */

var KeyValueStore = (function () {
  function KeyValueStore() {
    this.repository = new Map;
  }

  KeyValueStore.prototype.iterator = function () {
    return this.repository.keys();
  };

  KeyValueStore.prototype.store = function (keyValueTable) {
    for (var key in keyValueTable) {
      var value = keyValueTable[key];
      console.log(key, value);
      var list = this.repository.get(key) || [];
      list = list.concat(value);
      this.repository.set(key, list);
    }
    return this.repository;
  };

  KeyValueStore.prototype.withdraw = function (size,isSkipReduced) {
    var isAllReduced = true;
    var iterator = this.iterator();

    var intermediates = {};
    for (var i = 0; i < size && i < this.repository.size; i++) {
      var key = iterator.next();
      var value = this.repository.get(key);
      var isAlreadyReduced = (value.length === 1);

      isAllReduced &= isAlreadyReduced;

      if (isAlreadyReduced && isSkipReduced) {
        size++;
      } else {
        this.repository.delete(key);
        intermediates[key] = value;
      }
    }

    this.isAllReduced = isAllReduced;

    return intermediates; // if(isAllReduced === false) return null
  };

  return KeyValueStore;
})();