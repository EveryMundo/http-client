'require strict'

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

const sinon = require('sinon')
const { expect } = require('chai')
const http = require('http')

describe('classes/Endpoint', () => {
  const BasicEndpoint = require('../../classes/BasicEndpoint.class')
  const EMUrl = require('../../classes/EMUrl.class')

  // eslint-disable-next-line one-var-declaration-per-line
  let box
  beforeEach(() => { box = sinon.createSandbox() })
  afterEach(() => { box.restore() })

  describe('class Endpoint', () => {
    it('should be an instance of EMUrl', () => {
      const endpoint = new BasicEndpoint('http://test.com')

      expect(endpoint).to.be.instanceof(EMUrl)
    })

    it('should throw and error when endpoint is set to a non Object', () => {
      const caller = () => new BasicEndpoint('http://test.com', 100)

      expect(caller).to.throw(Error, 'headers must be an instance of Object')
    })

    const inputUrlString = 'https://test-url'
    const expectedUrlString = 'https://test-url/'

    it('should add a trailing slash to the url', () => {
      const endpoint = new BasicEndpoint(inputUrlString)

      expect(endpoint.toString()).to.equal(expectedUrlString)
    })

    it('should set an agent with default options if keep-alive is a header', () => {
      const headers = { 'keep-alive': '' }
      const endpoint = new BasicEndpoint(inputUrlString, headers)

      expect(endpoint.agent).to.be.instanceof(http.Agent)
      expect(endpoint.agent).to.have.property('keepAlive', true)
      expect(endpoint.agent).to.have.property('maxSockets', 50)
    })

    it('should set an agent with defined options when keep-alive is a header', () => {
      const max = 10
      const timeout = 5678
      const headers = { 'keep-alive': `max=${max},timeout=${timeout}` }
      const endpoint = new BasicEndpoint(inputUrlString, headers)

      expect(endpoint.agent).to.be.instanceof(http.Agent)
      expect(endpoint.agent).to.have.property('keepAlive', true)
      expect(endpoint.agent).to.have.property('maxSockets', 10)
    })
  })
})
