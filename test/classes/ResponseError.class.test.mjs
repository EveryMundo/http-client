/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */
import { expect } from 'chai'

import ResponseError from '../../classes/ResponseError.class.js'
import Response from '../../classes/Response.class.js'

describe('ResponseError', () => {
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

  describe('get statusCode', () => it('should return the value of response', () => {
    const responeError = new ResponseError('Error Message', response)

    expect(responeError.statusCode).to.equal(response.statusCode)
  }))

  describe('get responseText', () => it('should return the value of response', () => {
    const responeError = new ResponseError('Error Message', response)

    expect(responeError.responseText).to.equal(response.responseText)
  }))

  describe('get buffer', () => it('should return the value of response', () => {
    const responeError = new ResponseError('Error Message', response)

    expect(responeError.buffer).to.equal(response.buffer)
  }))
})
