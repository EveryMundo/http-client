'require strict'

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

describe('lib/get-data-from-xdata.js', () => {
  const zlib = require('zlib')
  const sinon = require('sinon')
  const { expect } = require('chai')

  const loadLib = () => require('../lib/get-data-from-xdata')

  // eslint-disable-next-line one-var-declaration-per-line
  let box

  beforeEach(() => { box = sinon.createSandbox() })
  afterEach(() => { box.restore() })

  describe('#getDataFromXData', () => {
    const { getDataFromXData } = loadLib()

    context('Without Compression', () => {
      context('when the input data is a String', () => {
        it('should return the exact same string', () => {
          const input = 'simple string'

          const result = getDataFromXData(input)

          expect(result).to.equal(input)
        })
      })

      context('when the input data is an Array', () => {
        it('should return a json representation of it', () => {
          const input = [1, 2, 3, 4]
          const expected = JSON.stringify(input)
          const result = getDataFromXData(input)

          expect(result).to.equal(expected)
        })
      })

      context('when the input data is a plain Object', () => {
        it('should return a json representation of it', () => {
          const input = { a: 1, b: 2, c: 3, d: 4 }
          const expected = JSON.stringify(input)
          const result = getDataFromXData(input)

          expect(result).to.equal(expected)
        })
      })

      context('when the input data is a Buffer', () => {
        it('should return the very same Buffer', () => {
          const input = Buffer.from('{ a: 1, b: 2, c: 3, d: 4 }')
          const result = getDataFromXData(input)

          expect(result).to.equal(input)
        })
      })
    });

    ['gzip', 'deflate'].forEach((compress) => {
      context(`WITH ${compress} Compression`, () => {
        context('when the input data is a String', () => {
          it('should return the GZIPPED version of the given string', () => {
            const input = 'simple string'
            const expected = zlib[`${compress}Sync`](input).toString('base64')

            const result = getDataFromXData(input, compress)

            expect(result).to.equal(expected)
          })
        })

        context('when the input data is an Array', () => {
          it('should return the GZIPPED version of the json representation of it', () => {
            const input = [1, 2, 3, 4]
            const expected = zlib[`${compress}Sync`](JSON.stringify(input)).toString('base64')

            const result = getDataFromXData(input, compress)

            expect(result).to.equal(expected)
          })
        })

        context('when the input data is a plain Object', () => {
          it('should return the GZIPPED version of the json representation of it', () => {
            const input = { a: 1, b: 2, c: 3, d: 4 }
            const expected = zlib[`${compress}Sync`](JSON.stringify(input)).toString('base64')

            const result = getDataFromXData(input, compress)

            expect(result).to.equal(expected)
          })
        })

        context('when the input data is a Buffer', () => {
          it('should return the very same Buffer', () => {
            const input = Buffer.from('{ a: 1, b: 2, c: 3, d: 4 }')
            const expected = zlib[`${compress}Sync`](input).toString('base64')

            const result = getDataFromXData(input, compress)

            expect(result).to.equal(expected)
          })
        })
      })
    })
  })
})
