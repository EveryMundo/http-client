/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */
import { expect } from 'chai'

import { Endpoint, GetEndpoint } from '../../classes/Endpoint.class.js'

describe('GetEndpoint', () => {
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
