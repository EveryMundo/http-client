'require strict'

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

describe('lib/url-to-endpoint', () => {
  const sinon = require('sinon')
  const { expect } = require('chai')
  // eslint-disable-next-line one-var-declaration-per-line
  let box
  const { urlToEndpoint } = require('../../lib/url-to-endpoint')
  const Endpoint = require('../../classes/Endpoint.class')

  beforeEach(() => {
    box = sinon.createSandbox()
  })

  afterEach(() => { box.restore() })

  context('urlToEndpoint', () => {
    context('when receiving and INVALID url =>', () => {
      it('show throw an error', () => {
        const caller = () => urlToEndpoint()

        expect(caller).to.throw(Error)
      })
    })

    context('when receiving valid url =>', () => {
      context('with no headers', () => {
        it('should return an object with an object type Endpoint', () => {
          const result = urlToEndpoint('http://test.com/some/path?a=100&b=200')

          expect(result).to.be.instanceof(Endpoint)
        })
      })

      context('with no headers', () => {
        it('should return an object with an object type Endpoint', () => {
          const result = urlToEndpoint('http://user:pass@test.com/some/path', { 'content-type': 'text/plain' })

          expect(result).to.be.instanceof(Endpoint)
          expect(result.headers).to.be.instanceof(Map)
          expect(result.headers.get('content-type')).to.equal('text/plain')
        })
      })
    })
  })
})
