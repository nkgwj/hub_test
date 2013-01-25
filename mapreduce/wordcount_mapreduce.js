var WordCount = (function () {
  function WordCount() {
  }

  WordCount.prototype.map = function (item, emit) {
    var splitted = item.split(/\W+/g);
    splitted.forEach(function (word) {
      if(word !==""){
        emit(word, 1);
      }
    })
  };

  WordCount.prototype.reduce = function (key, values, emit) {

    var sum = values.reduce(function (a, b) {
      return a + b;
    });

    emit(key, sum);
  };

  return WordCount;
})();

var mapReduceTask = new WordCount();

var MapReduce = (function () {
  function MapReduce(task) {
    this.task = task;
  }

  MapReduce.prototype.map = function (input) {
    var that = this;
    var intermediates = {};
    input.forEach(function (item) {
      that.task.map(item, function (key, value) {
        if (typeof (intermediates[key]) === "undefined") {
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


var mapReduce = new MapReduce(mapReduceTask);

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