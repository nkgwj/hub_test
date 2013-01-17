var datasetStore = [];
var intermediatesStore = [];
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
    message(sender, "requests a dataset (size=" + String(json.size) + ")");
    var datasetSubset = datasetStore.splice(0,5);
    connections[sender].dataChannel.send(JSON.stringify({
        command:"dataset",
        dataset:datasetSubset
    }));
};

commands.dataset = function (sender, json) {
    if (json.dataset) {
        message(sender, "send a dataset (size=" + String(json.dataset.length) + ")");
        datasetStore.push(json.dataset); //register?
        console.log(json.dataset);
    } else {
        log("invalid dataset");
    }

};

commands.request_intermediates = function(sender,json){
    message(sender,"requests a intermediates (size=" + String(json.size) + ")");
    var intermediatesSubset = intermediatesStore.splice(0,5);
    connections[sender].dataChannel.send(JSON.stringify({
        command:"intermediates",
        intermediates:intermediatesSubset
    }));

};

commands.intermediates = function(sender,json){
    if (json.intermediates) {
        message(sender,"send a intermediates (size=" + String(json.intermediates.length) + ")");
        intermediatesStore.push(json.intermediates);
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
