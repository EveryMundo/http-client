'require strict'

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

describe('lib/fetch.js', () => {
  const sinon = require('sinon')
  const { expect } = require('chai')
  // eslint-disable-next-line one-var-declaration-per-line
  let box

  const { Endpoint } = require('../../classes/Endpoint.class.js')
  const httpClient = require('../../lib/promise-data-to.js')

  beforeEach(() => {
    box = sinon.createSandbox()
  })

  afterEach(() => { box.restore() })

  describe('fetch', async () => {
    it('should call promiseDataTo with a method GET', async () => {
      box.stub(httpClient, 'promiseDataTo').callsFake(async (endpoint, data) => {
        expect(endpoint).to.have.property('method', 'GET')

        return {}
      })

      const res = await Endpoint.fetch('http://test.com')
      expect(res).to.deep.equal({})
    })

    it('should call promiseDataTo with a method POST', async () => {
      box.stub(httpClient, 'promiseDataTo').callsFake(async (endpoint, data) => {
        expect(endpoint).to.have.property('method', 'POST')

        return {}
      })

      const res = await Endpoint.fetch('http://test.com', { body: { some: 'Data' } })
      expect(res).to.deep.equal({})
    })

    it('should call promiseDataTo with a referrer header', async () => {
      const url = 'http://test.com/lala'

      box.stub(httpClient, 'promiseDataTo').callsFake(async (endpoint, data) => {
        expect(endpoint).to.have.property('method', 'GET')
        expect(endpoint).to.have.property('headers')
        expect(endpoint.headers).to.be.instanceof(Map)
        expect(endpoint.headers.get('referrer')).to.equal(url)

        return {}
      })

      const res = await Endpoint.fetch(url, { referrer: url })
      expect(res).to.deep.equal({})
    })

    // it('should have property method as POST', () => {
    //   const endpoint = new fetch('http://test.com')

    //   expect(endpoint).to.have.property('method', 'POST')
    // })
  })
})
