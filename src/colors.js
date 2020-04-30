const DEFAULT = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';

function red(string) {
  return RED + string + DEFAULT;
}

function green(string) {
  return GREEN + string + DEFAULT;
}

function blue(string) {
  return BLUE + string + DEFAULT;
}

module.exports = {
  red,
  green,
  blue,
};
