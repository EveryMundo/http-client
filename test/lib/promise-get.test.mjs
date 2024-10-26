/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */
import sinon from 'sinon'
import { expect } from 'chai'

import urlHelper from '../../lib/parse-url.js'
import promiseDataToLib from '../../lib/promise-data-to.js'
import lib from '../../index.js'

describe('lib/promise-get.js', () => {
  // eslint-disable-next-line one-var-declaration-per-line
  let box

  beforeEach(() => { box = sinon.createSandbox() })
  afterEach(() => { box.restore() })

  describe('promiseGet', () => {
    beforeEach(() => {
      box.stub(promiseDataToLib, 'promiseDataTo').callsFake((...args) => Promise.resolve(args))
    })

    it('should call promiseDataTo', async () => {
      const config = urlHelper.parseUrl('http://password@test.com/somepath')

      await lib.promiseGet(config)

      expect(promiseDataToLib.promiseDataTo).to.have.property('calledOnce', true)
    })

    it('should return method GET', async () => {
      const config = urlHelper.parseUrl('http://test.com/somepath')
      // eslint-disable-next-line one-var-declaration-per-line

      const result = await lib.promiseGet(config)

      expect(result[2]).to.deep.equal({ method: 'GET' })
    })
  })
})
