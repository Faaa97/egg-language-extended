let parse = require('./parse.js').parse;

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
  throw new ReferenceError(`Tried setting an undefined variable: ${args[0]}`);
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
  const ast = parse(program);
  return runFromEVM(ast);
}

function runFromEVM(ast) {
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

  return evaluate(ast, Object.create(topScope));
}

module.exports = {
  run, 
  // runFromFile, // TODO: Make runFromFile
  runFromEVM,
  // topEnv,      // TopEnv?
  specialForms, 
  // parser,      // parser?
  evaluate
};