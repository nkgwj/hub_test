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
    var that = this;

    Object.keys(keyValueTable).forEach(function (key) {
      var value = keyValueTable[key];
      if(CONFIG.verbose) {
        console.log(key, value);
      }
      var list = that.repository.get(key) || [];
      list = list.concat(value);
      that.repository.set(key, list);
      that.isAllReduced = false;
    });

    return this.repository;
  };

  KeyValueStore.prototype.withdraw = function (requestSize, isSkipReduced) {
    var isAllReduced = true;
    var iterator = this.iterator();
    var size = 0;

    var intermediates = {};
    try {
      for (var i = 0; size < requestSize; i++) {
        //for (var i = 0; size < requestSize && i < this.repository.size; i++) {
        var key = iterator.next();
        var value = this.repository.get(key);
        var isAlreadyReduced = (value.length === 1);

        isAllReduced &= isAlreadyReduced;

        if (!isAlreadyReduced || !isSkipReduced) {
          this.repository.delete(key);
          intermediates[key] = value;
          size++;
        }
      }
    } catch (e) {
      if(e instanceof StopIteration){
        console.log("StopIteration:"+e);
      } else {
        console.error("Unknown Error:"+e)
      }
    }

    this.isAllReduced = isAllReduced;

    return intermediates; // if(isAllReduced === false) return null
  };

  KeyValueStore.prototype.objectURI = function(){
    var iterator = this.iterator();
    var key,value;
    var fileContentLines = [];

    try {
      while (key = iterator.next()) {
        value = this.repository.get(key);
        fileContentLines.push(key+","+value[0]+"\n");
      }


    } catch (e) {
      if(e instanceof StopIteration){
        console.log("StopIteration:"+e);
        var blob = new Blob(fileContentLines, {type:'text\/plain'});
        return URL.createObjectURL(blob);
      } else {
        console.error("Unknown Error:"+e)
      }
    }

  };

  KeyValueStore.prototype.size = function(){
    return this.repository.size;
  };
  return KeyValueStore;
})();