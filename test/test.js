let fs = require('fs');
let should = require("chai").should();
let e2t = require('@ull-esit-pl/example2test');
let eggvm = require('../src/eggvm.js');

describe("Testing scopes", function() {
  let runTest = (programName, done) => {
    e2t({
      exampleInput: programName + '.egg',
      executable: 'node bin/egg.js',
      assertion: (result, expected) => result.replace(/\s+/g,'').should.eql(expected.replace(/\s+/g,'')),
      done: done,
    });
  };

  it("should not allow the use of non declared variables", function() {
    let program = fs.readFileSync('examples/scope-err.egg', 'utf8');
    (() => { eggvm.run(program); }).should.throw(/setting.+undefined.+variable/i);
  });

  it("testing scope.egg", function(done) {
    runTest('scope-no-sugar', done);
  });
});