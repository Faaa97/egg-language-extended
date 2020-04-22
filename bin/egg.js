const program = require('commander');
const {version} = require('../package.json');
const runEGG = require('../src/eggvm.js').run;
const fs = require('fs');

const description = 'Egg parser and interpreter. Load a .egg file to run';

program
    .version(version)
    .description(description)
    .usage('<filename>')
    .parse(process.argv);

// Check user specified a file
if (program.args.length === 1) {
  const inputFile = program.args[0];

  // Read input file
  fs.readFile(inputFile, {encoding: 'utf8'}, function(err, eggCode) {
    if (err) {
      console.log(err);
    } else {
      runEGG(eggCode);
    }
  });
} else {
  // In case user doesn't specify file to read
  program.help();
}
