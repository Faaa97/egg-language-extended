const inspect = require("util").inspect;
const ins = (x) => inspect(x, {depth: null});
const readline = require("readline");

const egg = require('./eggvm.js');
const topEnv = egg.topEnv;
const specialForms = egg.specialForms;
const parser = egg.parser;

const evaluate = egg.evaluate;
const parse = parser.parse;
const getTokens = parser.getTokens;
const parBalance = parser.parBalance;
const ALLWHITE_REGEX = new RegExp('^' + egg.parser.WHITE_REGEX.source + '$');

const {eggExit, help} = require('./extensions.js');
const {red} = require('./colors.js');
const PROMPT = '> ';

function eggRepl() {
  let program = '';
  let stack = 0;
  const reset = () => {program = ''; stack = 0;};
  try {
    let rl = readline.createInterface({input: process.stdin, output: process.stdout, completer});
    rl.prompt(PROMPT);
    console.log(`Version ${topEnv['version']}`);
    rl.prompt();

    rl.on('line', (line) => {
      stack += parBalance(line);
      program += line + '\n';

      if(stack <= 0 && !ALLWHITE_REGEX.test(program)) {
        try {
          let ast = parse(program);
          let result = evaluate(ast, topEnv);
          console.log(ins(result));
        } catch (e) {
          console.log(red(e.message));
        }
        reset();
      }
      rl.setPrompt(PROMPT + '..'.repeat(stack));
      rl.prompt();

    });

    rl.on('close', eggExit);

    rl.on('SIGINT', () => {
      console.log(red('Expression discarded!'));
      reset();
      rl.setPrompt(PROMPT);
      rl.prompt();
    });
  } catch (err) {
    console.log(red(err));
    help();
  }

  process.stdin.on('end', eggExit);

  function completer(line) {
    const tokens = getTokens(line);
    const word = tokens.filter((t) => t && t.type === 'WORD').pop().value;
    const allKeys = Object.keys(specialForms).concat(Object.keys(topEnv));
    const hits = allKeys.filter((key) => key.startsWith(word));
    return [hits, word];
  }
}

module.exports = eggRepl;