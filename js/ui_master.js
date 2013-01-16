/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/16
 * Time: 18:22
 * To change this template use File | Settings | File Templates.
 */

var project;
var programFile;
var datasetsFile;
var programReader;
var datasetsReader;
var program;
var datasets;

function isReady(){
    if(program && datasets){
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

    //var nextIdRef = projectRef.child("nextId");
    //nextIdRef.set(2);
    //listen(myId);
    myId = 1;
    nodesRef.remove(function(){
        listen(myId);
    });

    var url; // = "./js/wordcount_mapreduce.js"
    var blob = new Blob([program], {type:"text\/javascript"});
    url = URL.createObjectURL(blob);
    log(url);
    var worker = new Worker(url);
    worker.onmessage = function (evt) {
        log(evt.data);
    };

    var data = JSON.parse(datasets);
    worker.postMessage({type:"map", input:data});
}

var onClick = function () {

    project = $('#project').val();
    programFile = $('#program')[0].files[0];
    datasetsFile = $('#datasets')[0].files[0];

    if (validateProjectName(project) &&
        programFile &&
        datasetsFile) {

        $('#program').val('');
        $('#datasets').val('');
        $('#project').val('');

        $('#config').attr('disabled', 'disabled').slideUp();

        log('Project:' + project);
        log('program:' + programFile.name);
        log('data sets:' + datasetsFile.name);

        programReader = new FileReader();
        programReader.readAsText(programFile);
        programReader.onload = function (evt) {
            program = evt.target.result;
            message(programFile.name,$("<pre>").html(program));
            if (isReady() ){
                startUp();
            }
        };

        datasetsReader = new FileReader();
        datasetsReader.readAsText(datasetsFile);
        datasetsReader.onload = function (evt) {
            datasets = evt.target.result;
            message(datasetsFile.name,$("<pre>").html(datasets));
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
