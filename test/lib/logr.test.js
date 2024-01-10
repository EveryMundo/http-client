'require strict'

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

const { expect } = require('chai')
const logr = require('../../lib/logr.js')

describe('lib/logr.js', () => {
  describe('mkLogr', async () => {
    it('should have the expected methods from console', () => {
      const myLogr = logr.mkLogr(console)
      expect(myLogr).to.have.property('mkLogr')

      const methods = ['trace', 'info', 'error', 'debug', 'warn']
      for (const method of methods) {
        expect(myLogr).to.have.property(method, console[method])
      }
    })
  })
})
