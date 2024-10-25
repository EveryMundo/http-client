'require strict'

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */
const sinon = require('sinon')
const { expect } = require('chai')

const { parseUrl } = require('../../lib/parse-url.js')
const promiseDataToLib = require('../../lib/promise-data-to.js')
const lib = require('../../index.js')

describe('lib/promise-get.js', () => {
  // eslint-disable-next-line one-var-declaration-per-line
  let box

  beforeEach(() => { box = sinon.createSandbox() })
  afterEach(() => { box.restore() })

  context('promiseGet', () => {
    const promiseDataToLib = require('../../lib/promise-data-to')
    // const { promiseGet } = require('../lib/promise-get')
    const lib = require('../../index')

    beforeEach(() => {
      box.stub(promiseDataToLib, 'promiseDataTo').callsFake((...args) => Promise.resolve(args))
    })

    it('should call promiseDataTo', async () => {
      const config = parseUrl('http://password@test.com/somepath')

      await lib.promiseGet(config)

      expect(promiseDataToLib.promiseDataTo).to.have.property('calledOnce', true)
    })

    it('should return method GET', async () => {
      const config = parseUrl('http://test.com/somepath')
      // eslint-disable-next-line one-var-declaration-per-line

      const result = await lib.promiseGet(config)

      expect(result[2]).to.deep.equal({ method: 'GET' })
    })
  })
})
