'require strict'

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

describe('index.js', () => {
  const { parseUrl } = require('../lib/parse-url')
  const sinon = require('sinon')
  const { expect } = require('chai')
  const cleanrequire = require('@everymundo/cleanrequire')

  const loadLib = () => cleanrequire('../lib/promise-get')

  // eslint-disable-next-line one-var-declaration-per-line
  let box

  beforeEach(() => {
    box = sinon.createSandbox()
    // ['log', 'info', /* 'debug',  */'error']
    //   .forEach(method => box.stub(logr, method).callsFake(noop))
  })

  afterEach(() => { box.restore() })

  context('promiseGet', () => {
    let promiseDataToLib

    beforeEach(() => {
      promiseDataToLib = cleanrequire('../lib/promise-data-to')
      box.stub(promiseDataToLib, 'promiseDataTo').callsFake(arg => Promise.resolve(arg))
    })

    it('should call promiseDataTo', () => {
      const { promiseGet } = loadLib()

      const config = parseUrl('http://password@test.com/somepath')

      return promiseGet(config)
        .then(() => {
          expect(promiseDataToLib.promiseDataTo).to.have.property('calledOnce', true)
        })
    })

    it('should call promiseDataTo', () => {
      const { promiseGet } = require('../lib/promise-get')

      const config = parseUrl('http://test.com/somepath')
      // eslint-disable-next-line one-var-declaration-per-line
      let protocol, http, host, port, query, path, endpoint, headers, agent, maxRetry
      const expected = { protocol, http, host, port, query, path, endpoint, headers, agent, maxRetry, method: 'GET' }

      Object.keys(expected).forEach((key) => {
        if (key in expected) expected[key] = config[key]
      })

      return promiseGet(config)
        .then((arg) => {
          expected.method = 'GET'

          expect(arg).to.deep.equal(expected)
        })
    })
  })
})
