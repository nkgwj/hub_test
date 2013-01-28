var WordCountMoreHeavy = (function () {
  function WordCountMoreHeavy() {
  }

  WordCountMoreHeavy.prototype.map = function (item, emit) {
    var splitted = item.split(/\W+/g);
    splitted.forEach(function (word) {
      var j;
      for(i=0;i<100000;i++){
         j += Math.random();
      }

      if(word !==""){
        emit(word, 1);
      }
    })
  };

  WordCountMoreHeavy.prototype.reduce = function (key, values, emit) {
    var sum = values.reduce(function (a, b) {
      return a + b;
    });

    emit(key, sum);
  };

  return WordCountMoreHeavy;
})();

