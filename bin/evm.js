const program = require('commander');
const {version} = require('../package.json');
const {runFromEVM, json2AST} = require('../src/eggvm.js');
const fs = require('fs');

const description = 'Egg interpreter. Load a .evm file to run';

program
    .version(version)
    .description(description)
    .usage('<filename>')
    .parse(process.argv);

// Check user specified a file
if (program.args.length === 1) {
  const inputFile = program.args[0];

  // Read input file
  fs.readFile(inputFile, {encoding: 'utf8'}, function(err, eggAst) {
    if (err) {
      console.log(err);
    } else {
      const obj = JSON.parse(eggAst);
      const ast = json2AST(obj);
      runFromEVM(ast);
    }
  });
} else {
  // In case user doesn't specify file to read
  program.help();
}
