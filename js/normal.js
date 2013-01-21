/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/16
 * Time: 18:22
 * To change this template use File | Settings | File Templates.
 */

$(function () {
  var project;
  var onaddedproject = function (addedProject) {
    var option = $('<option>').attr('value', addedProject.name()).html(addedProject.name());
    $('#project').append(option);
  };

  var onremovedproject = function (removedProject) {
    var selector = 'option[value="' + removedProject.name() + '"]';
    $(selector).remove();
  };

  var join = function (projectName) {
    if (!GridProject.validateProjectName(projectName)) {
      console.log('error:project name');
      return;
    }

    project = projectName;
    outputBox.log('Project:' + project);

    projectsRef.off('child_added', onaddedproject);
    projectsRef.off('child_removed', onremovedproject);

    $('#config').attr('disabled', 'disabled').slideUp();

    projectRef = projectsRef.child(project);
    projectRef.removeOnDisconnect();

    nextIdRef = projectRef.child('nextId');
    nodesRef = projectRef.child('nodes');

    nextIdRef.once('value', function (snapshot) {
      myId = snapshot.val();
      listen(myId);
      nodesRef.child(parentId).child('queue').push({
        type:'request',
        sender:myId
      });
      initPeerConnection();
    });
  };

  projectsRef.on('child_added', onaddedproject);
  projectsRef.on('child_removed', onremovedproject);

  $('#join').click(function () {
    join($('#project').val());
  });
});
