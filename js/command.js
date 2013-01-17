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


var KeyValueStore = (function () {
    function KeyValueStore() {
        this.repository = new Map;
        this.iterator = this.repository.keys();
    }

    KeyValueStore.prototype.next = function(){
        var iterator = this.iterator;
        return iterator.next();
    };

    KeyValueStore.prototype.store = function (keyValueTable) {
        for(var key in keyValueTable){
            var value = keyValueTable[key];
            console.log(key,value);
            var list = this.repository.get(key) || [];
            list = list.concat(value);
            this.repository.set(key,list);
        }
        return this.repository;
    };

    KeyValueStore.prototype.withdraw = function (size) {
/*
        var list = [];
        var numOfItem = Math.min(size,this.repository.size);
        for (var i = 0; i < numOfItem; i++) {
            var key = this.next();
            var value = this.repository.get(key);
            this.repository.delete(key);
            list.push({key:key,value:value});
        }
        return list;
 */

        var intermediates = {};
        var numOfItem = Math.min(size, this.repository.size);
        for (var i = 0; i < numOfItem; i++) {
            var key = this.next();
            var value = this.repository.get(key);
            this.repository.delete(key);
            intermediates[key] = value;
        }
        return intermediates;
    };

    return KeyValueStore;
})();




var Sender = (function(){
    function Sender(id){
        this.id = id;
        this.dataChannel = connections[id].dataChannel;
    }

    Sender.prototype.postMessage = function(str){
        this.dataChannel.send(JSON.stringify(str))
    };

    return Sender;
})();

var datasetStore = new DataStore();

var intermediatesStore = new KeyValueStore();

var commands = {};

commands.request_program = function(sender,json){
    message(sender.id,"requests a program");
    sender.postMessage({
        command:"program",
        program:program
    });
};

commands.program = function(sender,json){
    if (json.program) {
        message(sender.id,"send a program (size=" + String(json.program.length) + ")");
        program = json.program;
        console.log(json.program);
    } else {
        log("Invalid program");
    }
};

commands.request_dataset = function (sender, json) {
    json.size = json.size >  0 ? json.size : 0;
    message(sender.id, "requests a dataset (size=" + String(json.size) + ")");
    var datasetSubset = datasetStore.withdraw(json.size);
    sender.postMessage({
        command:"dataset",
        dataset:datasetSubset
    });
};

commands.dataset = function (sender, json) {
    if (json.dataset) {
        message(sender.id, "send a dataset (size=" + String(json.dataset.length) + ")");
        datasetStore.store(json.dataset);
        console.log(json.dataset);
    } else {
        log("invalid dataset");
    }

};

commands.request_intermediates = function(sender,json){
    json.size = json.size >  0 ? json.size : 0;
    message(sender.id,"requests a intermediates (size=" + String(json.size) + ")");
    var intermediatesSubset = intermediatesStore.withdraw(json.size);
    sender.postMessage({
        command:"intermediates",
        intermediates:intermediatesSubset
    });

};

commands.intermediates = function(sender,json){
    if (json.intermediates) {
        message(sender.id,"send a intermediates (size=" + String(json.intermediates.length) + ")");
        intermediatesStore.store(json.intermediates);
    } else {
        log("invalid intermediates" );
    }
};

commands.result = function(sender,json){
    message(sender.id,"answer a result (result="+ String(json.result) + ")");
};

function commandDispatcher(cmd,senderId,json){
    switch (cmd) {
        case "request_dataset":
        case "dataset":
        case "request_program":
        case "program":
        case "request_intermediates":
        case "intermediates":
        case "result":
            log(cmd);
            commands[cmd](new Sender(senderId),json);
            break;
        default:
            log("unknown");
    }
}
