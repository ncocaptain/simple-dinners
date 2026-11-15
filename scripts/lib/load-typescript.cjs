// Load production TS modules in isolated Node audits without generating repo files.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function createTypeScriptLoader() {
  const cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} };
    cache.set(file, mod);
    const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
    }).outputText;
    new Function('module', 'exports', 'require', output)(mod, mod.exports, name => {
      if (name.startsWith('.')) {
        return load(path.resolve(path.dirname(file), name + (path.extname(name) ? '' : '.ts')));
      }
      return require(name);
    });
    return mod.exports;
  }
  return load;
}
module.exports = { createTypeScriptLoader };
