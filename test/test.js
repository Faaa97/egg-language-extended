const fs = require('fs');
const should = require("chai").should();
const e2t = require('@ull-esit-pl/example2test');
const eggvm = require('../src/eggvm.js');
const parse = require('../src/parse.js').parse;

const runTest = (programName, done) => {
  e2t({
    exampleInput: programName + '.egg',
    executable: 'node bin/egg.js',
    assertion: (result, expected) => result.replace(/\s+/g,'').should.eql(expected.replace(/\s+/g,'')),
    done: done,
  });
};


describe("Testing scopes", () => {
  it("should not allow the use of non declared variables", () => {
    const program = fs.readFileSync('examples/scope-err.egg', 'utf8');
    (() => { eggvm.run(program); }).should.throw(/setting.+undefined.+variable/i);
  });

  it("testing scope-no-sugar.egg", (done) => {
    runTest('scope-no-sugar', done);
  });

  it("set can be used to change variable value", (done) => {
    runTest('set', done);
  });

  it("set cannot be used if variable is not defined", () => {
    const program = `set(quux, true)`;
    (() => { eggvm.run(program); }).should.throw(/setting.+undefined.+variable/i);
  });

});

describe("Testing parse", () => {
  it("binary operator", () => {
    const result = parse("+(a, 10)");
    const expected = {
      type: 'apply',
      operator: { type: 'word', name: '+' },
      args: [ { type: 'word', name: 'a' },
              { type: 'value', value: 10 }
      ]
    };
    result.should.eql(expected);
  });

  it("ignores single-line comments", () => {
    const result = parse("# hello\nx");
    const expected = {type: "word", name: "x"};
    result.should.eql(expected);
  });

  it("can have comments and spaces mixed", () => {
    const result = parse("a # one\n   # two\n()");
    const expected = {
      type: "apply",
      operator: {type: "word", name: "a"},
      args: []
    };
    result.should.eql(expected);
  });

  it("error when unexpected syntax", () => {
    (() => parse("do(b + 4)")).should.throw(/Expected.+near/);
  });
});

describe("Testing evaluator", () => {
  it("while", (done) => {
    runTest('sum-first-10', done);
  });

  it("should be able to define and use functions", (done) => {
    runTest('plusOne', done);
  });

  it("functions can be recursive", (done) => {
    runTest('pow', done);
  })
});

describe("Testing Errors", () => {
  it.skip("should report errors with line number and offset", () => {
    let program = fs.readFileSync('examples/scope-err.egg', 'utf8');
    (() => { eggvm.run(program); }).should.throw(/setting.+undefined.+variable/i);
  });
})