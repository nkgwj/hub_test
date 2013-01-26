/**
 * Created with JetBrains WebStorm.
 * User: k-nkgwj
 * Date: 13/01/26
 * Time: 15:35
 * To change this template use File | Settings | File Templates.
 */
var Compiler = (function () {

  function Compiler(fileType) {
    this.fileType = fileType;
    this.executable = Compiler.collections[fileType];
  }

  Compiler.prototype.isSupported = function(fileType){
    return Compiler.collections[fileType];
  };

  Compiler.prototype.compile = function (source,deffered) {
    this.executable(source,deffered);
  };

  return Compiler;
})();

Compiler.collections = {
  'text/typescript':function (_program, _deffered) {
    var dfdLibLoad = $.get("js/lib/tsc/lib.d.ts", null, null, "text");
    dfdLibLoad.done(function (libfile) {
      var compiledProgram = TypeScriptCompiler.compile([
        {
          fileName:"lib.d.ts",
          source:libfile
        },
        {
          fileName:"",
          source:_program
        }
      ]);
      _deffered.resolve(compiledProgram);
    });
  },
  'text/coffeescript':function (_program, _deffered) {
    var compiledProgram = CoffeeScript.compile(_program, {bare:true});
    _deffered.resolve(compiledProgram);
  },
  'text/javascript':function (_program, _deffered) {
    _deffered.resolve(_program);
  }
};

