/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/25
 * Time: 16:36
 * To change this template use File | Settings | File Templates.
 */

var MapReduce = (function () {
  function MapReduce(task) {
    this.task = task;
  }

  MapReduce.prototype.map = function (input) {
    var that = this;
    var intermediates = {};
    input.forEach(function (item) {
      that.task.map(item, function (key, value) {
        if (!intermediates.hasOwnProperty(key) ||
          (intermediates[key]) === "undefined") {
          intermediates[key] = [];
        }

        try{
          intermediates[key].push(value)
        } catch(e) {
          self.postMessage(JSON.stringify({
            command:"error",
            error:e,
            key:key,
            value:value,
            item:item
          }));
        }

      });

    });
    return intermediates;
  };

  MapReduce.prototype.reduce = function (intermediates) {
    var that = this;
    Object.keys(intermediates).forEach(function (key) {
      that.task.reduce(key, intermediates[key], function (key, value) {
        intermediates[key] = [value];
      })
    });

    return intermediates;
  };

  return MapReduce;
})();

self.onmessage = function (event) {
  if (typeof event.data === "object") {
    var msg = event.data;
    switch (msg.command) {
      case "map":
        if (msg.dataset) {
          self.postMessage({
            command:"intermediates",
            intermediates:mapReduce.map(msg.dataset)
          });
        }
        break;
      case "reduce":
        if (msg.intermediates) {
          self.postMessage({
            command:"intermediates",
            intermediates:mapReduce.reduce(msg.intermediates)
          });
        }
        break;
      default:
    }
  }
};
