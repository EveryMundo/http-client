'require strict'

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

import { createSandbox } from 'sinon'
import { expect } from 'chai'
import fileTotest from '../../lib/add-query-to-path.js'

describe('lib/addQueryToPath.js', () => {
  // eslint-disable-next-line one-var-declaration-per-line
  let box

  beforeEach(() => { box = createSandbox() })
  afterEach(() => { box.restore() })

  describe('#addQueryToPath', () => {
    const { addQueryToPath } = fileTotest

    describe('when query is empty', () => {
      it('should return inputPath', () => {
        const query = undefined
        const path = '/something'

        const result = addQueryToPath(query, path)

        expect(result).to.equal(path)
      })
    })

    describe('when query is an object', () => {
      it('should return the correct concatenated string', () => {
        const query = { var1: 'value1', var2: 'v2' }
        const path = '/something'
        const expected = `${path}?var1=value1&var2=v2`
        const result = addQueryToPath(query, path)

        expect(result).to.equal(expected)
      })
    })

    describe('when query is a string', () => {
      describe('that already includes ?', () => {
        it('should return the correct concatenated string', () => {
          const query = '?name=daniel&descr=awesome'
          const path = '/something'
          const expected = '/something?name=daniel&descr=awesome'
          const result = addQueryToPath(query, path)

          expect(result).to.equal(expected)
        })
      })

      describe('that DOES NOT include ?', () => {
        it('should return the correct concatenated string', () => {
          const query = 'name=daniel&descr=awesome'
          const path = '/something'
          const expected = '/something?name=daniel&descr=awesome'
          const result = addQueryToPath(query, path)

          expect(result).to.equal(expected)
        })
      })
    })

    describe('when path already includes the ?', () => {
      it('should return the correct concatenated string', () => {
        const query = '?name=daniel&descr=awesome'
        const path = '/something?crazy=true'
        const expected = '/something?crazy=true&name=daniel&descr=awesome'
        const result = addQueryToPath(query, path)

        expect(result).to.equal(expected)
      })
    })
  })
})
