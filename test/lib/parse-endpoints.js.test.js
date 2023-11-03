'require strict'

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

describe('lib/parse-endpoints.js', () => {
  const http = require('http')
  const sinon = require('sinon')
  const { expect } = require('chai')

  const loadLib = () => require('../../lib/parse-endpoints.js')

  // eslint-disable-next-line one-var-declaration-per-line
  let box

  // const logr = require('@everymundo/simple-logr');

  if (!('MAIN_ENDPOINT' in process.env)) process.env.MAIN_ENDPOINT = ''
  if (!('MAIN_ENDPOINT_HEADERS' in process.env)) process.env.MAIN_ENDPOINT_HEADERS = ''

  beforeEach(() => {
    box = sinon.createSandbox()
    box.stub(process.env, 'MAIN_ENDPOINT').value('http://test.com/some/path')
  })

  afterEach(() => { box.restore() })

  describe('#parseKeepAlive', () => {
    it('should return an object with the expected properties', () => {
      const { parseKeepAlive } = require('../../lib/parse-keep-alive-header.js')

      const headers = { 'keep-alive': 'max=1000, timeout=1000' }
      const res = parseKeepAlive(headers['keep-alive'])
      const expected = { max: '1000', timeout: '1000' }

      expect(res).to.deep.equal(expected)
    })
  })

  describe('#parseKeepAliveHeader', () => {
    it('should return an object with the expected properties', () => {
      const { parseKeepAliveHeader } = require('../../lib/parse-keep-alive-header.js')

      const headers = { 'keep-alive': 'max=1000, timeout=1000' }
      const res = parseKeepAliveHeader(headers)
      const expected = { max: '1000', timeout: '1000' }

      expect(res).to.deep.equal(expected)
    })
  })

  context('parseEndpoints', () => {
    const { parseEndpoints } = loadLib()

    context('when receiving and INVALID url =>', () => {
      context('invalid protocol', () => {
        beforeEach(() => {
          box.stub(process.env, 'MAIN_ENDPOINT')
            .value('tcp://test.com/some/path')
        })

        it('show throw an error', () => {
          const caller = () => parseEndpoints()

          expect(caller).to.throw(Error, 'has an invalid endpoint')
        })
      })
    })

    context('when not receiving any argument =>', () => {
      beforeEach(() => {
        box.stub(process.env, 'MAIN_ENDPOINT').value('http://test.com/some/path')
      })

      it('should return an object with the expected properties', () => {
        const result = parseEndpoints()

        const expected = {
          MAIN: [{
            // http,
            // agent: undefined,
            endpoint: 'http://test.com/some/path',
            headers: { },
            host: 'test.com',
            path: '/some/path',
            port: '',
            compress: undefined
          }]
        }

        expect(result.MAIN[0].getObject()).to.deep.equal(expected.MAIN[0])
        expect(Object.keys(result)).to.deep.equal(Object.keys(expected))
      })
    })

    context('when receiving a regexp without grouping', () => {
      beforeEach(() => {
        box.stub(process.env, 'MAIN_ENDPOINT').value('http://test.com/some/path')
      })

      it('should return an object with the key being the whole variable name', () => {
        const result = parseEndpoints(/^MAIN_ENDPOINT$/)

        const expected = {
          MAIN_ENDPOINT: [{
            // http,
            // agent: undefined,
            endpoint: 'http://test.com/some/path',
            headers: {},
            host: 'test.com',
            path: '/some/path',
            port: '',
            compress: undefined
          }]
        }

        expect(result.MAIN_ENDPOINT[0].getObject()).to.deep.equal(expected.MAIN_ENDPOINT[0])
        expect(Object.keys(result)).to.deep.equal(Object.keys(expected))
      })
    })

    context('http url with credentials and no headers', () => {
      beforeEach(() => {
        box.stub(process.env, 'MAIN_ENDPOINT').value('http://Bearer:token@test.com/some/path')
      })

      it('should return an object with the expected properties', () => {
        const result = parseEndpoints()

        const expected = {
          MAIN: [{
            // http,
            // agent: undefined,
            endpoint: 'http://test.com/some/path',
            headers: {
              authorization: 'Bearer token'
            },
            host: 'test.com',
            path: '/some/path',
            port: '',
            compress: undefined
          }]
        }

        expect(result.MAIN[0].getObject()).to.deep.equal(expected.MAIN[0])
      })
    })

    context('http url with credentials AND with headers', () => {
      beforeEach(() => {
        box.stub(process.env, 'MAIN_ENDPOINT')
          .value('http://Bearer:token@test.com/some/path')
        box.stub(process.env, 'MAIN_ENDPOINT_HEADERS')
          .value('{"content-type":"application/xml","x-compression":"gzip"}')
      })

      it('should return an object with the expected properties', () => {
        const result = parseEndpoints()

        const expected = {
          MAIN: [{
            // http,
            // agent: undefined,
            endpoint: 'http://test.com/some/path',
            headers: {
              authorization: 'Bearer token',
              'content-type': 'application/xml',
              'x-compression': 'gzip'
            },
            host: 'test.com',
            path: '/some/path',
            port: '',
            compress: 'gzip'
          }]
        }

        expect(result.MAIN[0].getObject()).to.deep.equal(expected.MAIN[0])
      })
    })

    context('http url with keep-alive headers', () => {
      beforeEach(() => {
        if (!('KEEP_ENDPOINT' in process.env)) process.env.KEEP_ENDPOINT = undefined
        box.stub(process.env, 'KEEP_ENDPOINT')
          .value('http://Bearer:token@test.com/some/path')

        if (!('KEEP_ENDPOINT_HEADERS' in process.env)) process.env.KEEP_ENDPOINT_HEADERS = undefined
        box.stub(process.env, 'KEEP_ENDPOINT_HEADERS')
          .value('{"content-type":"application/xml","keep-alive":"max=100,timeout=1000"}')
      })

      it('should return an object with the expected properties', () => {
        const result = parseEndpoints(/^(KEEP)_ENDPOINT$/)

        const expected = {
          KEEP: [{
            // http,
            // agent: undefined,
            endpoint: 'http://test.com/some/path',
            headers: {
              authorization: 'Bearer token',
              connection: 'Keep-Alive',
              'content-type': 'application/xml',
              'keep-alive': 'max=100,timeout=1000'
            },
            host: 'test.com',
            path: '/some/path',
            port: '',
            compress: undefined
          }]
        }

        const { agent } = result.KEEP[0]
        result.KEEP[0].agent = undefined

        expect(result.KEEP[0].getObject()).to.deep.equal(expected.KEEP[0])

        expect(agent).to.be.instanceof(http.Agent)
        expect(agent.keepAlive).to.be.true
        expect(agent.maxSockets).to.equal(100)
        expect(agent.options.timeout).to.equal(1000)
      })
    })

    context('http url with keep-alive headers', () => {
      beforeEach(() => {
        if (!('KEEP_ENDPOINT' in process.env)) process.env.KEEP_ENDPOINT = undefined
        box.stub(process.env, 'KEEP_ENDPOINT')
          .value('http://Bearer:token@test.com/some/path')

        if (!('KEEP_ENDPOINT_HEADERS' in process.env)) process.env.KEEP_ENDPOINT_HEADERS = undefined
        box.stub(process.env, 'KEEP_ENDPOINT_HEADERS')
          .value('{"content-type":"application/xml","keep-alive":"true"}')
      })

      it('should return an object with the expected properties', () => {
        const result = parseEndpoints(/^(KEEP)_ENDPOINT$/)

        const expected = {
          // http,
          host: 'test.com',
          // agent: undefined,
          headers: {
            'content-type': 'application/xml',
            connection: 'Keep-Alive',
            'keep-alive': 'true',
            authorization: 'Bearer token'
          },
          port: '',
          path: '/some/path',
          endpoint: 'http://test.com/some/path',
          compress: undefined
        }

        const { agent } = result.KEEP[0]
        result.KEEP[0].agent = undefined

        // expect(JSON.stringify(result.KEEP[0])).to.equal(JSON.stringify(expected))
        expect(result.KEEP[0].getObject()).to.deep.equal(expected)
        // expect(result.KEEP[0]).to.deep.equal(expected)

        expect(agent).to.be.instanceof(http.Agent)
        expect(agent.keepAlive).to.be.true
        expect(agent.maxSockets).to.equal(50)
        expect(agent.options.timeout).to.be.undefined
      })
    })

    context('http simple url with headers', () => {
      beforeEach(() => {
        box.stub(process.env, 'MAIN_ENDPOINT')
          .value('http://test.com/some/path')
        box.stub(process.env, 'MAIN_ENDPOINT_HEADERS')
          .value('{"content-type":"application/xml"}')
      })

      it('should return an object with the expected properties', () => {
        const result = parseEndpoints()
        expect(result).to.have.property('MAIN')
        expect(result.MAIN).to.be.instanceof(Array)
        expect(result.MAIN).to.have.property('length', 1)

        const expected = {
          // http,
          // agent: undefined,
          endpoint: 'http://test.com/some/path',
          headers: {
            'content-type': 'application/xml'
          },
          host: 'test.com',
          path: '/some/path',
          port: '',
          compress: undefined
        }

        expect(result.MAIN[0].getObject()).to.deep.equal(expected)
      })
    })

    context('http simple url but INVALID headers', () => {
      beforeEach(() => {
        box.stub(process.env, 'MAIN_ENDPOINT')
          .value('http://test.com/some/path')
        box.stub(process.env, 'MAIN_ENDPOINT_HEADERS')
          .value('{not-a-valid-json-key:"application/xml"}')
      })

      it('should return an object with the expected properties', () => {
        const caller = () => parseEndpoints()

        expect(caller).to.throw(Error)
      })
    })

    context('Regexp too generic and matches multiple ENV Vars', () => {
      beforeEach(() => {
        box.stub(process.env, 'MAIN_ENDPOINT')
          .value('http://test.com/some/path')
        box.stub(process.env, 'MAIN_ENDPOINT_HEADERS')
          .value('{"content-type":"application/xml"}')
      })

      it('should return an object with the expected properties', () => {
        const caller = () => parseEndpoints(/MAIN/)

        expect(caller).to.throw(Error, 'present twice')
      })
    })
  })
})
