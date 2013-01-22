var gridProject;

var Command = (function () {
  var _command;

  function Command() {
    _command = this;
  }

  Command.prototype.request_program = function (sender, json) {
    outputBox.message(sender.id, 'requests a program');
    sender.command('program', {program:program});
  };

  Command.prototype.program = function (sender, json) {
    if (json.program) {
      outputBox.message(sender.id, 'send a program (size=' + String(json.program.length) + ')');
      program = json.program;
      console.log(json.program);

      gridProject = new GridProject(myId);
      gridProject.setup(program,datasetStore,intermediatesStore);
      //gridProject.createNodes();
      $('#controller').slideDown();

      if (isLeaf()) {
        Command.sendto(parentId).command('program_ready');
      }

    } else {
      outputbox.log('Invalid program');
    }
  };

  Command.prototype.program_ready = function (sender, json) {
    connections[sender.id].program_ready = true;

    var isAllChildrenProgramReady = function () {

      return childrenIds.map(function (id) {
        return connections[id].program_ready
      }).reduce(function (a, b) {
          return a && b;
        });

    };

    if (isRoot()){
      $('#controller').slideDown();
    } else if(isAllChildrenProgramReady) { //FIXME
      Command.sendto(parentId).command('program_ready');
    }
  };

  Command.prototype.completed = function (sender, json) {
    connections[sender.id].completed = true;

    var isAllChildrenCompleted = function () {

      return childrenIds.map(function (id) {
        return connections[id].completed;
      }).reduce(function (a, b) {
          return a && b;
        });

    };

    if (isAllChildrenCompleted()) {
      Command.sendto(parentId).command('completed');
    }
  };

  Command.prototype.request_dataset = function (sender, json) {
    json.size = json.size > 0 ? json.size : 0;
    outputBox.message(sender.id, 'requests a dataset (size=' + String(json.size) + ')');
    var datasetSubset = datasetStore.withdraw(json.size);
    sender.command('dataset', {dataset:datasetSubset});
  };

  Command.prototype.dataset = function (sender, json) {
    if (json.dataset) {
      outputBox.message(sender.id, 'send a dataset (size=' + String(json.dataset.length) + ')');
      mapReduceConductor.onDataset(json.dataset);
    } else {
      outputBox.log('invalid dataset');
    }

  };

  Command.prototype.request_intermediates = function (sender, json) {
    json.size = json.size > 0 ? json.size : 0;
    outputBox.message(sender.id, 'requests a intermediates (size=' + String(json.size) + ')');
    var intermediatesSubset = intermediatesStore.withdraw(json.size);
    sender.command('intermediates', {intermediates:intermediatesSubset});

  };

  Command.prototype.intermediates = function (sender, json) {
    if (json.intermediates) {
      outputBox.message(sender.id, 'send a intermediates (size=' + String(json.size) + ')');
      intermediatesStore.store(json.intermediates);
    } else {
      outputBox.log('invalid intermediates');
    }
  };

  Command.prototype.result = function (sender, json) {
    outputBox.message(sender.id, 'answer a result (result=' + String(json.result) + ')');
  };

  Command.prototype.runout_dataset = function (sender, json) {
    outputBox.message(sender.id, 'run out of dataset');
    isParentRunoutDataset = true;
  };


  Command.broadcast = function (cmd, json) {
    childrenIds.forEach(function (id) {
      Command.sendto(id).command(cmd, json);
    });
  };

  Command.relay = function (cmd, sender, json, direction) {
    json.publisher = json.publisher || sender.id;
    outputBox.log('commandRelay publisher:' + json.publisher);
    if (direction === 'upward') {
      if (!isRoot()) {
        Command.sendto(parentId).command(cmd, json);
      } else {
        outputBox.log('[Root Node]')
      }
    } else {
      if (!isLeaf()) {
        Command.broadcast(cmd, json)
      } else {
        outputBox.log('[Leaf Node]')
      }
    }
  };

  Command.dispatch = function (cmd, senderId, json) {
    if (_command[cmd]) {
      outputBox.log(cmd);
      var sender = Command.sendto(senderId);
      _command[cmd](sender, json);

      if (json.relay === 'upward') {
        Command.relay(cmd, sender, json, 'upward');
      } else if (json.relay === 'downward') {
        Command.relay(cmd, sender, json, 'downward');
      }
    } else {
      outputBox.log('unknown');
    }
  };

  Command.sendto = function (id) {
    return new PeerNode(id);
  };

  return Command;
})();

