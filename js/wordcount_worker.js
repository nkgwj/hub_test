/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/11
 * Time: 0:05
 * To change this template use File | Settings | File Templates.
 */
var WordCount = (function () {
    function WordCount() {
    }
    WordCount.prototype.map =  function(item, emit) {
        var splitted = item.split(/\s/g);
        splitted.forEach(function(word){
            emit(word,1)
        })
    };

    WordCount.prototype.reduce = function(key, values, emit) {

        //emit({ key: key, count: values.length });
        var sum = values.reduce(function(a,b){
            return a+b;
        });

        emit(key,sum);
    };

    return WordCount;
})();

var mapReduceTask = new WordCount();

importScripts("mapreduce_worker.js");