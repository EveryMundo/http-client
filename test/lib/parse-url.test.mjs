/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

import sinon from 'sinon'
import { expect } from 'chai'
import urlHelper from '../../lib/parse-url.js'
import EMUrl from '../../classes/EMUrl.class.js'

describe('lib/parse-url', () => {
  // eslint-disable-next-line one-var-declaration-per-line
  let box

  beforeEach(() => {
    box = sinon.createSandbox()
  })

  afterEach(() => { box.restore() })

  describe('parseUrl', () => {
    describe('when receiving and INVALID url =>', () => {
      describe('empty url', () => {
        it('show throw an error', () => {
          const caller = () => urlHelper.parseUrl()

          expect(caller).to.throw(Error)
        })
      })
    })

    describe('when receiving valid url =>', () => {
      it('should return an object with the expected properties', () => {
        const result = urlHelper.parseUrl('http://test.com/some/path?a=100&b=200')

        const expected = {
          href: 'http://test.com/some/path?a=100&b=200',
          origin: 'http://test.com',
          protocol: 'http:',
          username: '',
          password: '',
          host: 'test.com',
          hostname: 'test.com',
          port: '',
          pathname: '/some/path',
          search: '?a=100&b=200',
          // searchParams: {},
          hash: '',
          slashes: true,
          auth: '',
          query: 'a=100&b=200',
          path: '/some/path?a=100&b=200'
        }

        expect(result).to.be.instanceof(EMUrl)

        Object.entries(expected).forEach(([prop, value]) => {
          // console.log({ prop, value, [`result[${prop}]`]: result[prop] })
          expect(result).to.have.property(prop, value)
        })
      })

      describe('#auth', () => {
        it('should return user:pass when having both', () => {
          const parsed = urlHelper.parseUrl('http://user:pass@test.com/some/path')

          const result = parsed.auth
          const expected = 'user:pass'

          expect(result).to.deep.equal(expected)
        })

        it('should return only pass when not having user when having both', () => {
          const parsed = urlHelper.parseUrl('http://pass@test.com/some/path')

          const result = parsed.auth
          const expected = 'pass'

          expect(result).to.deep.equal(expected)
        })
      })
    })
  })
})
