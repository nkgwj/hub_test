/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/19
 * Time: 11:16
 * To change this template use File | Settings | File Templates.
 */
$(function () {
  $('#btn-start').click(
    function () {
      Command.broadcast('program', {program:program, relay:'downward'});
      $('#btn-start').slideUp();

    }
  );

  $('#btn-map').click(
    function () {
      var size = Number($('#map-size').val());
      mapReduceConductor.map(size);
    }
  );

  $('#btn-reduce').click(
    function () {
      var size = Number($('#reduce-size').val());
      mapReduceConductor.reduce(size);
    }
  );

  $('#btn-dataset').click(
    function () {
      var size = Number($('#dataset-size').val());
      mapReduceConductor.dataset(size);
    }
  );

  $('#btn-rise').click(
    function () {
      var size = Number($('#rise-size').val());
      mapReduceConductor.rise(size);
    }
  );
});


