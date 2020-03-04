'require strict'

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

describe('promise-data-to', () => {
  const sinon = require('sinon')
  const { spy } = require('sinon')
  const { expect } = require('chai')
  const { clone } = require('@everymundo/simple-clone')
  const cleanrequire = require('@everymundo/cleanrequire')
  const loadLib = () => cleanrequire('../lib/promise-data-to')

  const noop = () => { }

  // eslint-disable-next-line one-var-declaration-per-line
  let box

  const logr = require('@everymundo/simple-logr')
  const zlib = require('zlib')

  beforeEach(() => {
    box = sinon.createSandbox();
    ['log', 'info', /* 'debug',  */'error']
      .forEach(method => box.stub(logr, method).callsFake(noop))
  })

  afterEach(() => { box.restore() })

  describe('#promiseDataTo', () => {
    // eslint-disable-next-line one-var-declaration-per-line
    let httpRequest, httpEmitter, httpResponse

    const http = require('http')
    const { EventEmitter } = require('events')

    const newEmitter = () => {
      const emitter = new EventEmitter()
      emitter.headers = {}
      emitter.setEncoding = noop

      return emitter
    }

    const newHttpEmitter = (response) => {
      const emitter = newEmitter()

      emitter.response = response
      emitter.write = data => response.emit('data', Buffer.from(data))
      emitter.end = () => response.emit('end')

      return emitter
    }

    beforeEach(() => {
      httpRequest = box.stub(http, 'request')
      httpResponse = newEmitter()
      httpEmitter = newHttpEmitter(httpResponse)
    })

    const config = {
      http,
      host: 'localhost',
      port: 80,
      path: '/path',
      endpoint: 'http://localhost:80/path',
      headers: { Authorization: 'Authorization' }
    }

    context('Calling setHeaders', () => {
      const libSetHeaders = cleanrequire('../lib/set-headers.js')

      beforeEach(() => {
        box.stub(libSetHeaders, 'setHeaders')
      })

      it('should call setHeaders passing the correct arguments', () => {
        const { setHeaders } = libSetHeaders
        const data = { a: 1, b: 2, c: 3 }
        const expectedData = require('zlib').gzipSync(JSON.stringify(data))

        httpRequest.callsFake((options, callback) => {
          httpResponse.statusCode = 200
          callback(httpResponse)

          return httpEmitter
        })

        const { promiseDataTo } = loadLib()
        const customConfig = clone(config)
        const { headers } = customConfig

        customConfig.http = http
        customConfig.compress = 'gzip'

        return promiseDataTo(customConfig, data)
          .then(() => {
            expect(setHeaders).to.have.property('calledOnce', true)
            // expect(libSetHeaders.setHeaders.calledWith(headers, expectedData, 'gzip')).to.be.true;
            sinon.assert.calledWith(setHeaders, headers, expectedData, 'gzip')
            // expect(.calledWith(headers, expectedData, 'gzip')).to.be.true;
          })
      })
    })

    it('should success when status is between 200 and 299 using http', () => {
      const data = { a: 1, b: 2, c: 3 }

      const expectedData = JSON.stringify(data)

      httpRequest.callsFake((options, callback) => {
        httpResponse.statusCode = 200
        callback(httpResponse)

        return httpEmitter
      })

      const { promiseDataTo } = loadLib()
      const customConfig = { ...config, headers: undefined }
      return promiseDataTo(customConfig, data)
        .then((stats) => {
          expect(stats.code).to.equal(200)
          expect(stats).to.have.property('resTxt', expectedData)
          expect(stats).to.not.have.property('err')
        })
    })

    it('should success when status is between 200 and 299 using protocol', () => {
      const
        data = { a: 1, b: 2, c: 3 }

      const expectedData = JSON.stringify(data)

      httpRequest.callsFake((options, callback) => {
        httpResponse.statusCode = 200
        callback(httpResponse)
        return httpEmitter
      })

      const { promiseDataTo } = loadLib()
      const protoConfig = clone(config)
      delete protoConfig.http
      protoConfig.protocol = 'http:'

      return promiseDataTo(protoConfig, data)
        .then((stats) => {
          expect(stats.code).to.equal(200)
          expect(stats).to.have.property('resTxt', expectedData)
          expect(stats).to.not.have.property('err')
        })
    })

    it('should success when status is between 200 and 299 using protocol and query', () => {
      const
        data = { a: 1, b: 2, c: 3 }

      const expectedData = JSON.stringify(data)

      httpRequest.callsFake((options, callback) => {
        httpResponse.statusCode = 200
        callback(httpResponse)

        return httpEmitter
      })

      const { promiseDataTo } = loadLib()
      const protoConfig = clone(config)
      delete protoConfig.http
      protoConfig.protocol = 'http:'
      protoConfig.query = { name: 'Daniel', features: ['awesome', 'handsome'] }

      return promiseDataTo(protoConfig, data)
        .then((stats) => {
          expect(stats.code).to.equal(200)
          expect(stats).to.have.property('resTxt', expectedData)
          expect(stats).to.not.have.property('err')
        })
    })

    it('should success when status is between 200 and 299 using protocol and method=GET', () => {
      httpRequest.callsFake((options, callback) => {
        httpResponse.statusCode = 200
        callback(httpResponse)

        return httpEmitter
      })

      const { promiseDataTo } = loadLib()
      const protoConfig = clone(config)
      delete protoConfig.http
      protoConfig.protocol = 'http:'
      protoConfig.method = 'GET'

      return promiseDataTo(protoConfig)
        .then((stats) => {
          expect(stats.code).to.equal(200)
          expect(stats).to.have.property('resTxt', '')
          expect(stats).to.not.have.property('err')
        })
    })

    it('should success when status is between 200 and 299 and response is GZIP', () => {
      const expected = JSON.stringify({ name: 'Daniel', awesome: true })

      httpEmitter.write = function write () {
        this.response.emit('data', zlib.gzipSync(expected))
      }

      httpRequest.callsFake((options, callback) => {
        httpResponse.statusCode = 200
        httpResponse.headers = { 'content-encoding': 'gzip' }
        callback(httpResponse)

        return httpEmitter
      })

      const { promiseDataTo } = loadLib()

      return promiseDataTo(config, {})
        .then((stats) => {
          expect(stats.code).to.equal(200)
          expect(stats).to.have.property('resTxt', expected)
          expect(stats).to.not.have.property('err')
        })
    })

    it('should REJECT when status 2** and response GZIP throws and error', () => {
      httpRequest.callsFake((options, callback) => {
        httpResponse.statusCode = 200
        httpResponse.headers = { 'content-encoding': 'gzip' }
        callback(httpResponse)

        return httpEmitter
      })

      const { promiseDataTo } = loadLib()

      const secret = Math.random()

      return promiseDataTo(config, 'something')
        .catch((error) => {
          expect(error).to.be.instanceof(Error)
          expect(error).to.have.property('message', 'incorrect header check')

          return secret
        })
        .then(res => expect(res).to.equal(secret, 'It did not reject'))
    })

    it('should reject when status is between 400', () => {
      httpRequest.callsFake((options, callback) => {
        httpResponse.statusCode = 400
        callback(httpResponse)

        return httpEmitter
      })

      const { promiseDataTo } = loadLib()

      const secret = Math.random()

      return promiseDataTo(config, '')
        .catch((error) => {
          expect(error).to.be.instanceof(Error)
          expect(error).to.have.property('message', '400 Status')

          return secret
        })
        .then(res => expect(res).to.equal(secret, 'It did not reject'))
    })

    context('when process.env.SIMULATE is set', () => {
      const simulateLib = require('../lib/simulate-response')

      beforeEach(() => {
        box.stub(process.env, 'SIMULATE').value('1')
        spy(simulateLib, 'simulatedResponse')
      })

      afterEach(() => { })

      it('should succeed', () => {
        const
          dataObject = { a: 1, b: 2, c: 3 }

        const dataArray = [dataObject]

        const dataString = JSON.stringify(dataArray)

        const expectedData = '{"success":true,"data":[]}'

        const invalidAttempt = NaN

        httpRequest.callsFake((options, callback) => {
          callback(httpResponse)

          return httpEmitter
        })

        const thenFunction = spy((stats) => {
          expect(stats.code).to.equal(222)
          expect(stats).to.have.property('resTxt', expectedData)
          expect(stats).to.have.property('start')
          expect(stats).to.have.property('end')
          expect(stats).to.not.have.property('err')
        })

        const { promiseDataTo } = loadLib()

        return promiseDataTo(config, dataObject)
          .then(thenFunction)
          .then(() => promiseDataTo(config, dataArray))
          .then(thenFunction)
          .then(() => promiseDataTo(config, dataString, invalidAttempt))
          .then(thenFunction)
          .then(() => {
            expect(thenFunction).to.have.property('calledThrice', true)
            expect(simulateLib.simulatedResponse).to.have.property('calledThrice', true)
          })
      })
    })

    context('when status is is between 300 and 399', () => {
      beforeEach(() => {
      })

      it('should fail', () => {
        const
          data = [{ a: 1, b: 2, c: 3 }]

        const expectedData = JSON.stringify(data)

        httpRequest.callsFake((options, callback) => {
          httpResponse.statusCode = 302
          callback(httpResponse)

          return httpEmitter
        })

        const { promiseDataTo } = loadLib()
        return promiseDataTo(config, data)
          .then((stats) => {
            expect(stats.code).to.equal(302)
            expect(stats).to.have.property('err')
            expect(stats).to.have.property('resTxt', expectedData)
          })
      })
    })

    context('when status >= 400', () => {
      beforeEach(() => {
        box.stub(process.env, 'MAX_RETRY_ATTEMPTS').value('1')
        box.stub(process.env, 'RETRY_TIMEOUT_MS').value(null)
      })

      it('should fail', (done) => {
        const
          data = { a: 1, b: 2 }

        const expectedData = JSON.stringify(data)

        httpRequest.callsFake((options, callback) => {
          httpResponse.statusCode = 404
          callback(httpResponse)

          return httpEmitter
        })

        const { promiseDataTo } = loadLib()
        promiseDataTo(config, data)
          .catch((stats) => {
            expect(stats).to.have.property('err')
            expect(stats).to.have.property('resTxt', expectedData)
            expect(stats.code).to.equal(404)
            done()
          })
      })
    })

    context('when times out', () => {
      beforeEach(() => {
        box.stub(process.env, 'MAX_RETRY_ATTEMPTS').value('1')
        box.stub(process.env, 'RETRY_TIMEOUT_MS').value('1')
      })

      it('should fail', () => {
        const socket = new EventEmitter()
        socket.setTimeout = (timeMS) => socket.emit('timeout')
        httpEmitter.abort = sinon.spy()
        httpRequest.callsFake((options, callback) => {
          callback(httpResponse)
          return httpEmitter
        })
        const { promiseDataTo } = loadLib()
        promiseDataTo(config, {})
          .then(res => {
            httpEmitter.emit('socket', socket)
            expect(httpRequest.abort).to.have.property('calledOnce', true)
          })
      })
    })

    context('when there is connection error', () => {
      beforeEach(() => {
        box.stub(process.env, 'MAX_RETRY_ATTEMPTS').value('2')
        box.stub(process.env, 'RETRY_TIMEOUT_MS').value('1')
      })

      it('Errors with a connection error', (done) => {
        const
          data = { a: 1, b: 2, c: 3 }

        const expectedData = JSON.stringify(data)

        httpRequest.callsFake((options, callback) => {
          callback(httpResponse)
          httpEmitter = newHttpEmitter(httpResponse)
          httpEmitter.end = () => httpEmitter.emit('error', new Error('FakeError'))
          return httpEmitter
        })

        const lib = cleanrequire('../lib/promise-data-to')
        expect(lib).to.have.property('MAX_RETRY_ATTEMPTS', 2)
        expect(lib).to.have.property('RETRY_TIMEOUT_MS', 1)

        const { promiseDataTo } = loadLib()
        promiseDataTo(config, data)
          .catch((stats) => {
            expect(stats).to.have.property('err')
            expect(stats).to.not.have.property('resTxt', expectedData)
            expect(stats.code).to.equal(599)
            done()
          })
      })
    })
  })

  context('when env vars don\'t have value', () => {
    beforeEach(() => {
      delete process.env.RETRY_TIMEOUT_MS
      delete process.env.MAX_RETRY_ATTEMPTS
    })

    it('should set the default values', () => {
      const lib = cleanrequire('../lib/promise-data-to')
      expect(lib).to.have.property('MAX_RETRY_ATTEMPTS', 3)
      expect(lib).to.have.property('RETRY_TIMEOUT_MS', undefined)
    })
  })
})
