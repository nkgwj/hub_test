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

    $.when(dfdProgramLoad, dfdDatasetLoad).done(startUp);

    readFile(programFile, function (fileName, fileContent) {
      outputBox.message(fileName, $('<pre>').html(fileContent));
      program = fileContent;
      dfdProgramLoad.resolve();
    });

    readFile(datasetFile, function (fileName, fileContent) {
      outputBox.message(fileName, $('<pre>').html(fileContent));
      //dataset = JSON.parse(fileContent);
      //dataset = fileContent.replace(/[\r\n]*/,"\n").split(/\n/);
      dataset = fileContent.split(/[\r\n]+/);

      dfdDatasetLoad.resolve();
    });

  };

  $('#setup').click(setUp);

});
