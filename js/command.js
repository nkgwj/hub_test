
var commands = {};

commands.request_program = function (sender, json) {
  message(sender.id, "requests a program");
  sender.postMessage({
    command:"program",
    program:program
  });
};

commands.program = function (sender, json) {
  if (json.program) {
    message(sender.id, "send a program (size=" + String(json.program.length) + ")");
    program = json.program;
    console.log(json.program);
  } else {
    log("Invalid program");
  }
};

commands.request_dataset = function (sender, json) {
  json.size = json.size > 0 ? json.size : 0;
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

commands.request_intermediates = function (sender, json) {
  json.size = json.size > 0 ? json.size : 0;
  message(sender.id, "requests a intermediates (size=" + String(json.size) + ")");
  var intermediatesSubset = intermediatesStore.withdraw(json.size);
  sender.postMessage({
    command:"intermediates",
    intermediates:intermediatesSubset
  });

};

commands.intermediates = function (sender, json) {
  if (json.intermediates) {
    message(sender.id, "send a intermediates (size=" + String(json.intermediates.length) + ")");
    intermediatesStore.store(json.intermediates);
  } else {
    log("invalid intermediates");
  }
};

commands.result = function (sender, json) {
  message(sender.id, "answer a result (result=" + String(json.result) + ")");
};

function commandDispatcher(cmd, senderId, json) {
  switch (cmd) {
    case "request_dataset":
    case "dataset":
    case "request_program":
    case "program":
    case "request_intermediates":
    case "intermediates":
    case "result":
      log(cmd);
      commands[cmd](new Sender(senderId), json);
      break;
    default:
      log("unknown");
  }
}
