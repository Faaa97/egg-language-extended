const registry = require('./registry.js');
const specialForms = registry.specialForms;
const topEnv = registry.topEnv;

const {Value, Word, Apply} = require('./ast.js');

/* Fills registry items with default reserved words */

specialForms.if = (args, scope) => {
  if (args.length != 3) {
    throw new SyntaxError("Wrong number of args to if");
  } else if (args[0].evaluate(scope) !== false) {
    return args[1].evaluate(scope);
  } else {
    return args[2].evaluate(scope);
  }
};

specialForms.while = (args, scope) => {
  if (args.length != 2) {
    throw new SyntaxError("Wrong number of args to while");
  }
  while (args[0].evaluate(scope) !== false) {
    args[1].evaluate(scope);
  }

  // Since undefined does not exist in Egg, we return false,
  // for lack of a meaningful result.
  return false;
};

specialForms.do = (args, scope) => {
  let value = false;
  for (let arg of args) {
    value = arg.evaluate(scope);
  }
  return value;
};

specialForms[':='] =
specialForms.def =
specialForms.define = (args, scope) => {
  if (args.length != 2 || !(args[0] instanceof Word)) {
    throw new SyntaxError("Incorrect use of define");
  }
  let value = args[1].evaluate(scope);
  scope[args[0].name] = value;
  return value;
};

specialForms['->'] =
specialForms.fun = (args, scope) => {
  if (!args.length) {
    throw new SyntaxError("Functions need a body");
  }
  let body = args[args.length - 1];
  let params = args.slice(0, args.length - 1).map(expr => {
    if (!(expr instanceof Word)) {
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
    return body.evaluate(localScope);
  };
};

specialForms['='] =
specialForms.set = (args, scope) => {
  if (args.length !== 2 || !(args[0] instanceof Word)) {
    throw new SyntaxError("Incorrect use of set");

  }
  let currentScope = scope;
  while(currentScope !== null) {
    if(Object.prototype.hasOwnProperty.call(currentScope, args[0].name)) {
      let value = args[1].evaluate(scope); // Evaluate args[1] in original scope for set call
      currentScope[args[0].name] = value; // Update binding in its scope
      return value;
    } else {
      currentScope = Object.getPrototypeOf(currentScope);
    }
  }
  // If we get to here, we didn't find any scope for args[0] binding
  throw new ReferenceError(`Tried setting an undefined variable: ${args[0].name}`);
};

topEnv.true = true;
topEnv.false = false;

for (let op of ["+", "-", "*", "/", "==", "<", ">"]) {
  topEnv[op] = Function("a, b", `return a ${op} b;`);
}

topEnv.print = value => {
  console.log(value);
  return value;
};

topEnv.array = (...values) => {
  return values;
};

topEnv.length = (array) => {
  return array.length;
};

topEnv['<-'] =
topEnv.element = (array, ...index) => {
  const search = function(arr, ...args) {
    if (args.length === 0) {
      return arr;
    }
    const index = args.shift();
    if (args.length > 0) {
      return search(arr[index], ...args);
    } else {
      return arr[index];
    }
  };
  return search(array, ...index);
};

module.exports = {
  specialForms,
  topEnv,
};