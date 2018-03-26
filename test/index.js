'require strict';

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

describe('index.js', () => {
  const
    { sandbox, spy } = require('sinon'),
    { expect }       = require('chai'),
    cleanrequire     = require('@everymundo/cleanrequire'),
    loadLib = () => cleanrequire('../lib/promise-data-to'),
    noop = () => { };

  // eslint-disable-next-line one-var-declaration-per-line
  let box;

  const logr = require('@everymundo/simple-logr');
  beforeEach(() => {
    box = sandbox.create();
    ['log', 'info', /* 'debug',  */'error']
      .forEach(method => box.stub(logr, method).callsFake(noop));
  });

  afterEach(() => { box.restore(); });

  context('exported keys and types', () => {
    const expected = {
      promiseDataTo:  Function,
      parseEndpoints: Function,
      urlToEndpoint:  Function,
      promiseGet:     Function,
    };

    it('should export the expected keys', () => {
      const lib = require('../index.js');

      const libKeys = Object.keys(lib);

      const expectedKeys = Object.keys(expected);

      expect(libKeys).to.deep.equal(expectedKeys);
    });

    it('should export the expected keys', () => {
      const lib = require('../index.js');

      Object.keys(expected).forEach(key =>
        expect(lib[key]).to.be.instanceof(expected[key]));
    });
  });
});
