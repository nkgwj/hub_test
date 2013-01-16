var commands = {};

commands.request_program = function(sender,json){
    message(sender,"requests a program");
};

commands.program = function(sender,json){
    if (json.program) {
        message(sender,"send a program (size=" + String(json.program.length) + ")");
        console.log(json.program);
    } else {
        log("Invalid program");
    }
};

commands.request_datasets = function (sender, json) {
    message(sender, "requests a dataset (size=" + String(json.size) + ")");
};

commands.datasets = function (sender, json) {
    if (json.datasets) {
        message(sender, "send a dataset (size=" + String(json.datasets.length) + ")");
        console.log(json.datasets);
    } else {
        log("invalid datasets");
    }

};

commands.request_intermediates = function(sender,json){
    message(sender,"requests a intermediates (size=" + String(json.size) + ")");
};

commands.intermediates = function(sender,json){
    if (json.intermediates) {
        message(sender,"send a intermediates (size=" + String(json.intermediates.length) + ")");
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
        case "request_datasets":
        case "datasets":
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
