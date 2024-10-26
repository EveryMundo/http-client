/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

import sinon from 'sinon'
import { expect } from 'chai'

import fileTotest from '../../lib/set-headers.js'

describe('lib/set-headers.js', () => {
  // eslint-disable-next-line one-var-declaration-per-line
  let box

  beforeEach(() => { box = sinon.createSandbox() })
  afterEach(() => { box.restore() })

  describe('#setHeaders', () => {
    const { setHeaders } = fileTotest

    describe('When content-type is not set', () => {
      it('should no longer set content-type to application/json', () => {
        const headers = {}

        setHeaders(headers)

        expect(headers).to.not.have.property('content-type', 'application/json')
      })
    })

    describe('When content-type is preset', () => {
      it('should not change the content-type sent', () => {
        const headers = { 'content-type': 'application/something-else' }

        setHeaders(headers)

        expect(headers).to.have.property('content-type', 'application/something-else')
      })
    })

    describe('When data is not passed', () => {
      it('should not set content-length', () => {
        const headers = { 'content-type': 'application/something-else' }

        setHeaders(headers)

        expect(headers).to.not.have.property('content-length')
      })
    })

    describe('When data is passed', () => {
      it('should set content-length with its byte length', () => {
        const headers = {}
        const data = '{"name":"Daniel San","code":"ç"}'

        setHeaders(headers, data)

        expect(headers).to.have.property('content-length', 33)
      })
    })

    describe('When compress is NOT present', () => {
      it('should not set x-compression', () => {
        const headers = {}

        setHeaders(headers)

        expect(headers).to.not.have.property('x-compression')
      })
    })

    describe('When compress is present', () => {
      it('should set x-compression its value', () => {
        const headers = {}
        const compress = 'gzip'

        setHeaders(headers, null, compress)

        expect(headers).to.have.property('x-compression', compress)
      })
    })
  })
})
