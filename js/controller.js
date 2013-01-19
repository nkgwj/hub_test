/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/19
 * Time: 11:16
 * To change this template use File | Settings | File Templates.
 */

$(function () {
  $("#btn-program").click(
    function () {
      broadcastCommand("program",{program:program});
      log("not implemented:"+$("#program-status").val());
    }
  );

  $("#btn-map").click(
    function(){
      var size = Number($("#map-size").val());
      mapReduceAgent.map(size);
    }
  );

  $("#btn-reduce").click(
    function () {
      var size = Number($("#reduce-size").val());
      mapReduceAgent.reduce(size);
    }
  );

  $("#btn-rise").click(
    function () {
      var size = Number($("#rise-size").val());
      var subset = intermediatesStore.withdraw(size);
      var sender = new Sender(parentId);
      sender.command("intermediates", {intermediates:subset});
    }
  );
});


