function skipSpace(string) {
  let first = string.search(/\S/);
  if (first == -1) return "";
  return string.slice(first);
}

function skipComments(string) {
  // Replaces comment with nothing, also line terminator if there is one
  return string.replace(/^#.*(\n|\r)?/, ''); 
}

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
    throw new SyntaxError("Unexpected syntax: " + program.length);
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
      throw new SyntaxError("Expected ',' or ')'");
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
    throw new SyntaxError(`Unexpected syntax line ${lineno}: ${program.slice(0,20)}`);
  }
}

function parse(prog) {
  debugger;
  program = prog;
  lex(); // Get first token in lookahead
  let {expr, rest} = parseExpression();
  if (skipSpace(rest).length > 0) {
    throw new SyntaxError("Unexpected text after program");
  }
  return expr;
}

const specialForms = Object.create(null);

specialForms.if = (args, scope) => {
  if (args.length != 3) {
    throw new SyntaxError("Wrong number of args to if");
  } else if (evaluate(args[0], scope) !== false) {
    return evaluate(args[1], scope);
  } else {
    return evaluate(args[2], scope);
  }
};

specialForms.while = (args, scope) => {
  if (args.length != 2) {
    throw new SyntaxError("Wrong number of args to while");
  }
  while (evaluate(args[0], scope) !== false) {
    evaluate(args[1], scope);
  }

  // Since undefined does not exist in Egg, we return false,
  // for lack of a meaningful result.
  return false;
};

specialForms.do = (args, scope) => {
  let value = false;
  for (let arg of args) {
    value = evaluate(arg, scope);
  }
  return value;
};

specialForms.define = (args, scope) => {
  if (args.length != 2 || args[0].type != "word") {
    throw new SyntaxError("Incorrect use of define");
  }
  let value = evaluate(args[1], scope);
  scope[args[0].name] = value;
  return value;
};

specialForms.fun = (args, scope) => {
  if (!args.length) {
    throw new SyntaxError("Functions need a body");
  }
  let body = args[args.length - 1];
  let params = args.slice(0, args.length - 1).map(expr => {
    if (expr.type != "word") {
      throw new SyntaxError("Parameter names must be words");
    }
    return expr.name;
  });

  return function() {
    if (arguments.length != params.length) {
      throw new TypeError("Wrong number of arguments");
    }
    let localScope = Object.create(scope);
    for (let i = 0; i < arguments.length; i++) {
      localScope[params[i]] = arguments[i];
    }
    return evaluate(body, localScope);
  };
};

specialForms.set = (args, scope) => {
  if (args.length !== 2 || args[0].type !== "word") {
    throw new SyntaxError("Incorrect use of set");

  }
  let currentScope = scope;
  while(currentScope !== null) {
    if(Object.prototype.hasOwnProperty.call(currentScope, args[0].name)) {
      let value = evaluate(args[1], scope); // Evaluate args[1] in original scope for set call
      currentScope[args[0].name] = value; // Update binding in its scope
      return value;
    } else {
      currentScope = Object.getPrototypeOf(currentScope);
    }
  }
  // If we get to here, we didn't find any scope for args[0] binding
  throw new ReferenceError("Binding not defined");
};

function evaluate(expr, scope) {
  if (expr.type == "value") {
    return expr.value;
  } else if (expr.type == "word") {
    if (expr.name in scope) {
      return scope[expr.name];
    } else {
      throw new ReferenceError(
        `Undefined binding: ${expr.name}`);
    }
  } else if (expr.type == "apply") {
    let {operator, args} = expr;
    if (operator.type == "word" &&
        operator.name in specialForms) {
      return specialForms[operator.name](expr.args, scope);
    } else {
      let op = evaluate(operator, scope);
      if (typeof op == "function") {
        return op(...args.map(arg => evaluate(arg, scope)));
      } else {
        throw new TypeError("Applying a non-function.");
      }
    }
  }
}

function run(program) {
  const topScope = Object.create(null);

  topScope.true = true;
  topScope.false = false;

  for (let op of ["+", "-", "*", "/", "==", "<", ">"]) {
    topScope[op] = Function("a, b", `return a ${op} b;`);
  }

  topScope.print = value => {
    console.log(value);
    return value;
  };

  return evaluate(parse(program), Object.create(topScope));
}

// console.log(parse("+(a, 10)"));

// Fast tests || TODO: Remove and add mocha tests
run(`
do(define(total, 0),
   define(count, 1),
   while(<(count, 11),
         do(define(total, +(total, count)),
            define(count, +(count, 1)))),
   print(total))
`);
// → 55

run(`
do(define(plusOne, fun(a, +(a, 1))),
   print(plusOne(10)))
`);
// → 11

run(`
do(define(pow, fun(base, exp,
     if(==(exp, 0),
        1,
        *(base, pow(base, -(exp, 1)))))),
   print(pow(2, 10)))
`);
// → 1024

// COMMENTS TEST
console.log(parse("# hello\nx"));
// → {type: "word", name: "x"}

console.log(parse("a # one\n   # two\n()"));
// → {type: "apply",
//    operator: {type: "word", name: "a"},
//    args: []}

// SCOPE TEST
run(`
do(define(x, 4),
   define(setx, fun(val, set(x, val))),
   setx(50),
   print(x))
`);
// → 50

// run(`set(quux, true)`);
// → Some kind of ReferenceError