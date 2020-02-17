'require strict'

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

describe('index.js', () => {
  // const sinon = require('sinon')
  const { expect } = require('chai')
  // eslint-disable-next-line one-var-declaration-per-line
  // let box

  const Endpoint = require('../../classes/Endpoint.class')
  const EMUrl = require('../../classes/EMUrl.class')

  // beforeEach(() => { box = sinon.createSandbox() })
  // afterEach(() => { box.restore() })

  describe('class PostEndpoint', () => {
    it('should be an instance of Endpoint', () => {
      const endpoint = new Endpoint('http://test.com')

      expect(endpoint).to.be.instanceof(EMUrl)
    })

    it('should throw and error when endpoint is set to a non Object', () => {
      const caller = () => new Endpoint('http://test.com', 100)

      expect(caller).to.throw(Error)
    })
  })
})
