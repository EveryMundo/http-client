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
        const inputData = [{ name: 'Daniel' }, { name: 'Ragnar' }]
        const response = simulatedResponse(endpoint, inputData, null, null, start)

        expect(response).to.have.property('code', 222)
        // expect(response).to.have.property('responseText', '{"success":true,"data":[]}')
        expect(response).to.have.property('start', start)
        expect(response).to.have.property('end')
        expect(response.end).to.not.be.undefined
        expect(response.end).not.to.be.lessThan(start.getTime())
        expect(response).to.have.property('dataType', 'Array')
        expect(response).to.have.property('dataLen', 2)
      })
    })
  })
})
