// The AST classes
const {specialForms} = require("./registry.js");

class Value {
  value;

  constructor(token) {
    this.value = token.value;
  }
  evaluate() {
    return this.value;
  }
}

class Word {
  name;

  constructor(token) {
    this.name = token.value;
  }
  evaluate(env) {
    if (this.name in env) {
      return env[this.name];
    } else {
      throw new ReferenceError(`Undefined binding: ${this.name}`);
    }
  }
}

class Apply {
  operator;
  args;

  constructor(tree) {
    this.operator = tree.operator;
    this.args = tree.args;
  }
  evaluate(env) {
    if (this.operator instanceof Word &&
        this.operator.name in specialForms) {
      return specialForms[this.operator.name](this.args, env);
    } else {
      let op = this.operator.evaluate(env);
      if (op instanceof Function) {
        return op(...this.args.map(arg => arg.evaluate(env)));
      } else {
        throw new TypeError("Applying a non-function.");
      }
    }
  }
}

module.exports = {Value, Word, Apply};