'require strict'

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

describe('lib/simulatedResponse.js', () => {
  const sinon = require('sinon')

  const { expect } = require('chai')

  const logr = require('@everymundo/simple-logr')

  // cleanrequire = require('@everymundo/cleanrequire'),

  const noop = () => { }

  const loadLib = () => require('../lib/simulate-response')
  // eslint-disable-next-line one-var-declaration-per-line
  let box

  beforeEach(() => {
    box = sinon.createSandbox()
    box.stub(logr, 'info').callsFake(noop)
  })

  afterEach(() => { box.restore() })

  describe('#simulatedResponse', () => {
    const { simulatedResponse } = loadLib()

    context('when calle with an array', () => {
      it('should return the expected object with code 222', () => {
        const start = new Date()
        const endpoint = 'http://test.com'
        const data = [{ name: 'Daniel' }, { name: 'Ragnar' }]

        const expected = {
          code: 222,
          start,
          endpoint,
          resTxt: '{"success":true,"data":[]}',
          dataType: 'Array',
          dataLen: 2,
          end: Date.now()
        }

        const result = simulatedResponse(start, endpoint, data)

        expect(result).to.deep.equal(expected)
      })
    })
  })
})
