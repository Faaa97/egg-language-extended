const {blue} = require('./colors.js');
const {specialForms, topEnv} = require('./eggvm.js');

const eggExit = specialForms["exit"] = () => {
  console.log(blue('goodbye!'));
  process.exit(0);
}

const HELP = [
  (blue('help()') + ' muestra esta ayuda.'),
  (blue('exit()') + ' sale del bucle REPL.'),
  (blue('Ctrl-D') + ' sale del bucle REPL.'),
];

const help = specialForms["help"] = () => {
  HELP.forEach(element => {
    console.log(element);
  });
  return "-".repeat(HELP[0].length - 10);
};

let version = require('../package.json').version;
topEnv["version"] = version;

module.exports = {
  version,
  HELP,
  help,
  eggExit,
};
