const program = require('commander');
const {version} = require('../package.json');
const parseEGG = require('../src/parse.js').parse;
const fs = require('fs');

const description = 'Egg parser. Load a .egg file to run';


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
      const ast = parseEGG(eggCode);
      const json = JSON.stringify(ast.toObj(), null, 2);
      const outputFile = inputFile + '.evm';
      // Write to output file
      fs.writeFile(outputFile, json, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log(`Output in file '${outputFile}'`);
        }
      });
    }
  });
} else {
  // In case user doesn't specify file to read
  program.help();
}
