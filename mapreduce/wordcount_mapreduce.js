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


var MapReduce = (function () {
    function MapReduce(task) {
        this.task = task;
        this.intermediate = {};
    }

    MapReduce.prototype.map =  function(input){
        var that = this;
        input.forEach(function(item){
            that.task.map(item,function(key,value){
                if(typeof (that.intermediate[key])==="undefined"){
                    that.intermediate[key]=[];
                }
                that.intermediate[key].push(value)
            });
        });
    };

    MapReduce.prototype.reduce = function() {
        var that = this;
        for(var key in mapReduce.intermediate){
            this.task.reduce(key,that.intermediate[key],function(key,value){
                that.intermediate[key] = [value];
            })
        }
    };

    return MapReduce;
})();


var mapReduce = new MapReduce(mapReduceTask);


self.onmessage = function(event){
    if(typeof event.data ==="object"){
        var msg = event.data;
        switch (msg.command){
            case "map":
                if(msg.input){
                    mapReduce.map(msg.input);
                }
                self.postMessage("<br>intermediate<br>");
                self.postMessage(JSON.stringify(mapReduce.intermediate));

                mapReduce.reduce();

                self.postMessage("<br>result<br>");
                self.postMessage(JSON.stringify(mapReduce.intermediate));
                break;
            default:
        }
    }
};