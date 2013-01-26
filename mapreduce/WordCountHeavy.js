var WordCountHeavy = (function () {
  function WordCountHeavy() {
  }

  WordCountHeavy.prototype.map = function (item, emit) {
    var splitted = item.split(/\W+/g);
    splitted.forEach(function (word) {
      var j;
      for(i=0;i<30000;i++){
         j += Math.random();
      }

      if(word !==""){
        emit(word, 1);
      }
    })
  };

  WordCountHeavy.prototype.reduce = function (key, values, emit) {
    var sum = values.reduce(function (a, b) {
      return a + b;
    });

    emit(key, sum);
  };

  return WordCountHeavy;
})();

