let lookahead;
let lineno = 1; // Save token line numbers
let offset = 0; // Save token offset
let program;

const STRING_REGEX = /"([^"]*)"/y;
const NUMBER_REGEX = /\d+\b/y;
const WORD_REGEX = /[^\s(){},#;"\[\]]+/y;
const LEFT_PARENTHESIS_REGEX = /[({\[]/y;
const RIGHT_PARENTHESIS_REGEX = /[)}\]]/y;
const COMMA_REGEX = /,/y;
const COMMENT_REGEX = /[;#].*(\n|\r)?/y;
const WHITE_REGEX = /\s+/y;

const TOKENS = [
  STRING_REGEX,
  NUMBER_REGEX,
  WORD_REGEX,
  LEFT_PARENTHESIS_REGEX,
  RIGHT_PARENTHESIS_REGEX,
  COMMA_REGEX,
];

function updateLastIndex() {
  TOKENS.forEach((regex) => {
    regex.lastIndex = offset;
  });
}

function skipSpace() {
  WHITE_REGEX.lastIndex = offset;
  const match = WHITE_REGEX.exec(program);
  if (match) {
    offset = WHITE_REGEX.lastIndex;
    lineno += (match[0].match(/(\n|\r)/g) || []).length;
  }
}

function skipComments() {
  // Replaces comment with nothing, also line terminator if there is one
  COMMENT_REGEX.lastIndex = offset;
  const match = COMMENT_REGEX.exec(program);
  if (match) {
    offset = COMMENT_REGEX.lastIndex;
    lineno += ( match[1] === undefined ) ? 1 : 0;
  }
}

function getProgramSlice() {
  return lookahead.value + program.slice(offset, offset + 10);
}

function lex() {
  let comparator;
  // Skip comments and spaces until there is no more
  while (comparator !== offset) {
    comparator = offset;
    skipSpace();
    skipComments();
  }

  if(offset === program.length){
    lookahead = {type: 'EOF'};
    return lookahead;
  }

  updateLastIndex();

  let match;
  if (match = STRING_REGEX.exec(program)) {
    lookahead = {type: "STRING", value: match[1]};
  } else if (match = NUMBER_REGEX.exec(program)) {
    lookahead = {type: "NUMBER", value: Number(match[0])};
  } else if (match = WORD_REGEX.exec(program)) {
    lookahead = {type: "WORD", value: match[0]};
  } else if (match = LEFT_PARENTHESIS_REGEX.exec(program)) {
    lookahead = {type: "LEFT_PARENTHESIS", value: match[0]};
  } else if (match = RIGHT_PARENTHESIS_REGEX.exec(program)) {
    lookahead = {type: "RIGHT_PARENTHESIS", value: match[0]};
  } else if (match = COMMA_REGEX.exec(program)) {
    lookahead = {type: "COMMA", value: match[0]};
  } else {
    throw new SyntaxError(`Unexpected syntax at line ${lineno}: ${getProgramSlice()}`);
  }

  offset += match[0].length;
  return lookahead;
}

function parseApply(expr) {

  if(lookahead.type != "LEFT_PARENTHESIS") {
    return {expr: expr, rest: lookahead};
  }
  lex(); // Consume LEFT_PARENTHESIS

  expr = {type: "apply", operator: expr, args: []};
  while (lookahead.type != "RIGHT_PARENTHESIS") {
    let arg = parseExpression();
    expr.args.push(arg.expr || arg);

    if (lookahead.type === "COMMA") {
      lex(); // Consume COMMA
    } else if (lookahead.type !== "RIGHT_PARENTHESIS") {
      throw new SyntaxError(`Expected ',' or ')' near '${getProgramSlice()}', at line ${lineno}`);
    }
  }

  lex(); // Consume RIGHT_PARENTHESIS
  return parseApply(expr);
}

function parseExpression() {
  let expr;

  if (lookahead.type === "STRING") {
    expr = {type: "value", value: lookahead.value};
  } else if (lookahead.type === "NUMBER") {
    expr = {type: "value", value: lookahead.value};
  } else if (lookahead.type === "WORD") {
    expr = {type: "word", name: lookahead.value};
  } else {
    throw new SyntaxError(`Unexpected syntax line ${lineno}: '${getProgramSlice()}'`);
  }
  lex();
  return parseApply(expr);
}

function parse(prog) {
  setProgram(prog);
  lex(); // Get first token in lookahead
  let {expr, rest} = parseExpression();
  if (rest.type !== 'EOF') {
    throw new SyntaxError(`Unexpected text after program at line ${lineno}: '${getProgramSlice()}'`);
  }
  return expr;
}

function setProgram(string) {
  program = string;
  lineno = 1;
  offset = 0;
}

function getTokens(line) {
  setProgram(line);
  let result = [];
  let token = null;
  do {
    try {
      token = lex();
      result.push(token);
    } catch(e) {
      result.push({type: 'ERROR', value: program});
      break;
    }
  } while(token.type !== 'EOF');
  return result;
}

function parBalance(line) {
  let stack = 0;
  let tokens = getTokens(line);

  for(let token of tokens) {
    if(token.type === 'LEFT_PARENTHESIS') {
      stack++;
    } else if (token.type === 'RIGHT_PARENTHESIS') {
      stack--;
    }
  }
  return stack;
}

module.exports = {
  parse,
  parseApply,
  parseExpression,
  getTokens,
  parBalance,
  // parseFromFile, // TODO: make parseFromFile, returns ast
  WHITE_REGEX,
};