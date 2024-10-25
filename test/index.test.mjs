/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

import sinon from 'sinon'
import { expect } from 'chai'
import lib from '../index.js'
import httpClient from '../lib/promise-data-to.js'

describe('index.js', () => {
  // eslint-disable-next-line one-var-declaration-per-line
  let box

  beforeEach(() => { box = sinon.createSandbox() })
  afterEach(() => { box.restore() })

  describe('exported keys and types', () => {
    const expected = {
      Endpoint: Function,
      GetEndpoint: Function,
      PostEndpoint: Function,
      Headers: Function,
      Response: Function,
      fetch: Function,
      promiseDataTo: Function,
      promisePost: Function,
      parseEndpoints: Function,
      urlToEndpoint: Function,
      promiseGet: Function,
      get: Function,
      post: Function,
      patch: Function,
      put: Function,
      head: Function,
      delete: Function
    }

    it('should export the expected keys', () => {
      const expectedKeys = Object.keys(expected).sort()
      const libKeys = Object.keys(lib).sort()

      expect(libKeys).to.deep.equal(expectedKeys)

      for (const key of expectedKeys) {
        expect(lib).to.have.property(key)
        expect(lib[key]).to.be.instanceof(expected[key])
      }
    })

    describe('httpMethods', () => {
      beforeEach(() => { box.stub(httpClient, 'promiseDataTo') })

      describe('#head', () => {
        it('should equal Endpoint.head', () => {
          expect(lib.head).to.equal(lib.Endpoint.head)
        })
      })

      describe('#patch', () => {
        it('should equal Endpoint.patch', () => {
          expect(lib.patch).to.equal(lib.Endpoint.patch)
        })
      })

      describe('#put', () => {
        it('should equal Endpoint.put', () => {
          expect(lib.put).to.equal(lib.Endpoint.put)
        })
      })

      describe('#delete', () => {
        it('should equal Endpoint.delete', () => {
          expect(lib.delete).to.equal(lib.Endpoint.delete)
        })
      })

      describe('#post', () => {
        it('should equal Endpoint.post', () => {
          expect(lib.post).to.equal(lib.Endpoint.post)
        })
      })

      describe('#get', () => {
        it('should equal Endpoint.get', () => {
          expect(lib.get).to.equal(lib.Endpoint.get)
        })
      })

      describe('#get', () => {
        it('should equal Endpoint.get', () => {
          expect(lib.get).to.equal(lib.Endpoint.get)
        })
      })
    })
  })
})
