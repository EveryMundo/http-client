'require strict';

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

describe('index.js', () => {
  const
    { sandbox }  = require('sinon'),
    { expect }   = require('chai'),
    // { clone }    = require('@everymundo/simple-clone'),
    cleanrequire = require('@everymundo/cleanrequire'),
    loadLib = () => cleanrequire('../lib/promise-get'),
    noop = () => { };

  // eslint-disable-next-line one-var-declaration-per-line
  let box;

  const url  = require('url');
  const logr = require('@everymundo/simple-logr');

  beforeEach(() => {
    box = sandbox.create();
    ['log', 'info', /* 'debug',  */'error']
      .forEach(method => box.stub(logr, method).callsFake(noop));
  });

  afterEach(() => { box.restore(); });

  context('promiseGet', () => {
    let promiseDataToLib;

    beforeEach(() => {
      promiseDataToLib = cleanrequire('../lib/promise-data-to');
      box.stub(promiseDataToLib, 'promiseDataTo').callsFake(arg => Promise.resolve(arg));
    });

    it('should call promiseDataTo', () => {
      const { promiseGet } = loadLib();

      const config = url.parse('http://test.com/somepath');

      return promiseGet(config)
        .then(() => {
          expect(promiseDataToLib.promiseDataTo).to.have.property('calledOnce', true);
        });
    });

    it('should call promiseDataTo', () => {
      const { promiseGet } = loadLib();

      const config = url.parse('http://test.com/somepath');
      // eslint-disable-next-line one-var-declaration-per-line
      let protocol, http, host, port, query, path, endpoint, headers, agent, maxRetry;
      const expected = { protocol, http, host, port, query, path, endpoint, headers, agent, maxRetry, method: 'GET'};

      Object.keys(config).forEach((key) => {
        if (key in expected) expected[key] = config[key];
      });

      return promiseGet(config)
        .then((arg) => {
          expected.method = 'GET';

          expect(arg).to.deep.equal(expected);
        });
    });
  });
});
