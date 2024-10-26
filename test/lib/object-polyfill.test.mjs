/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */
import { expect } from 'chai'

import objectPolyfill from '../../lib/object-polyfill.js'

describe('lib/fetch.js', () => {
  describe('objectPolyfill', async () => {
    it('should set the property fromEntries', async () => {
      const O = {}
      objectPolyfill(O)
      expect(O).to.have.property('fromEntries')
      expect(O.fromEntries).to.be.instanceof(Function)
    })

    it('should set not change the property fromEntries', async () => {
      const O = { fromEntries () { return Math.PI } }
      objectPolyfill(O)
      const res = O.fromEntries([['a', 1], ['b', 3]])
      expect(res).to.equal(Math.PI)
    })

    it('O.fromEntries should return an object', async () => {
      const O = {}
      objectPolyfill(O)
      const res = O.fromEntries([['a', 1], ['b', 3]])
      expect(res).to.deep.equal({ a: 1, b: 3 })
    })
  })
})
