'require strict'

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

describe('index.js', () => {
  const sinon = require('sinon')
  const { expect } = require('chai')
  const logr = require('@everymundo/simple-logr')
  // { clone }    = require('@everymundo/simple-clone'),
  // cleanrequire = require('@everymundo/cleanrequire'),

  const loadLib = () => require('../lib/url-to-endpoint')

  const noop = () => { }

  // eslint-disable-next-line one-var-declaration-per-line
  let box

  beforeEach(() => {
    box = sinon.createSandbox();
    ['log', 'info', /* 'debug',  */'error']
      .forEach(method => box.stub(logr, method).callsFake(noop))
  })

  afterEach(() => { box.restore() })

  context('urlToEndpoint', () => {
    const { urlToEndpoint } = loadLib()

    context('when receiving and INVALID url =>', () => {
      context('empty url', () => {
        it('show throw an error', () => {
          const caller = () => urlToEndpoint()

          expect(caller).to.throw(Error)
        })
      })

      context('invalid protocol', () => {
        it('show throw an error', () => {
          const caller = () => urlToEndpoint('tcp://test.com')

          expect(caller).to.throw(Error)
        })
      })
    })

    context('when receiving valid url =>', () => {
      const http = require('http')

      context('valid simple http url and no headers', () => {
        it('should return an object with the expected properties', () => {
          const result = urlToEndpoint('http://test.com/some/path')

          const expected = {
            http,
            endpoint: 'http://test.com/some/path',
            headers: { },
            host: 'test.com',
            path: '/some/path',
            port: null,
            search: null
          }

          expect(result).to.deep.equal(expected)
        })
      })

      context('http url with credentials and no headers', () => {
        it('should return an object with the expected properties', () => {
          const result = urlToEndpoint('http://Bearer:token@test.com/some/path')

          const expected = {
            http,
            endpoint: 'http://test.com/some/path',
            headers: {
              Authorization: 'Bearer token'
            },
            host: 'test.com',
            path: '/some/path',
            port: null,
            search: null
          }

          expect(result).to.deep.equal(expected)
        })
      })

      context('http url with credentials AND with headers', () => {
        it('should return an object with the expected properties', () => {
          const headers = { 'content-type': 'application/xml' }
          const endpointUrl = 'http://Bearer:token@test.com/some/path'
          const result = urlToEndpoint(endpointUrl, headers)

          const expected = {
            http,
            endpoint: 'http://test.com/some/path',
            headers: {
              Authorization: 'Bearer token',
              'content-type': 'application/xml'
            },
            host: 'test.com',
            path: '/some/path',
            port: null,
            search: null
          }

          expect(result).to.deep.equal(expected)
        })
      })

      context('http simple url with headers', () => {
        it('should return an object with the expected properties', () => {
          const headers = { 'content-type': 'application/xml' }
          const endpointUrl = 'http://test.com/some/path'
          const result = urlToEndpoint(endpointUrl, headers)

          const expected = {
            http,
            endpoint: 'http://test.com/some/path',
            headers: {
              'content-type': 'application/xml'
            },
            host: 'test.com',
            path: '/some/path',
            port: null,
            search: null
          }

          expect(result).to.deep.equal(expected)
        })
      })

      context('http simple url but INVALID headers', () => {
        it('should return an object with the expected properties', () => {
          const headers = ''
          const endpointUrl = 'http://test.com/some/path'
          const result = urlToEndpoint(endpointUrl, headers)

          const expected = {
            http,
            endpoint: 'http://test.com/some/path',
            headers: {},
            host: 'test.com',
            path: '/some/path',
            port: null,
            search: null
          }

          expect(result).to.deep.equal(expected)
        })
      })
    })
  })
})
