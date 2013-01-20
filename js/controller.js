
/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/19
 * Time: 11:16
 * To change this template use File | Settings | File Templates.
 */

function rise(size) {
  var subset = intermediatesStore.withdraw(size);
  Command.sendto(parentId).command('intermediates', {intermediates:subset});
}

$(function () {
  $('#btn-program').click(
    function () {
      Command.broadcast('program', {program:program, relay:'downward'});
    }
  );

  $('#btn-map').click(
    function () {
      var size = Number($('#map-size').val());
      mapReduceAgent.map(size);
    }
  );

  $('#btn-reduce').click(
    function () {
      var size = Number($('#reduce-size').val());
      mapReduceAgent.reduce(size);
    }
  );

  $('#btn-dataset').click(
    function () {
      var size = Number($('#dataset-size').val());
      Command.sendto(parentId).command('request_dataset', {size:size});
    }
  );

  $('#btn-rise').click(
    function () {
      var size = Number($('#rise-size').val());
      rise(size);
    }
  );
});


