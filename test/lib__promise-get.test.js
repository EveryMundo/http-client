'require strict'

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

describe('index.js', () => {
  const { parseUrl } = require('../lib/parse-url')
  const sinon = require('sinon')
  const { expect } = require('chai')
  // const { clone }    = require('@everymundo/simple-clone')
  const cleanrequire = require('@everymundo/cleanrequire')
  const logr = require('@everymundo/simple-logr')

  const loadLib = () => cleanrequire('../lib/promise-get')

  const noop = () => { }

  // eslint-disable-next-line one-var-declaration-per-line
  let box

  beforeEach(() => {
    box = sinon.createSandbox();
    ['log', 'info', /* 'debug',  */'error']
      .forEach(method => box.stub(logr, method).callsFake(noop))
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

      const config = parseUrl('http://user@test.com/somepath')
      config.auth // Forcing get auth to get 100% coverage
      return promiseGet(config)
        .then(() => {
          expect(promiseDataToLib.promiseDataTo).to.have.property('calledOnce', true)
        })
    })

    it('should call promiseDataTo', () => {
      const { promiseGet } = loadLib()

      const config = parseUrl('http://test.com/somepath')
      // eslint-disable-next-line one-var-declaration-per-line
      let protocol, http, host, port, query, path, endpoint, headers, agent, maxRetry
      const expected = { protocol, http, host, port, query, path, endpoint, headers, agent, maxRetry, method: 'GET' }

      Object.keys(config).forEach((key) => {
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
