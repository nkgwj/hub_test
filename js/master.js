/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/16
 * Time: 18:22
 * To change this template use File | Settings | File Templates.
 */

var project;
var programFile;
var datasetFile;
var programReader;
var datasetReader;
var program;
var dataset;

var mapReduceWorker;
var mapReduceAgent;

function isReady(){
    if(program && dataset){
        return true;
    }else {
        return false;
    }
}

function startUp(){
    projectRef = projectsRef.child(project);
    projectRef.removeOnDisconnect();

    nextIdRef = projectRef.child("nextId");
    nodesRef = projectRef.child("nodes");

    myId = 1;
    nodesRef.remove(function(){
        listen(myId);
    });

    datasetStore.store(dataset);

    mapReduceWorker = new MapReduceWorker(program);
    mapReduceAgent = new MapReduceAgent(mapReduceWorker,datasetStore,intermediatesStore);

    mapReduceAgent.map(dataset.length);
}

var onClick = function () {
    project = $('#project').val();
    programFile = $('#program')[0].files[0];
    datasetFile = $('#dataset')[0].files[0];

    if (validateProjectName(project) &&
        programFile &&
        datasetFile) {

        $('#program').val(''); // matomeru
        $('#dataset').val('');
        $('#project').val('');

        $('#config').attr('disabled', 'disabled').slideUp();

        log('Project:' + project);
        log('program:' + programFile.name);
        log('data sets:' + datasetFile.name);

        programReader = new FileReader();
        programReader.readAsText(programFile);
        programReader.onload = function (evt) {
            program = evt.target.result;
            message(programFile.name,$("<pre>").html(program));
            if (isReady() ){
                startUp();
            }
        };

        datasetReader = new FileReader();
        datasetReader.readAsText(datasetFile);
        datasetReader.onload = function (evt) {
            var datasetJSON = evt.target.result;
            message(datasetFile.name,$("<pre>").html(datasetJSON));
            dataset = JSON.parse(datasetJSON);
            if (isReady() ){
                startUp();
            }
        };


    }
};

$(
    function (){
        $("#setup").click(onClick);
    }
);
