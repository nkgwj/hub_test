/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/16
 * Time: 18:22
 * To change this template use File | Settings | File Templates.
 */

$(function () {
  var project;
  var dataset;
  var startUp = function () {
    projectRef = projectsRef.child(project);
    projectRef.removeOnDisconnect();

    nextIdRef = projectRef.child("nextId");
    nodesRef = projectRef.child("nodes");

    myId = 1;
    nodesRef.remove(function () {
      listen(myId);
    });

    datasetStore.store(dataset);

    var gridProject = new GridProject(myId);
    gridProject.setup(program, datasetStore, intermediatesStore);

    $("#btn-start").slideDown();

  };

  var readFile = function (file, onload) {
    var reader = new FileReader();

    reader.readAsText(file);
    reader.onload = function (evt) {
      var fileContent = evt.target.result;
      onload(file.name, fileContent);
    };

    return reader;
  };

  fileTypeMap = {
    "js":"text/javascript",
    "coffee":"text/coffeescript",
    "ts":"text/typescript"
  };

  var parseFilename = function (fileName) {
    var regexpParseFilename = /^(\w[\w\-]*)\.(\w*)$/

    var result = regexpParseFilename.exec(fileName);
    if (!result) {
      return null;
    }

    var fileType = fileTypeMap[result[2]];
    if (!fileType) {
      return null;
    }

    return {
      fileName:result[0],
      className:result[1],
      extension:result[2],
      fileType:fileType
    }
  };

  var setUp = function () {
    var programFile;
    var datasetFile;

    project = $('#project').val();
    programFile = $('#program')[0].files[0];
    datasetFile = $('#dataset')[0].files[0];

    if (!(programFile && datasetFile &&
      GridProject.validateProjectName(project))) {
      console.error('error: project name');
      return;
    }

    $('#program,#dataset,#project').val('');
    $('#config').attr('disabled', 'disabled').slideUp();

    outputBox.log('Project:' + project);
    outputBox.log('Program:' + programFile.name);
    outputBox.log('DataSet:' + datasetFile.name);

    var dfdProgramLoad = $.Deferred();
    var dfdDatasetLoad = $.Deferred();

    var dfdCompiled = $.Deferred();
    var dfdLinked = $.Deferred();

    $.when(dfdProgramLoad, dfdDatasetLoad).done(startUp);

    readFile(programFile, function (fileName, fileContent) {
      var result = parseFilename(fileName);
      if (!result) {
        console.error("Failed to parse filename.");
        return;
      }

      var compiler = new Compiler(result.fileType);
      if (compiler.executable) {
        compiler.compile(fileContent, dfdCompiled);
      } else {
        console.error("Error(file reader):compiler for file type(" + result.fileType + ") is not registered")
      }

      dfdCompiled.then(function (_program) {
        if (CONFIG.loadMapReduceLibrary) {
          var bindScript = 'var mapReduce = new MapReduce(new ' + result.className + '());\n';
          var dfdMapReduceLoad = $.get(CONFIG.loadMapReduceLibrary, null, null, "text");
          dfdMapReduceLoad.done(function (script) {
            _program = [_program, script, bindScript].join("\n");
            dfdLinked.resolve(fileName + "(with MapReduce Library)", _program);
          });
        } else {
          dfdLinked.resolve(fileName, _program);
        }

      });

      dfdLinked.then(function (title, source) {
        program = source;
        outputBox.message(title, $('<pre>').html(source));
        dfdProgramLoad.resolve();
      });

    });

    readFile(datasetFile, function (fileName, fileContent) {
      outputBox.message(fileName, $('<pre>').html(fileContent));
      dataset = fileContent.split(/[\r\n]+/);

      dfdDatasetLoad.resolve();
    });

  };

  $('#setup').click(setUp);

});




