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

var mapWorker;
var reduceWorker;

function isReady(){
    if(program && dataset){
        return true;
    }else {
        return false;
    }
}

function map(subsetDataset) {
    mapWorker.postMessage({command:"map", dataset:subsetDataset});
}
function reduce(subsetIntermediates){
    reduceWorker.postMessage({command:"reduce",intermediates:subsetIntermediates});
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

    var blob = new Blob([program], {type:"text\/javascript"});
    var url = URL.createObjectURL(blob);

    mapWorker = new Worker(url);
    reduceWorker = new Worker(url);

    mapWorker.onmessage = reduceWorker.onmessage = function (evt) {
        var json = evt.data;
        log(JSON.stringify(json));

        switch (json.command) {
            case "intermediates":
                if (json.intermediates) {
                    message("worker", "send a intermediates (size=" + String(json.intermediates.length) + ")");
                    intermediatesStore.store(json.intermediates);
                } else {
                    log("invalid intermediates");
                }
                break;
            default:
                log("Invalid commands(worker)");
        }
    };



    var subsetDataset = dataset;
    map(subsetDataset);
    datasetStore.store(dataset);
}

var onClick = function () {

    project = $('#project').val();
    programFile = $('#program')[0].files[0];
    datasetFile = $('#dataset')[0].files[0];

    if (validateProjectName(project) &&
        programFile &&
        datasetFile) {

        $('#program').val('');
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
