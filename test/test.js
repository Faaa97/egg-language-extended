const fs = require('fs');
const should = require("chai").should();
const e2t = require('@ull-esit-pl/example2test');
const eggvm = require('../src/eggvm.js');
const parse = require('../src/parse.js').parse;

const {Value, Word, Apply} = require('../src/ast.js');

const util = require('util');

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
    const expected = new Apply({
      operator: new Word({value: '+'}),
      args: [ new Word({value: 'a'}),
              new Value({value: 10}),
      ]
    });
    result.should.eql(expected);
  });

  it("ignores single-line comments", () => {
    const result = parse("# hello\nx");
    const expected = new Word({value: "x"});
    result.should.eql(expected);
  });

  it("can have comments and spaces mixed", () => {
    const result = parse("a # one\n   # two\n()");
    const expected = new Apply({
      operator: new Word({value: "a"}),
      args: [],
    });
    result.should.eql(expected);
  });

  it("error when unexpected syntax", () => {
    (() => parse("do(b + 4)")).should.throw(/Expected.+near/);
  });

  it("error when text after input", () => {
    (() => parse("define(x, 4)\nxy")).should.throw(/Unexpected text after program.+/);
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

  it("array", (done) => {
    runTest('array', done);
  })

  it("reto", (done) => {
    runTest('reto', done);
  })

});

describe("run", () => {
  let originalLog;
  let results = [];
  beforeEach(() => {
    originalLog = console.log;
    results = [];
    console.log = (...args) => {
      const stringified = args.map(arg => util.inspect(arg))
      const string = stringified.join(" ");
      results.push(string);
    };
  });
  afterEach(() => {
    console.log = originalLog;
  });

  it("testing one.egg with mocking of console.log", () => {
    const expected = ['50'];
    program = fs.readFileSync('examples/one.egg', 'utf8');
    eggvm.run(program);
    results.should.be.eql(expected);
  });

  it("number and string can be called as applications",  () => {
    const expected = [
      `5`,
      `'4.00'`
    ];
    const program = `do {
      print("hello"("length")),
      print(4("toFixed")(2))
    }`;
    eggvm.run(program);
    results.should.be.eql(expected);
  });

  it("arrays can be accessed with [] operator",  () => {
    const expected = [
      '1',
      '[ 5, 3 ]',
      '3'
    ];
    const program = `do(
      def(x, array[1, 4, array[5, 3]]),
      print(x[0]),   # 1
      print(x[2]),   # [5, 3]
      print(x[2][1]) # 3
    )`;
    eggvm.run(program);
    results.should.be.eql(expected);
  });

  it("js functions can be concatenated",  () => {
    const expected = [
      `'1-4-5'`,
    ];
    const program = `print(array[1,4,5]("join")("-"))`;
    eggvm.run(program);
    results.should.be.eql(expected);
  });

  it("js functions can be called on words",  () => {
    const expected = [
      `'HELLO'`,
    ];
    const program = `do(
      def(x, "hello"),
      print(x("toUpperCase")())
    )`;
    eggvm.run(program);
    results.should.be.eql(expected);
  });

  it("more concatenation",  () => {
    const expected = [
      `'A-B-C'`,
    ];
    const program = `do{
      def(x, array["a", "b", "c"]),
      print(x("join")("-")("toUpperCase")())
    }`;
    eggvm.run(program);
    results.should.be.eql(expected);
  });

  it("even more concatenation",  () => {
    const expected = [
      `'1-hello egg'`,
    ];
    const program = `do(
      print(array[1,4,5]("join")("-")("substring")(0,2)("concat")("hello egg"))
    )`;
    eggvm.run(program);
    results.should.be.eql(expected);
  });

  it("can use js map",  () => {
    const expected = [
      `[ 2, 3, 4, 5 ]`,
    ];
    const program = `do(
      define(x, array[1,2,3,4]),
      define(inc, fun(x,i,g, +(x,1))),
      print(x("map")[inc])
  )`;
    eggvm.run(program);
    results.should.be.eql(expected);
  });
});

describe("Testing Errors", () => {
  it.skip("should report errors with line number and offset", () => {
    /*let program = fs.readFileSync('examples/scope-err.egg', 'utf8');
    (() => { eggvm.run(program); }).should.throw(/setting.+undefined.+variable/i);*/
  });
})
