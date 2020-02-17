'require strict'

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

describe('index.js', () => {
  // const sinon = require('sinon')
  const { expect } = require('chai')
  // eslint-disable-next-line one-var-declaration-per-line
  // let box

  const GetEndpoint = require('../../classes/GetEndpoint.class')
  const Endpoint = require('../../classes/Endpoint.class')

  // beforeEach(() => { box = sinon.createSandbox() })
  // afterEach(() => { box.restore() })

  describe('class GetEndpoint', () => {
    it('should be an instance of Endpoint', () => {
      const endpoint = new GetEndpoint('http://test.com')

      expect(endpoint).to.be.instanceof(Endpoint)
    })

    it('should have property method as GET', () => {
      const endpoint = new GetEndpoint('http://test.com')

      expect(endpoint).to.have.property('method', 'GET')
    })
  })
})
