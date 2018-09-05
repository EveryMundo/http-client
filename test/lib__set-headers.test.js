'require strict';

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

describe('lib/set-headers.js', () => {
  const
    { sandbox } = require('sinon'),
    { expect }  = require('chai');

  // eslint-disable-next-line one-var-declaration-per-line
  let box;

  beforeEach(() => { box = sandbox.create(); });
  afterEach(() => { box.restore(); });

  describe('#setHeaders', () => {
    const { setHeaders } = require('../lib/set-headers');

    context('When content-type is not set', () => {
      it('should set Content-type to JSON', () => {
        const headers = {};

        setHeaders(headers);

        expect(headers).to.have.property('Content-type', 'application/json');
      });
    });

    context('When content-type is preset', () => {
      it('should not change the Content-type sent', () => {
        const headers = { 'Content-type': 'application/something-else' };

        setHeaders(headers);

        expect(headers).to.have.property('Content-type', 'application/something-else');
      });
    });

    context('When data is not passed', () => {
      it('should not set Content-Length', () => {
        const headers = { 'Content-type': 'application/something-else' };

        setHeaders(headers);

        expect(headers).to.not.have.property('Content-Length');
      });
    });

    context('When data is passed', () => {
      it('should set Content-Length with its byte length', () => {
        const headers = {};
        const data = '{"name":"Daniel San","code":"ç"}';

        setHeaders(headers, data);

        expect(headers).to.have.property('Content-Length', 33);
      });
    });

    context('When compress is NOT present', () => {
      it('should not set Content-Encoding', () => {
        const headers = {};

        setHeaders(headers);

        expect(headers).to.not.have.property('Content-Encoding');
      });
    });

    context('When compress is present', () => {
      it('should set Content-Encoding its value', () => {
        const headers = {};
        const compress = 'gzip';

        setHeaders(headers, null, compress);

        expect(headers).to.have.property('Content-Encoding', compress);
      });
    });
  });
});
