const program = require('commander');
const {version, description} = require('../package.json');
const runFromEVM = require('../src/eggvm.js').runFromEVM;
const fs = require('fs');

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
      const ast = JSON.parse(eggAst);
      runFromEVM(ast);
    }
  });
} else {
  // In case user doesn't specify file to read
  program.help();
}
