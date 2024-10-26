/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */
import { expect } from 'chai'

import { Endpoint, PostEndpoint } from '../../classes/Endpoint.class.js'

describe('PostEndpoint', () => {
  describe('class PostEndpoint', () => {
    it('should be an instance of Endpoint', () => {
      const endpoint = new PostEndpoint('http://test.com')

      expect(endpoint).to.be.instanceof(Endpoint)
    })

    it('should have property method as POST', () => {
      const endpoint = new PostEndpoint('http://test.com')

      expect(endpoint).to.have.property('method', 'POST')
    })
  })
})
