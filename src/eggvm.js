const parser = require('./parse.js');
const environment = require('./environment.js');

const specialForms = environment.specialForms;
const topEnv = environment.topEnv;

require('./monkey-patching.js').patch();

const parse = parser.parse;
const json2AST = parser.json2AST;

function run(program) {
  const ast = parse(program);
  return runFromEVM(ast);
}

function runFromEVM(ast) {
  return ast.evaluate(Object.create(topEnv));
}

module.exports = {
  run, 
  // runFromFile, // TODO: Make runFromFile
  runFromEVM,
  topEnv,
  specialForms, 
  parser,
  json2AST,
};