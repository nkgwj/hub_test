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
