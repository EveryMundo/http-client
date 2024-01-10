'require strict'

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */
const ResponseError = require('../../classes/ResponseError.class.js')
const Response = require('../../classes/Response.class.js')

describe('ResponseError', () => {
  // const sinon = require('sinon')
  const { expect } = require('chai')
  // eslint-disable-next-line one-var-declaration-per-line
  // let box

  // beforeEach(() => { box = sinon.createSandbox() })
  // afterEach(() => { box.restore() })

  describe('class ResponseError', () => {
    it('should be an instance of Error', () => {
      const response = { foo: 'bar' }
      const responeError = new ResponseError('Error Message', response)

      expect(responeError).to.be.instanceof(Error)
    })

    it('should set err property of response', () => {
      const response = { foo: 'bar' }
      const responeError = new ResponseError('Error Message', response)

      expect(responeError.err).to.equal(responeError)
    })
  })

  const response = new Response('endpoint', 'inputData', 'headers', 'compress', 'start', 'method', 'attempt')
  const responeError = new ResponseError('Error Message', response)

  Object.getOwnPropertyNames(response).forEach((prop) => {
    const descriptor = Object.getOwnPropertyDescriptor(response, prop)
    if (!descriptor.get && !descriptor.set) {
      // console.log(`${prop}: ${response[prop]}`)
      describe(`get ${prop}`, () => {
        it('should return the value of response', () => {
          expect(responeError[prop]).to.equal(response[prop])
        })
      })
    }
  })

  describe('get stats', () => it('should return the value of response', () => {
    const responeError = new ResponseError('Error Message', response)

    expect(responeError.stats).to.equal(response)
  }))

  describe('get buffer', () => it('should return the value of response', () => {
    const responeError = new ResponseError('Error Message', response)

    expect(responeError.buffer).to.equal(response.buffer)
  }))
})
