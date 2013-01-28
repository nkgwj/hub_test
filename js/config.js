/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/23
 * Time: 3:32
 * To change this template use File | Settings | File Templates.
 */
CONFIG = {
  default:{
    requestThreshold:1,
    incrementalReduceThreshold:200,
    requestDatasetSize:50,
    mapSize:40,
    reduceSize:40,
    riseSize:40,
    clockCycle:30
  },
  autoStart:true,
  autoConnect:"auto",
  loadMapReduceLibrary:"mapreduce/mapreduce.js",
  verbose:true
};