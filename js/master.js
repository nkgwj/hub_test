/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/16
 * Time: 18:22
 * To change this template use File | Settings | File Templates.
 */



var MapReduceWorker = (function () {
    function MapReduceWorker(mapProgram, reduceProgram) {
        var createProgramObjectURL = function(sourceCode){
            var blob = new Blob([sourceCode], {type:"text\/javascript"});
            return URL.createObjectURL(blob);
        };
        var mapObjectURL = createProgramObjectURL(mapProgram);
        var reduceObjectURL = reduceProgram ? createProgramObjectURL(reduceProgram): mapObjectURL;

        this.mapWorker = new Worker(mapObjectURL);
        this.reduceWorker =  new Worker(reduceObjectURL);
        this.mapWorker.onmessage = this.reduceWorker.onmessage = function (evt) {
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
    }

    MapReduceWorker.prototype.map = function (subsetDataset) {
        this.mapWorker.postMessage({command:"map", dataset:subsetDataset});
    };

    MapReduceWorker.prototype.reduce = function reduce(subsetIntermediates){
        this.reduceWorker.postMessage({command:"reduce",intermediates:subsetIntermediates});
    };

    return MapReduceWorker;
})();

var MapReduceAgent = (function () {
    function MapReduceAgent(worker, datasetStore, intermediatesStore) {
        this.worker = worker;
        this.datasetStore = datasetStore;
        this.intermediatesStore = intermediatesStore;
    }
    MapReduceAgent.prototype.map = function (size) {
        var subset = datasetStore.withdraw(size);
        mapReduceWorker.map(subset);
        return subset.size;
    };

    MapReduceAgent.prototype.reduce = function (size) {
        var subset = intermediatesStore.withdraw(size);
        mapReduceWorker.reduce(subset);
        return subset.size;
    };

    return MapReduceAgent;
})();



var project;
var programFile;
var datasetFile;
var programReader;
var datasetReader;
var program;
var dataset;

var mapWorker; // to remove
var reduceWorker; // to remove

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
    mapReduceAgent = new MapReduceAgent(mapReduceWorker);

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
