'require strict';

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

describe('lib/parse-endpoints.js', () => {
  const
    http         = require('http'),
    { sandbox }  = require('sinon'),
    { expect }   = require('chai'),
    // { clone }    = require('@everymundo/simple-clone'),
    // cleanrequire = require('@everymundo/cleanrequire'),
    // noop = () => { },
    loadLib = () => require('../lib/parse-endpoints.js');

  // eslint-disable-next-line one-var-declaration-per-line
  let box;

  // const logr = require('@everymundo/simple-logr');

  if (!('MAIN_ENDPOINT' in process.env)) process.env.MAIN_ENDPOINT = '';
  if (!('MAIN_ENDPOINT_HEADERS' in process.env)) process.env.MAIN_ENDPOINT_HEADERS = '';

  beforeEach(() => {
    box = sandbox.create();
    box.stub(process.env, 'MAIN_ENDPOINT').value('http://test.com/some/path');
  });

  afterEach(() => { box.restore(); });

  context('parseEndpoints', () => {
    const { parseEndpoints } = loadLib();

    context('when receiving and INVALID url =>', () => {
      context('invalid protocol', () => {
        beforeEach(() => {
          box.stub(process.env, 'MAIN_ENDPOINT')
            .value('tcp://test.com/some/path');
        });

        it('show throw an error', () => {
          const caller = () => parseEndpoints();

          expect(caller).to.throw(Error, 'has an invalid endpoint');
        });
      });
    });

    context('when not receiving any argument =>', () => {
      beforeEach(() => {
        box.stub(process.env, 'MAIN_ENDPOINT').value('http://test.com/some/path');
      });

      it('should return an object with the expected properties', () => {
        const result = parseEndpoints();

        const expected = {
          MAIN: [{
            http,
            endpoint: 'http://test.com/some/path',
            headers: { },
            host: 'test.com',
            path: '/some/path',
            port: null,
          }],
        };

        expect(result).to.deep.equal(expected);
        expect(Object.keys(result)).to.deep.equal(Object.keys(expected));
      });
    });


    context('when receiving a regexp without grouping', () => {
      beforeEach(() => {
        box.stub(process.env, 'MAIN_ENDPOINT').value('http://test.com/some/path');
      });

      it('should return an object with the key being the whole variable name', () => {
        const result = parseEndpoints(/^MAIN_ENDPOINT$/);

        const expected = {
          MAIN_ENDPOINT: [{
            http,
            endpoint: 'http://test.com/some/path',
            headers: {},
            host: 'test.com',
            path: '/some/path',
            port: null,
          }],
        };

        expect(result).to.deep.equal(expected);
        expect(Object.keys(result)).to.deep.equal(Object.keys(expected));
      });
    });

    context('http url with credentials and no headers', () => {
      beforeEach(() => {
        box.stub(process.env, 'MAIN_ENDPOINT').value('http://Bearer:token@test.com/some/path');
      });

      it('should return an object with the expected properties', () => {
        const result = parseEndpoints();

        const expected = {
          MAIN:[{
            http,
            endpoint: 'http://test.com/some/path',
            headers: {
              Authorization: 'Bearer token',
            },
            host: 'test.com',
            path: '/some/path',
            port: null,
          }],
        };

        expect(result).to.deep.equal(expected);
      });
    });

    context('http url with credentials AND with headers', () => {
      beforeEach(() => {
        box.stub(process.env, 'MAIN_ENDPOINT')
          .value('http://Bearer:token@test.com/some/path');
        box.stub(process.env, 'MAIN_ENDPOINT_HEADERS')
          .value('{"content-type":"application/xml"}');
      });

      it('should return an object with the expected properties', () => {
        const result = parseEndpoints();

        const expected = {
          MAIN: [{
            http,
            endpoint: 'http://test.com/some/path',
            headers: {
              Authorization: 'Bearer token',
              'content-type': 'application/xml',
            },
            host: 'test.com',
            path: '/some/path',
            port: null,
          }],
        };

        expect(result).to.deep.equal(expected);
      });
    });

    context('http simple url with headers', () => {
      beforeEach(() => {
        box.stub(process.env, 'MAIN_ENDPOINT')
          .value('http://test.com/some/path');
        box.stub(process.env, 'MAIN_ENDPOINT_HEADERS')
          .value('{"content-type":"application/xml"}');
      });

      it('should return an object with the expected properties', () => {
        const result = parseEndpoints();

        const expected = {
          MAIN: [{
            http,
            endpoint: 'http://test.com/some/path',
            headers: {
              'content-type': 'application/xml',
            },
            host: 'test.com',
            path: '/some/path',
            port: null,
          }],
        };

        expect(result).to.deep.equal(expected);
      });
    });

    context('http simple url but INVALID headers', () => {
      beforeEach(() => {
        box.stub(process.env, 'MAIN_ENDPOINT')
          .value('http://test.com/some/path');
        box.stub(process.env, 'MAIN_ENDPOINT_HEADERS')
          .value('{not-a-valid-json-key:"application/xml"}');
      });

      it('should return an object with the expected properties', () => {
        const caller = () => parseEndpoints();

        expect(caller).to.throw(Error);
      });
    });

    context('Regexp too generic and matches multiple ENV Vars', () => {
      beforeEach(() => {
        box.stub(process.env, 'MAIN_ENDPOINT')
          .value('http://test.com/some/path');
        box.stub(process.env, 'MAIN_ENDPOINT_HEADERS')
          .value('{"content-type":"application/xml"}');
      });

      it('should return an object with the expected properties', () => {
        const caller = () => parseEndpoints(/MAIN/);

        expect(caller).to.throw(Error, 'present twice');
      });
    });
  });
});
