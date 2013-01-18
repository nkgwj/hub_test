/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/16
 * Time: 18:22
 * To change this template use File | Settings | File Templates.
 */

var project;
var program,dataset;

//var mapReduceWorker;
var mapReduceAgent;

$(function () {

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

    mapReduceWorker = new MapReduceWorker(program);
    mapReduceAgent = new MapReduceAgent(mapReduceWorker, datasetStore, intermediatesStore);

    mapReduceAgent.map(dataset.length);
  };

  var setUp = function () {
    var programFile;
    var datasetFile;
    var programReader;
    var datasetReader;

    project = $('#project').val();
    programFile = $('#program')[0].files[0];
    datasetFile = $('#dataset')[0].files[0];

    if (validateProjectName(project) &&
      programFile && datasetFile) {

      $("#program,#dataset,#project").val('');

      $('#config').attr('disabled', 'disabled').slideUp();

      log('Project:' + project);
      log('Program:' + programFile.name);
      log('DataSet:' + datasetFile.name);

      programReader = new FileReader();
      programReader.readAsText(programFile);
      programReader.onload = function (evt) {
        program = evt.target.result;
        message(programFile.name, $("<pre>").html(program));

        if (program && dataset) {
          startUp();
        }
      };

      datasetReader = new FileReader();
      datasetReader.readAsText(datasetFile);
      datasetReader.onload = function (evt) {
        var datasetJSON = evt.target.result;
        message(datasetFile.name, $("<pre>").html(datasetJSON));
        dataset = JSON.parse(datasetJSON);

        if (program && dataset) {
          startUp();
        }
      };
    }
  };

  $("#setup").click(setUp);

});
