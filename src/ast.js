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
  toObj(){
    return {
      type: "value",
      value: this.value,
    };
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
  toObj(){
    return {
      type: "word",
      name: this.name,
    };
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
    } else if (this.operator instanceof Value) { 
      const value = this.operator.evaluate(env);
      const prop = this.args[0].evaluate(env); //Ignores other args
      const target = value[prop];
      if (target instanceof Function) {
        return (args) => {
          return target.call(value, args);
        };
      } else {
        return value[prop];
      }
    } else {
      let op = this.operator.evaluate(env);
      if (op instanceof Function) {
        return op(...this.args.map(arg => arg.evaluate(env)));
      } else {
        return op[this.args[0].evaluate(env)]; //Ignores other args
      }
    }
  }
  toObj(){
    return {
      type: "apply",
      operator: this.operator.toObj(),
      args: this.args.map((arg) => arg.toObj()),
    };
  }
}

module.exports = {Value, Word, Apply};