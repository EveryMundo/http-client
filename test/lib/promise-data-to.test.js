'require strict'

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */
const { EventEmitter } = require('node:events')
const http = require('node:http')
const zlib = require('node:zlib')
const sinon = require('sinon')
const { expect } = require('chai')

const { Endpoint } = require('../../classes/Endpoint.class.js')
const libSetHeaders = require('../../lib/set-headers.js')
const simulateLib = require('../../lib/simulate-response.js')
const config = require('../../lib/config.js')
const lib = require('../../lib/promise-data-to.js')

describe('lib/promise-data-to', () => {
  const noop = () => { }

  let box
  beforeEach(() => { box = sinon.createSandbox() })
  afterEach(() => { box.restore() })

  describe('#promiseDataTo', () => {
    // eslint-disable-next-line one-var-declaration-per-line
    let httpRequest, httpEmitter, httpResponse

    const newEmitter = () => {
      const emitter = new EventEmitter()
      emitter.headers = {}
      emitter.setEncoding = noop

      return emitter
    }

    const newHttpEmitter = (response) => {
      const emitter = newEmitter()

      emitter.response = response
      emitter.write = sinon.spy(data => response.emit('data', Buffer.from(data)))
      emitter.end = () => response.emit('end')
      emitter.abort = sinon.spy(() => response.emit('end'))

      return emitter
    }

    beforeEach(() => {
      httpRequest = box.stub(http, 'request')
      httpResponse = newEmitter()
      httpEmitter = newHttpEmitter(httpResponse)
    })

    /* const config = {
      http,
      host: 'localhost',
      port: 80,
      path: '/path',
      endpoint: 'http://localhost:80/path',
      headers: { Authorization: 'Authorization' }
    } */

    const endpoint = new Endpoint('http://Authorization@localhost:80/path')

    describe('When response is a simple statusCode 200', () => {
      beforeEach(() => {
        httpRequest.callsFake((options, callback) => {
          httpResponse.statusCode = 200
          callback(httpResponse)

          return httpEmitter
        })
      })

      describe('Calling setHeaders', () => {
        beforeEach(() => {
          box.stub(libSetHeaders, 'setHeaders')
        })

        it('should call setHeaders passing the correct arguments', async () => {
          const data = { a: 1, b: 2, c: 3 }
          const expectedData = zlib.gzipSync(JSON.stringify(data)).toString('base64')

          const customConfig = Endpoint.clone(endpoint)

          customConfig.http = http
          customConfig.compress = 'gzip'

          const expectedHeaders = {
            authorization: 'Authorization',
            'content-length': 52,
            'x-compression': 'gzip',
            'content-transfer-encoding': 'base64'
          }

          const res = await lib.promiseDataTo(customConfig, data)

          // expect(libSetHeaders.setHeaders).to.have.property('calledOnce', true)
          console.log(res.requestHeaders)
          expect(res.requestHeaders).to.deep.equal(expectedHeaders)
          expect(httpEmitter.write).to.have.property('calledOnce', true)
          expect(httpEmitter.write.args[0][0]).to.equal(expectedData)
        })
      })

      it('should have resTxt equal responseText', async () => {
        box.stub(console, 'warn')
        const res = await lib.promiseDataTo(Endpoint.clone(endpoint), {})

        expect(res).to.have.property('resTxt', res.responseText)
        expect(console.warn).to.have.property('calledOnce', true)
        expect(console.warn.args[0][0]).to.contain('DEPRECATION WARING!')
      })

      it('should throw an error when an endpoint is falsy', async () => {
        const error = await lib.promiseDataTo(null).catch(e => e)

        expect(error).to.be.instanceof(Error)
        expect(error.message).to.contain('EM: INVALID ENDPOINT')
      })

      it('should success when status is between 200 and 299 using http', async () => {
        const data = { a: 1, b: 2, c: 3 }

        const expectedData = JSON.stringify(data)
        const customConfig = Endpoint.clone(endpoint)
        customConfig.headers = undefined

        const stats = await lib.promiseDataTo(customConfig, data)

        expect(stats.code).to.equal(200)
        expect(stats).to.have.property('responseText', expectedData)
        expect(stats).to.have.property('err', undefined)
      })

      it('should success requesting endpoint as a string', () => {
        const data = { a: 1, b: 2, c: 3 }

        const expectedData = JSON.stringify(data)
        const expectedRequestHeaders = {
          'content-type': 'application/json',
          'content-length': 19,
          authorization: 'something'
        }

        const url = 'http://lala.com/something/else?a=10&b=20'
        const headers = { Authorization: 'something', 'content-type': 'application/json' }

        return lib.promiseDataTo(url, data, { headers })
          .then((response) => {
            expect(response.code).to.equal(200)
            expect(response).to.have.property('responseText', expectedData)
            expect(response).to.have.property('requestHeaders')
            expect(response.requestHeaders).to.deep.equal(expectedRequestHeaders)
            expect(response).to.have.property('err', undefined)
          })
      })

      it('should match responseText and responseText from response', () => {
        const data = { a: 1, b: 2, c: 3 }

        const expectedData = JSON.stringify(data)
        const url = 'http://lala.com/something/else?a=10&b=20'

        return lib.promiseDataTo(url, data, { headers: { Authorization: 'something' } })
          .then((response) => {
            expect(response.code).to.equal(200)
            expect(response).to.have.property('responseText', expectedData)
            expect(response).to.have.property('responseText', expectedData)
            expect(response).to.have.property('err', undefined)
          })
      })

      it('should match statusCode and code from response', () => {
        const data = { a: 1, b: 2, c: 3 }

        const expectedData = JSON.stringify(data)
        const url = 'http://lala.com/something/else?a=10&b=20'

        return lib.promiseDataTo(url, data, { headers: { Authorization: 'something' } })
          .then((response) => {
            expect(response.code).to.equal(200)
            expect(response).to.have.property('responseText', expectedData)
            expect(response).to.have.property('statusCode', 200)
            expect(response).to.have.property('err', undefined)
          })
      })

      it('should success when status is between 200 and 299 using protocol', () => {
        const data = { a: 1, b: 2, c: 3 }
        const expectedData = JSON.stringify(data)
        const protoConfig = Endpoint.clone(endpoint)

        return lib.promiseDataTo(protoConfig, data)
          .then((stats) => {
            expect(stats.code).to.equal(200)
            expect(stats).to.have.property('responseText', expectedData)
            expect(stats).to.have.property('err', undefined)
          })
      })

      it('should success when status is between 200 and 299 using protocol and query', () => {
        const data = { a: 1, b: 2, c: 3 }
        const expectedData = JSON.stringify(data)
        const protoConfig = Endpoint.clone(endpoint)
        protoConfig.protocol = 'http:'
        protoConfig.query = { name: 'Daniel', features: ['awesome', 'handsome'] }

        return lib.promiseDataTo(protoConfig, data)
          .then((stats) => {
            expect(stats.code).to.equal(200)
            expect(stats).to.have.property('responseText', expectedData)
            expect(stats).to.have.property('err', undefined)
          })
      })

      it('should success when status is between 200 and 299 using protocol and method=GET', () => {
        const protoConfig = Endpoint.clone(endpoint)
        protoConfig.method = 'GET'

        return lib.promiseDataTo(protoConfig)
          .then((stats) => {
            expect(stats.code).to.equal(200)
            expect(stats).to.have.property('responseText', '')
            expect(stats).to.have.property('err', undefined)
          })
      })
    })

    describe('READ compressed response', () => {
      const expected = JSON.stringify({ name: 'Daniel', awesome: true })

      it('should properly decompress response when content-encoding header is GZIP', async () => {
        httpEmitter.write = function write () {
          this.response.emit('data', zlib.gzipSync(expected))
        }

        httpRequest.callsFake((options, callback) => {
          httpResponse.statusCode = 200
          httpResponse.headers = { 'content-encoding': 'gzip' }
          callback(httpResponse)

          return httpEmitter
        })

        const stats = await lib.promiseDataTo(endpoint, {})

        expect(stats.code).to.equal(200)
        expect(stats).to.have.property('responseText', expected)
        expect(stats).to.have.property('err', undefined)
      })

      it('should properly decompress response when content-encoding header is DEFLATE', async () => {
        httpEmitter.write = function write () {
          this.response.emit('data', zlib.deflateSync(expected))
        }

        httpRequest.callsFake((options, callback) => {
          httpResponse.statusCode = 200
          httpResponse.headers = { 'content-encoding': 'deflate' }
          callback(httpResponse)

          return httpEmitter
        })

        const stats = await lib.promiseDataTo(endpoint, {})

        expect(stats.code).to.equal(200)
        expect(stats).to.have.property('responseText', expected)
        expect(stats).to.have.property('err', undefined)
      })

      it('should properly decompress response when content-encoding header is BR (brotli)', async () => {
        httpEmitter.write = function write () {
          this.response.emit('data', zlib.brotliCompressSync(expected))
        }

        httpRequest.callsFake((options, callback) => {
          httpResponse.statusCode = 200
          httpResponse.headers = { 'content-encoding': 'br' }
          callback(httpResponse)

          return httpEmitter
        })

        const stats = await lib.promiseDataTo(endpoint, {})

        expect(stats.code).to.equal(200)
        expect(stats).to.have.property('responseText', expected)
        expect(stats).to.have.property('err', undefined)
      })

      it('should properly decompress response when content-encoding header is BR (brotli)', async () => {
        httpEmitter.write = function write () {
          this.response.emit('data', zlib.brotliCompressSync(expected))
        }

        httpRequest.callsFake((options, callback) => {
          httpResponse.statusCode = 200
          httpResponse.headers = { 'content-encoding': 'br' }
          callback(httpResponse)

          return httpEmitter
        })

        const stats = await lib.promiseDataTo(endpoint, {})

        expect(stats.code).to.equal(200)
        expect(stats).to.have.property('responseText', expected)
        expect(stats).to.have.property('err', undefined)
      })

      it('should not decompress response when content-encoding header none of the expected', async () => {
        httpEmitter.write = function write () {
          this.response.emit('data', Buffer.from(expected))
        }

        httpRequest.callsFake((options, callback) => {
          httpResponse.statusCode = 200
          httpResponse.headers = { 'content-encoding': 'something-else' }
          callback(httpResponse)

          return httpEmitter
        })

        const stats = await lib.promiseDataTo(endpoint, {})

        expect(stats.code).to.equal(200)
        expect(stats).to.have.property('responseText', expected)
        expect(stats).to.have.property('err', undefined)
      })
    })

    it('should REJECT when status 2** and response GZIP throws and error', async () => {
      httpRequest.callsFake((options, callback) => {
        httpResponse.statusCode = 200
        httpResponse.headers = { 'content-encoding': 'gzip' }
        callback(httpResponse)

        return httpEmitter
      })

      const response = await lib.promiseDataTo(endpoint, 'something')
      const caller = () => response.responseText

      expect(caller).to.throw(Error, 'incorrect header check')
    })

    it('should reject when status is between 400', async () => {
      httpRequest.callsFake((options, callback) => {
        httpResponse.statusCode = 400
        callback(httpResponse)

        return httpEmitter
      })

      const error = await lib.promiseDataTo(endpoint, '').catch(e => e)

      expect(error).to.be.instanceof(Error)
      expect(error).to.have.property('message', '400 Status')
    })

    describe('when process.env.SIMULATE is set', () => {
      beforeEach(() => {
        box.stub(config, 'SIMULATE').value('1')
        box.stub(config, 'REQUEST_TIMEOUT_MS').value('1000')
        sinon.spy(simulateLib, 'simulatedResponse')
      })

      afterEach(() => { })

      it('should succeed', async () => {
        const dataObject = { a: 1, b: 2, c: 3 }
        const dataArray = [dataObject]
        const dataString = JSON.stringify(dataArray)
        // const expectedData = '{"success":true,"data":[]}'

        const invalidAttempt = NaN

        httpRequest.callsFake((options, callback) => {
          callback(httpResponse)

          return httpEmitter
        })

        const testStats = (stats) => {
          expect(stats.code).to.equal(222)
          // expect(stats).to.have.property('responseText', expectedData)
          expect(stats).to.have.property('start')
          expect(stats).to.have.property('end')
          expect(stats).to.have.property('err', undefined)
        }

        testStats(await lib.promiseDataTo(endpoint, dataObject))
        testStats(await lib.promiseDataTo(endpoint, dataArray))
        testStats(await lib.promiseDataTo(endpoint, dataString, invalidAttempt))

        expect(simulateLib.simulatedResponse).to.have.property('called', true)
        expect(simulateLib.simulatedResponse).to.have.property('calledThrice', true)
      })
    })

    describe('when status is is between 300 and 399', () => {
      // beforeEach(() => {})

      it('should fail', () => {
        const data = [{ a: 1, b: 2, c: 3 }]

        const expectedData = JSON.stringify(data)

        httpRequest.callsFake((options, callback) => {
          httpResponse.statusCode = 302
          callback(httpResponse)

          return httpEmitter
        })

        return lib.promiseDataTo(endpoint, data)
          .then((stats) => {
            expect(stats.code).to.equal(302)
            expect(stats).to.have.property('err')
            expect(stats).to.have.property('responseText', expectedData)
          })
      })
    })

    describe('when it times out', () => {
      let socket

      beforeEach(() => {
        socket = new EventEmitter()
        socket.setTimeout = () => socket.emit('timeout')
        httpEmitter.abort = sinon.spy()
        httpRequest.callsFake((options, callback) => {
          callback(httpResponse)

          return httpEmitter
        })
      })

      it('should fail', () => {
        const myEndpoint = Endpoint.clone(endpoint)
        myEndpoint.timeout = 1
        return lib.promiseDataTo(myEndpoint, {})
          .then(() => {
            httpEmitter.emit('socket', socket)
            expect(httpEmitter.abort).to.have.property('calledOnce', true)
          })
      })

      describe('when timeout is not a Number', () => {
        it('should throw an Error', async () => {
          const myEndpoint = Endpoint.clone(endpoint)
          myEndpoint.timeout = 'XX'

          return lib.promiseDataTo(myEndpoint, {})
            .then(() => { throw new Error('Not Expected Error') })
            .catch((error) => {
              expect(error).to.be.instanceof(Error)
              expect(error).to.have.property('message', `timeout param is not a number [${myEndpoint.timeout}]`)
            })
        })
      })
    })

    describe('when status >= 400', () => {
      beforeEach(() => {
        box.stub(config, 'MAX_RETRY_ATTEMPTS').value('1')
        box.stub(config, 'RETRY_TIMEOUT_MS').value('0')
      })

      it('should fail', (done) => {
        const data = { a: 1, b: 2 }

        const expectedData = JSON.stringify(data)

        httpRequest.callsFake((options, callback) => {
          httpResponse.statusCode = 404
          callback(httpResponse)

          return httpEmitter
        })

        // const { promiseDataTo } = loadLib()
        lib.promiseDataTo(endpoint, data)
          .catch((stats) => {
            expect(stats).to.have.property('err')
            expect(stats).to.have.property('responseText', expectedData)
            expect(stats.code).to.equal(404)
            done()
          })
      })
    })

    describe('when there is connection error', () => {
      beforeEach(() => {
        box.stub(config, 'MAX_RETRY_ATTEMPTS').value('2')
        box.stub(config, 'RETRY_TIMEOUT_MS').value('1')
      })

      it('Errors with a connection error', (done) => {
        const data = { a: 1, b: 2, c: 3 }
        const expectedData = JSON.stringify(data)

        httpRequest.callsFake((options, callback) => {
          callback(httpResponse)
          httpEmitter = newHttpEmitter(httpResponse)
          httpEmitter.end = () => httpEmitter.emit('error', new Error('FakeError'))
          return httpEmitter
        })

        expect(lib).to.have.property('MAX_RETRY_ATTEMPTS', '2')
        expect(lib).to.have.property('RETRY_TIMEOUT_MS', '1')

        // const { promiseDataTo } = loadLib()
        lib.promiseDataTo(endpoint, data)
          .catch((stats) => {
            expect(stats).to.have.property('err')
            expect(stats).to.not.have.property('responseText', expectedData)
            expect(stats.code).to.equal(599)
            done()
          })
      })
    })

    describe('when method is passed on the options object', () => {
      beforeEach(() => {
        httpRequest.callsFake((options, callback) => {
          httpResponse.statusCode = 200
          callback(httpResponse)

          return httpEmitter
        })
      })
      it('should success when status is between 200 and 299 using http', () => {
        const data = { a: 1, b: 2, c: 3 }

        const expectedData = JSON.stringify(data)
        // const { promiseDataTo } = loadLib()
        const customConfig = Endpoint.clone(endpoint)
        customConfig.headers = undefined
        const options = { method: 'PUT' }
        return lib.promiseDataTo(customConfig, data, options)
          .then((stats) => {
            expect(stats.method).to.equal('PUT')
            expect(stats.code).to.equal(200)
            expect(stats).to.have.property('responseText', expectedData)
            expect(stats).to.have.property('err', undefined)
          })
      })
    })
  })

  describe('when env vars don\'t have value', () => {
    it('should set the default values', () => {
      expect(lib).to.have.property('MAX_RETRY_ATTEMPTS', 3)
      expect(lib).to.have.property('RETRY_TIMEOUT_MS', 500)
    })
  })
})
