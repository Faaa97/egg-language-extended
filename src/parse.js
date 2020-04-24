const fs = require('fs');

let lookahead;
let lineno = 1; // Save token line numbers
let offset = 0; // Save token offset
let program;

const STRING_REGEX = /^"([^"]*)"/;
const NUMBER_REGEX = /^\d+\b/;
const WORD_REGEX = /^[^\s(),#"]+/;
const LEFT_PARENTHESIS_REGEX = /^[(]/;
const RIGHT_PARENTHESIS_REGEX = /^[)]/;
const COMMA_PARENTHESIS_REGEX = /^,/;
const COMMENT_REGEX = /^#.*(\n|\r)?/;

function updateLineNo(string, index) {
  const temp =  string.slice(0, index);
  const count = (temp.match(/(\n|\r)/g) || []).length;
  lineno += count;
}

function skipSpace(string) {
  const first = string.search(/\S/);
  if (first === -1) return "";
  updateLineNo(string, first);
  offset += first;
  return string.slice(first);
}

function skipComments(string) {
  // Replaces comment with nothing, also line terminator if there is one
  const match = string.match(COMMENT_REGEX);
  if (match) {
    const length = match[0].length
    offset += length;
    lineno += ( match[1] === undefined ) ? 1 : 0;
    return string.slice(length); 
  }
  return string;
}

function getProgramSlice() {
  return lookahead.value + program.slice(0, 10);
}

function lex() {
  let comparator;
  // Skip comments and spaces until there is no more
  while (comparator !== program) {
    comparator = program;
    program = skipComments(skipSpace(program));
  }

  if(program.length === 0){
    return {type: 'EOF'};
  }

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
  } else if (match = COMMA_PARENTHESIS_REGEX.exec(program)) {
    lookahead = {type: "COMMA", value: match[0]};
  } else {
    throw new SyntaxError(`Unexpected syntax at line ${lineno}: ${getProgramSlice()}`);
  }
  program = program.slice(match[0].length); //Trim program

  return lookahead;
}

function parseApply(expr) {

  if(lookahead.type != "LEFT_PARENTHESIS") {
    return {expr: expr, rest: program};
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

  if (lookahead.type == "STRING") {
    expr = {type: "value", value: lookahead.value};
    lex();
    return expr;
  } else if (lookahead.type == "NUMBER") {
    expr = {type: "value", value: lookahead.value};
    lex();
    return expr;
  } else if (lookahead.type == "WORD") {
    expr = {type: "word", name: lookahead.value};
    lex();
    return parseApply(expr);
  } else {
    throw new SyntaxError(`Unexpected syntax line ${lineno}: '${getProgramSlice()}'`);
  }
}

function parse(prog) {
  program = prog;
  lineno = 1;
  offset = 0;
  lex(); // Get first token in lookahead
  let {expr, rest} = parseExpression();
  if (skipSpace(rest).length > 0) {
    throw new SyntaxError(`Unexpected text after program at line ${lineno}: '${getProgramSlice()}'`);
  }
  return expr;
}

module.exports = {
  parse,
  parseApply,
  parseExpression,
  // parseFromFile, // TODO: make parseFromFile, returns ast
};