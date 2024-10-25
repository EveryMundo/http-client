'require strict'

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

describe('lib/url-to-endpoint', () => {
  const sinon = require('sinon')
  const { expect } = require('chai')
  // eslint-disable-next-line one-var-declaration-per-line
  let box
  const { urlToEndpoint } = require('../../index.js')
  const { Endpoint } = require('../../classes/Endpoint.class.js')

  beforeEach(() => {
    box = sinon.createSandbox()
  })

  afterEach(() => { box.restore() })

  describe('urlToEndpoint', () => {
    describe('when receiving and INVALID url =>', () => {
      it('show throw an error', () => {
        const caller = () => urlToEndpoint()

        expect(caller).to.throw(Error)
      })
    })

    describe('when receiving valid url =>', () => {
      describe('with no headers', () => {
        it('should return an object with an object type Endpoint', () => {
          const result = urlToEndpoint('http://test.com/some/path?a=100&b=200')

          expect(result).to.be.instanceof(Endpoint)
        })
      })

      describe('with no headers', () => {
        it('should return an object with an object type Endpoint', () => {
          const result = urlToEndpoint('http://user:pass@test.com/some/path', { 'content-type': 'text/plain' })

          expect(result).to.be.instanceof(Endpoint)
          expect(result.headers).to.be.instanceof(Map)
          expect(result.headers.get('content-type')).to.equal('text/plain')
        })
      })
    })
  })

  describe('when receiving and INVALID url =>', () => {
    describe('empty url', () => {
      it('show throw an error', () => {
        const caller = () => urlToEndpoint()

        expect(caller).to.throw(Error)
      })
    })

    /* describe('invalid protocol', () => {
        it('show throw an error', () => {
          const caller = () => urlToEndpoint('tcp://test.com')

          expect(caller).to.throw(Error)
        })
      }) */
  })

  describe('when receiving valid url =>', () => {
    const http = require('http')

    describe('valid simple http url and no headers', () => {
      it('should return an object with the expected properties', () => {
        const result = urlToEndpoint('http://test.com/some/path')

        const expected = {
          http,
          endpoint: 'http://test.com/some/path',
          host: 'test.com',
          path: '/some/path',
          port: '',
          search: '',
          compress: undefined
        }

        for (const key in expected) {
          if (expected[key] !== undefined) { expect(result).to.have.property(key, expected[key]) } else { expect(result).to.have.property(key) }
        }
      })
    })

    describe('http url with credentials and no headers', () => {
      it('should return an object with the expected properties', () => {
        const result = urlToEndpoint('http://Bearer:token@test.com/some/path')
        const expectedHeaders = {
          authorization: 'Bearer token'
        }

        const expected = {
          http,
          endpoint: 'http://test.com/some/path',
          host: 'test.com',
          path: '/some/path',
          port: '',
          search: '',
          compress: undefined
        }

        expect(result).to.have.property('headers')
        for (const [headerName, headerValue] of Object.entries(expectedHeaders)) {
          expect(result.headers.has(headerName)).to.be.true
          expect(result.headers.get(headerName)).to.equal(headerValue)
        }

        for (const key in expected) {
          if (expected[key] !== undefined) { expect(result).to.have.property(key, expected[key]) } else { expect(result).to.have.property(key) }
        }
      })
    })

    describe('http url with credentials AND with headers', () => {
      it('should return an object with the expected properties', () => {
        const headers = { 'content-type': 'application/xml' }
        const endpointUrl = 'http://Bearer:token@test.com/some/path'
        const expectedHeaders = {
          authorization: 'Bearer token',
          'content-type': 'application/xml'
        }

        const result = urlToEndpoint(endpointUrl, headers)

        const expected = {
          http,
          endpoint: 'http://test.com/some/path',
          host: 'test.com',
          path: '/some/path',
          port: '',
          search: '',
          compress: undefined
        }

        expect(result).to.have.property('headers')
        for (const [headerName, headerValue] of Object.entries(expectedHeaders)) {
          expect(result.headers.has(headerName)).to.be.true
          expect(result.headers.get(headerName)).to.equal(headerValue)
        }

        for (const key in expected) {
          if (expected[key] !== undefined) { expect(result).to.have.property(key, expected[key]) } else { expect(result).to.have.property(key) }
        }
      })
    })

    describe('http simple url with headers', () => {
      it('should return an object with the expected properties', () => {
        const headers = { 'content-type': 'application/xml' }
        const endpointUrl = 'http://test.com/some/path'
        const result = urlToEndpoint(endpointUrl, headers)

        const expected = {
          http,
          endpoint: 'http://test.com/some/path',
          host: 'test.com',
          path: '/some/path',
          port: '',
          search: '',
          compress: undefined
        }

        expect(result).to.have.property('headers')
        expect(result.headers).to.have.key('content-type')
        expect(result.headers.get('content-type')).to.equal(headers['content-type'])

        for (const key in expected) {
          if (expected[key] !== undefined) { expect(result).to.have.property(key, expected[key]) } else { expect(result).to.have.property(key) }
        }
      })

      describe('when content-encoding is passed as gzip', () => {
        it('should return compress as "gzip"', () => {
          const headers = { 'x-compression': 'gzip' }
          const endpointUrl = 'http://test.com/some/path'
          const result = urlToEndpoint(endpointUrl, headers)

          const expected = {
            http,
            endpoint: 'http://test.com/some/path',
            host: 'test.com',
            path: '/some/path',
            port: '',
            search: '',
            compress: 'gzip'
          }

          expect(result).to.have.property('headers')
          expect(result.headers).to.have.key('x-compression')
          expect(result.headers.get('x-compression')).to.equal('gzip')

          for (const key in expected) {
            if (expected[key] !== undefined) { expect(result).to.have.property(key, expected[key]) } else { expect(result).to.have.property(key) }
          }
        })
      })
    })

    describe('http simple url but INVALID headers', () => {
      it('should return an object with the expected properties', () => {
        const headers = ''
        const endpoint = 'http://test.com/some/path'
        const result = urlToEndpoint(endpoint, headers)

        const expected = {
          http,
          endpoint: 'http://test.com/some/path',
          headers: undefined,
          host: 'test.com',
          path: '/some/path',
          port: '',
          search: '',
          compress: undefined
        }

        for (const key in expected) {
          if (expected[key] !== undefined) { expect(result).to.have.property(key, expected[key]) } else { expect(result).to.have.property(key) }
        }
      })
    })
  })
})
