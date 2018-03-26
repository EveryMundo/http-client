'require strict';

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

describe('promise-data-to', () => {
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

  describe('#promiseDataTo', () => {
    // eslint-disable-next-line one-var-declaration-per-line
    let httpRequest, httpEmitter, fakeEmitter;

    const
      http = require('http'),
      newEmitter = () => {
        const emitter = new (require('events').EventEmitter)();
        emitter.headers = {};
        return emitter;
      },
      newHttpEmitter = () => {
        const emitter = newEmitter();
        emitter.write = data => fakeEmitter.emit('data', Buffer.from(data));
        emitter.end = () => fakeEmitter.emit('end');

        return emitter;
      };

    beforeEach(() => {
      httpRequest = box.stub(http, 'request');
      fakeEmitter = newEmitter();
      httpEmitter = newHttpEmitter();

      fakeEmitter.setEncoding = noop;
    });

    const
      config = {
        http,
        host: 'localhost',
        port: 80,
        path: '/path',
        endpoint: 'http://localhost:80/path',
        headers: { Authorization: 'Authorization' },
      };

    it('should success when status is between 200 and 299', () => {
      const
        data = { a: 1, b: 2, c: 3 },
        expectedData = JSON.stringify(data);

      httpRequest.callsFake((options, callback) => {
        fakeEmitter.statusCode = 200;
        callback(fakeEmitter);

        return httpEmitter;
      });

      const { promiseDataTo } = loadLib();
      return promiseDataTo(config, data)
        .then((stats) => {
          expect(stats.code).to.equal(200);
          expect(stats).to.have.property('resTxt', expectedData);
          expect(stats).to.not.have.property('err');
        });
    });

    context('when process.env.SIMULATE is set', () => {
      beforeEach(() => {
        box.stub(process.env, 'SIMULATE').value('1');
      });

      it('should succeed', () => {
        const
          dataObject = { a: 1, b: 2, c: 3 },
          dataArray = [dataObject],
          dataString = JSON.stringify(dataArray),
          expectedData = '{"success":true,"data":[]}',
          invalidAttempt = NaN;

        httpRequest.callsFake((options, callback) => {
          callback(fakeEmitter);

          return httpEmitter;
        });

        const thenFunction = spy((stats) => {
          expect(stats.code).to.equal(222);
          expect(stats).to.have.property('resTxt', expectedData);
          expect(stats).to.have.property('start');
          expect(stats).to.have.property('end');
          expect(stats).to.not.have.property('err');
        });

        logr.debug('SIMULATE SHOULD SUCCEED', process.env.SIMULATE);
        const { promiseDataTo } = loadLib();
        logr.debug('DID SIMULATE SUCCEED?', process.env.SIMULATE);
        return promiseDataTo(config, dataObject)
          .then(thenFunction)
          .then(() => promiseDataTo(config, dataArray))
          .then(thenFunction)
          .then(() => promiseDataTo(config, dataString, invalidAttempt))
          .then(thenFunction)
          .then(() => {
            expect(thenFunction).to.have.property('calledThrice', true);
          });
      });
    });

    context('when status is is between 300 and 399', () => {
      beforeEach(() => {
      });

      it('should fail', () => {
        const
          data = [{ a: 1, b: 2, c: 3 }],
          expectedData = JSON.stringify(data);

        httpRequest.callsFake((options, callback) => {
          fakeEmitter.statusCode = 302;
          callback(fakeEmitter);

          return httpEmitter;
        });

        const { promiseDataTo } = loadLib();
        return promiseDataTo(config, data)
          .then((stats) => {
            expect(stats.code).to.equal(302);
            expect(stats).to.have.property('err');
            expect(stats).to.have.property('resTxt', expectedData);
          });
      });
    });

    context('when status >= 400', () => {
      beforeEach(() => {
        box.stub(process.env, 'MAX_RETRY_ATTEMPTS').value('1');
        box.stub(process.env, 'RETRY_TIMEOUT_MS').value('0');
      });

      it('should fail', (done) => {
        const
          data = { a: 1, b: 2 },
          expectedData = JSON.stringify(data);

        httpRequest.callsFake((options, callback) => {
          fakeEmitter.statusCode = 404;
          callback(fakeEmitter);

          return httpEmitter;
        });

        const { promiseDataTo } = loadLib();
        promiseDataTo(config, data)
          .catch((stats) => {
            expect(stats).to.have.property('err');
            expect(stats).to.have.property('resTxt', expectedData);
            expect(stats.code).to.equal(404);
            done();
          });
      });
    });

    context('when there is connection error', () => {
      beforeEach(() => {
        box.stub(process.env, 'MAX_RETRY_ATTEMPTS').value('2');
        box.stub(process.env, 'RETRY_TIMEOUT_MS').value('1');
      });

      it('Errors with a connection error', (done) => {
        const
          data = { a: 1, b: 2, c: 3 },
          expectedData = JSON.stringify(data);

        httpRequest.callsFake((options, callback) => {
          callback(fakeEmitter);
          httpEmitter = newHttpEmitter();
          httpEmitter.end = () => httpEmitter.emit('error', new Error('FakeError'));
          return httpEmitter;
        });

        const lib = cleanrequire('../lib/promise-data-to');
        expect(lib).to.have.property('MAX_RETRY_ATTEMPTS', 2);
        expect(lib).to.have.property('RETRY_TIMEOUT_MS', 1);

        const { promiseDataTo } = loadLib();
        promiseDataTo(config, data)
          .catch((stats) => {
            expect(stats).to.have.property('err');
            expect(stats).to.not.have.property('resTxt', expectedData);
            expect(stats.code).to.equal(599);
            done();
          });
      });
    });
  });

  context('when env vars don\'t have value', () => {
    beforeEach(() => {
      box.stub(process.env, 'MAX_RETRY_ATTEMPTS').value('');
      box.stub(process.env, 'RETRY_TIMEOUT_MS').value('');
    });

    it('should set the default values', () => {
      const lib = cleanrequire('../lib/promise-data-to');
      expect(lib).to.have.property('MAX_RETRY_ATTEMPTS', 3);
      expect(lib).to.have.property('RETRY_TIMEOUT_MS', 500);
    });
  });
});
