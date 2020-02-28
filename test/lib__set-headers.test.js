'require strict'

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

describe('lib/set-headers.js', () => {
  const sinon = require('sinon')
  const { expect } = require('chai')

  // eslint-disable-next-line one-var-declaration-per-line
  let box

  beforeEach(() => { box = sinon.createSandbox() })
  afterEach(() => { box.restore() })

  describe('#setHeaders', () => {
    const { setHeaders } = require('../lib/set-headers')

    context('When content-type is not set', () => {
      it('should set content-type to JSON', () => {
        const headers = {}

        setHeaders(headers)

        expect(headers).to.have.property('content-type', 'application/json')
      })
    })

    context('When content-type is set to null', () => {
      it('should have no content-type header', () => {
        const headers = {
          'content-type': 'null'
        }

        setHeaders(headers)

        expect(headers).to.not.have.property('content-type')
      })
    })

    context('When content-type is preset', () => {
      it('should not change the content-type sent', () => {
        const headers = { 'content-type': 'application/something-else' }

        setHeaders(headers)

        expect(headers).to.have.property('content-type', 'application/something-else')
      })
    })

    context('When data is not passed', () => {
      it('should not set content-length', () => {
        const headers = { 'content-type': 'application/something-else' }

        setHeaders(headers)

        expect(headers).to.not.have.property('content-length')
      })
    })

    context('When data is passed', () => {
      it('should set content-length with its byte length', () => {
        const headers = {}
        const data = '{"name":"Daniel San","code":"ç"}'

        setHeaders(headers, data)

        expect(headers).to.have.property('content-length', 33)
      })
    })

    context('When compress is NOT present', () => {
      it('should not set content-encoding', () => {
        const headers = {}

        setHeaders(headers)

        expect(headers).to.not.have.property('content-encoding')
      })
    })

    context('When compress is present', () => {
      it('should set content-encoding its value', () => {
        const headers = {}
        const compress = 'gzip'

        setHeaders(headers, null, compress)

        expect(headers).to.have.property('content-encoding', compress)
      })
    })
  })
})
