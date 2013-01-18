/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/16
 * Time: 18:22
 * To change this template use File | Settings | File Templates.
 */
function onaddedproject(addedProject) {
  var option = $("<option>").attr("value", addedProject.name()).html(addedProject.name());
  $("#project").append(option);
}

function onremovedproject(removedProject) {
  var selector = 'option[value="' + removedProject.name() + '"]';
  $(selector).remove();
}

projectsRef.on('child_added', onaddedproject);
projectsRef.on('child_removed', onremovedproject);


$(function () {
  var join = function (projectName) {

    if (!validateProjectName(projectName)) {
      log("error");
      return;
    }

    project = projectName;
    log("project:" + project);

    projectsRef.off('child_added', onaddedproject);
    projectsRef.off('child_removed', onremovedproject);

    $('#config').attr('disabled', 'disabled').slideUp();
    projectRef = projectsRef.child(project);
    projectRef.removeOnDisconnect();

    nextIdRef = projectRef.child("nextId");
    nodesRef = projectRef.child("nodes");

    nextIdRef.once('value', function (snapshot) {
      myId = snapshot.val();
      listen(myId);
      nodesRef.child(parentId).child("queue").push({
        type:"request",
        sender:myId
      });
      initiateCall();
    });
  };

  $("#join").click(function (){
    join($("#project").val());
  });
});
