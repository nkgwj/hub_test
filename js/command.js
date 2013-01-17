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
    DataStore.prototype.repository = function(){
        return this.repository;
    };
    return DataStore;
})();

var datasetStore = new DataStore();

var intermediatesStore = new DataStore();

var commands = {};

commands.request_program = function(sender,json){
    message(sender,"requests a program");
    connections[sender].dataChannel.send(JSON.stringify({
        command:"program",
        program:program
    }));
};

commands.program = function(sender,json){
    if (json.program) {
        message(sender,"send a program (size=" + String(json.program.length) + ")");
        program = json.program;
        console.log(json.program);
    } else {
        log("Invalid program");
    }
};

commands.request_dataset = function (sender, json) {
    json.size = json.size >  0 ? json.size : 0;
    message(sender, "requests a dataset (size=" + String(json.size) + ")");
    var datasetSubset = datasetStore.withdraw(json.size);
    connections[sender].dataChannel.send(JSON.stringify({
        command:"dataset",
        dataset:datasetSubset
    }));
};

commands.dataset = function (sender, json) {
    if (json.dataset) {
        message(sender, "send a dataset (size=" + String(json.dataset.length) + ")");
        datasetStore.store(json.dataset);
        console.log(json.dataset);
    } else {
        log("invalid dataset");
    }

};

commands.request_intermediates = function(sender,json){
    json.size = json.size >  0 ? json.size : 0;
    message(sender,"requests a intermediates (size=" + String(json.size) + ")");
    var intermediatesSubset = intermediatesStore.withdraw(json.size);
    connections[sender].dataChannel.send(JSON.stringify({
        command:"intermediates",
        intermediates:intermediatesSubset
    }));

};

commands.intermediates = function(sender,json){
    if (json.intermediates) {
        message(sender,"send a intermediates (size=" + String(json.intermediates.length) + ")");
        intermediatesStore.store(json.intermediates);
    } else {
        log("invalid intermediates" );
    }

    console.log(json.intermediates);
};

commands.result = function(sender,json){
    message(sender,"answer a result (result="+ String(json.result) + ")");
};

function commandDispatcher(cmd,sender,json){
    switch (cmd) {
        case "request_dataset":
        case "dataset":
        case "request_program":
        case "program":
        case "request_intermediates":
        case "intermediates":
        case "result":
            log(cmd);
            commands[cmd](sender,json);
            break;
        default:
            log("unknown");
    }
}
