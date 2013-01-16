/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/11
 * Time: 9:20
 * To change this template use File | Settings | File Templates.
 */

var mainRef = new Firebase("https://rtc.firebaseio.com/hub_test_v1/");
var projectsRef = mainRef.child("projects");

var myId,parentId;

function listen(myId) {
    parentId = Math.floor(myId / 2);
    log("Your ID:" + myId + "\nParent ID:" + parentId);
    nextIdRef.set(myId + 1);
    nodesRef.child(myId).child("queue").on('child_added', function (snapshot) {
        var data = snapshot.val();
        log(JSON.stringify(data));
        snapshot.ref().remove();
        switch (data.type) {
            case "offer":
                incomingOffer(data.offer, data.port, data.sender);
                break;
            case "answer":
                incomingAnswer(data.answer, data.port, data.sender);
                break;
        }
    });
}
