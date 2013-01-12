/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/11
 * Time: 9:20
 * To change this template use File | Settings | File Templates.
 */

var mainRef = new Firebase("https://rtc.firebaseio.com/hub_test_v1/");

//var projectName = prompt("Enter your project name.","");

var projectName = "test";

var projectRef = mainRef.child(projectName);

var nextIdRef = projectRef.child("nextId");

var nodesRef = projectRef.child("nodes");

