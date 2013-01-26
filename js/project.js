/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/21
 * Time: 15:25
 * To change this template use File | Settings | File Templates.
 */
var GridProject = (function () {
  function GridProject(id) {
    this.id = id;
    this.childNodes = [];
  }

  GridProject.prototype.setup = function (_program, _datasetStore, _intermediatesStore) {
    mapReduceWorker = new MapReduceWorker(_program);
    mapReduceAgent = new MapReduceAgent(mapReduceWorker, _datasetStore, _intermediatesStore);
    mapReduceConductor = new MapReduceConductor(mapReduceAgent, parentId, CONFIG);
  };

  GridProject.validateProjectName = function (projectName) {
    return (typeof projectName === 'string' && projectName != '');
  };

  return GridProject;

})();