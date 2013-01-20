var commands = {};

commands.request_program = function (sender, json) {
  message(sender.id, "requests a program");
  sender.command("program", {program:program});
};

commands.program = function (sender, json) {
  if (json.program) {
    message(sender.id, "send a program (size=" + String(json.program.length) + ")");
    program = json.program;
    console.log(json.program);

    mapReduceWorker = new MapReduceWorker(program);

    mapReduceAgent = new MapReduceAgent(mapReduceWorker, datasetStore, intermediatesStore);
    console.log(mapReduceAgent);

    if(isLeaf()){
      (new Sender(parentId)).command("program_ready");
    }

  } else {
    log("Invalid program");
  }
};

commands.program_ready = function(sender,json){

  connections[sender.id].program_ready = true;

  var isAllChildrenProgramReady = function(){

    return childrenIds.map(function(id){
      return connections[id].program_ready
    }).reduce(function(a,b){
      return a && b;
    });

  };

  if(isAllChildrenProgramReady){
    (new Sender(parentId)).command("program_ready");
  }

};

commands.request_dataset = function (sender, json) {
  json.size = json.size > 0 ? json.size : 0;
  message(sender.id, "requests a dataset (size=" + String(json.size) + ")");
  var datasetSubset = datasetStore.withdraw(json.size);
  sender.command("dataset", {dataset:datasetSubset});
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

commands.request_intermediates = function (sender, json) {
  json.size = json.size > 0 ? json.size : 0;
  message(sender.id, "requests a intermediates (size=" + String(json.size) + ")");
  var intermediatesSubset = intermediatesStore.withdraw(json.size);
  sender.command("intermediates", {intermediates:intermediatesSubset});

};

commands.intermediates = function (sender, json) {
  if (json.intermediates) {
    message(sender.id, "send a intermediates (size=" + String(json.size) + ")");
    intermediatesStore.store(json.intermediates);
  } else {
    log("invalid intermediates");
  }
};

commands.result = function (sender, json) {
  message(sender.id, "answer a result (result=" + String(json.result) + ")");
};

function broadcastCommand(cmd, json) {
  childrenIds.forEach(function (id) {
    (new Sender(id)).command(cmd, json);
  });
}

function commandRelay(cmd, sender, json, direction) {
  json.publisher |= sender.id;
  log("commandRelay publisher:" + json.publisher);
  if (direction === "upward") {
    if (!isRoot()) {
      (new Sender(parentId)).command(cmd, json);
    } else {
      log("[Root Node]")
    }
  } else {
    if (!isLeaf()) {
      broadcastCommand(cmd, json);
    } else {
      log("[Leaf Node]")
    }
  }
}


function commandDispatcher(cmd, senderId, json) {
  var sender;
  switch (cmd) {
    case "request_dataset":
    case "dataset":
    case "request_program":
    case "program":
    case "request_intermediates":
    case "intermediates":
    case "result":
      log(cmd);
      sender = new Sender(senderId);
      commands[cmd](sender, json);
      if (json.relay === "upward") {
        commandRelay(cmd, sender, json, "upward");
      } else if (json.relay === "downward") {
        commandRelay(cmd, sender, json, "downward");
      }

      break;
    default:
      log("unknown");
  }
}
