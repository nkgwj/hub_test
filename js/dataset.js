/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/23
 * Time: 3:55
 * To change this template use File | Settings | File Templates.
 */

$(function () {
  var project;
  var dataset;

  var readFile = function (file, onload) {
    var reader = new FileReader();

    reader.readAsText(file);
    reader.onload = function (evt) {
      var fileContent = evt.target.result;
      onload(file.name, fileContent);
    };

    return reader;
  };

  var open = function () {
    var datasetFile = $('#dataset')[0].files[0];

    $('#dataset').val('');

    console.log('DataSet:' + datasetFile.name);

    readFile(datasetFile, function (fileName, fileContent) {
      console.log(fileContent);
      dataset = fileContent.replace(/[\r\n]/g,"").split(/\s+/);
      console.log(dataset);
    });

  };

  $('#open').click(open);

});
