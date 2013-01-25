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
    gridProject.setup(program,datasetStore,intermediatesStore);

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

      program = fileContent;

      var result = /^(\w[\w\-]*)\.(js|ts)$/.exec(fileName);
      if(result){
        if(result[2] === 'ts'){
          var dfdLibLoad = $.get("js/lib/tsc/lib.d.ts",null,null,"text");
          dfdLibLoad.done(function(libfile){
            program = TypeScriptCompiler.compile([{
              fileName:"lib.d.ts",
              source:libfile
            },{
              fileName:"",
              source:program
            }]);
            dfdCompiled.resolve();
          });

        } else if (result[2] === 'coffee') {
          console.error("not supported");
        } else if (result[2] === 'js') {
          dfdCompiled.resolve();
        }

        dfdCompiled.then(function () {
          if (CONFIG.loadMapReduceLibrary) {
            var bindScript = 'var mapReduce = new MapReduce(new ' + result[1] + '());\n';
            var dfdMapReduceLoad = $.get(CONFIG.loadMapReduceLibrary, null, null, "text");
            dfdMapReduceLoad.done(function (script) {
              program = [program, script, bindScript].join("\n");
              dfdLinked.resolve(fileName + "(with MapReduce Library)",program);
            });
          } else {
            dfdLinked.resolve(fileName,program);
          }

        });

        dfdLinked.then(function (title,source) {
          outputBox.message(title, $('<pre>').html(source));
          dfdProgramLoad.resolve();
        });

      } else {
        console.error("Failed to parse filename.");
      }
   });

    readFile(datasetFile, function (fileName, fileContent) {
      outputBox.message(fileName, $('<pre>').html(fileContent));
      dataset = fileContent.split(/[\r\n]+/);

      dfdDatasetLoad.resolve();
    });

  };

  $('#setup').click(setUp);

});
