/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */
import { createSandbox } from 'sinon'
import { expect } from 'chai'
import { Endpoint } from '../../classes/Endpoint.class.js'
import EMUrl from '../../classes/EMUrl.class.js'
import httpClient from '../../lib/promise-data-to.js'

describe('classes/Endpoint', () => {
  // eslint-disable-next-line one-var-declaration-per-line
  let box

  beforeEach(() => { box = createSandbox() })
  afterEach(() => { box.restore() })

  describe('class Endpoint', () => {
    it('should be an instance of EMUrl', () => {
      const endpoint = new Endpoint('http://test.com')

      expect(endpoint).to.be.instanceof(EMUrl)
    })

    it('should throw and error when endpoint is set to a non Object', () => {
      const caller = () =>
        new Endpoint('http://test.com', 100)

      expect(caller).to.throw(Error, 'headers must be an instance of Object')
    })

    const inputUrlString = 'https://head-url'
    const expectedUrlString = 'https://head-url/'

    describe('instance httpMethods', () => {
      beforeEach(() => { box.stub(httpClient, 'promiseDataTo') })
      // read methods
      ;['get', 'head'].forEach((method) => {
        describe(`#${method}`, () => {
          const upMethod = method.toUpperCase()
          it(`should call promiseDataTo with method ${upMethod} with headers`, async () => {
            const inputHeaders = { auth: 'AUTH VALUE' }
            const ep = new Endpoint(inputUrlString, inputHeaders)
            await ep[method]()

            expect(httpClient.promiseDataTo).to.have.property('calledOnce', true)
            const { 0: firstCallArgs } = httpClient.promiseDataTo.args
            expect(firstCallArgs).to.be.instanceof(Array)
            // expect(firstCallArgs).to.have.property('length', 2)
            const { 0: endpoint, 2: options } = firstCallArgs
            expect(endpoint.headers).to.have.key('auth')
            expect(endpoint.headers.get('auth')).to.equal('AUTH VALUE')
            expect(options).to.have.property('method', upMethod)
          })

          it(`should call promiseDataTo with method ${upMethod} and NO headers`, async () => {
            const ep = new Endpoint(inputUrlString)
            await ep[method]()

            expect(httpClient.promiseDataTo).to.have.property('calledOnce', true)
            const { 0: firstCallArgs } = httpClient.promiseDataTo.args
            expect(firstCallArgs).to.be.instanceof(Array)
            // expect(firstCallArgs).to.have.property('length', 2)

            const { 0: endpoint, 2: options } = firstCallArgs
            expect(endpoint.headers).to.not.have.key('auth')
            expect(endpoint.headers).to.have.property('size', 0)
            expect(options).to.have.property('method', upMethod)
          })
        })
      })

      // write methods
      ;['patch', 'put', 'post', 'delete'].forEach(method => {
        describe(`#${method}`, () => {
          const upMethod = method.toUpperCase()
          it(`should call promiseDataTo with method ${upMethod}`, async () => {
            const inputHeaders = { auth: 'AUTH VALUE' }
            const inputData = { some: 'data' }

            const ep = new Endpoint(inputUrlString, inputHeaders)
            await ep[method](inputData)

            expect(httpClient.promiseDataTo).to.have.property('calledOnce', true)
            const { 0: firstCallArgs } = httpClient.promiseDataTo.args
            expect(firstCallArgs).to.be.instanceof(Array)
            expect(firstCallArgs).to.have.property('length', 3)
            const { 0: endpoint, 1: data, 2: options } = firstCallArgs
            expect(endpoint).to.be.instanceof(Endpoint)
            expect(endpoint.toString()).to.equal(expectedUrlString)
            expect(endpoint.headers).to.have.key('auth')
            expect(endpoint.headers.get('auth')).to.equal(inputHeaders.auth)
            expect(data).to.deep.equal(inputData)
            expect(options).to.have.property('method', upMethod)
          })
        })
      })

      describe('#fetch', () => {
        describe('fetch get', () => {
          const method = 'GET'

          it(`should call fetch and promiseDataTo with method ${method} and headers`, async () => {
            const inputHeaders = { auth: 'AUTH VALUE' }
            // const inputData = { some: 'data' }
            const inputOptions = { method }

            const ep = new Endpoint(inputUrlString, inputHeaders)
            await ep.fetch(inputOptions)

            expect(httpClient.promiseDataTo).to.have.property('calledOnce', true)
            const { 0: firstCallArgs } = httpClient.promiseDataTo.args
            expect(firstCallArgs).to.be.instanceof(Array)
            expect(firstCallArgs).to.have.property('length', 2)
            const { 0: endpoint } = firstCallArgs
            expect(endpoint).to.be.instanceof(Endpoint)
            expect(endpoint.toString()).to.equal(expectedUrlString)
            expect(endpoint.headers).to.have.key('auth')
            expect(endpoint.headers.get('auth')).to.equal(inputHeaders.auth)
            // expect(data).to.deep.equal(inputData)
            expect(endpoint).to.have.property('method', method)
          })
        })
      })
    })

    describe.skip('static httpMethods', () => {
      beforeEach(() => { box.stub(httpClient, 'promiseDataTo') })

      describe('#head', () => {
        it('should call fetch with method HEAD', async () => {
          const headers = { auth: 'AUTH VALUE' }
          await Endpoint.head('http://head-url', { headers })

          expect(httpClient.promiseDataTo).to.have.property('calledOnce', true)
          const { 0: firstCallArgs } = httpClient.promiseDataTo.args
          expect(firstCallArgs).to.be.instanceof(Array)
          expect(firstCallArgs).to.have.property('length', 2)
          const { 0: endpoint } = firstCallArgs
          expect(endpoint).to.have.property('method', 'HEAD')
          expect(endpoint.headers).to.have.key('auth')
          expect(endpoint.headers.get('auth')).to.equal('AUTH VALUE')
        })

        it('should call fetch with method HEAD', async () => {
          await Endpoint.head('http://head-url')

          expect(httpClient.promiseDataTo).to.have.property('calledOnce', true)
          const { 0: firstCallArgs } = httpClient.promiseDataTo.args
          expect(firstCallArgs).to.be.instanceof(Array)
          expect(firstCallArgs).to.have.property('length', 2)

          const { 0: endpoint } = firstCallArgs
          expect(endpoint).to.have.property('method', 'HEAD')
        })
      })

      describe('#patch', () => {
        it('should call promiseDataTo with method PATCH', async () => {
          const inputHeaders = { auth: 'AUTH VALUE' }
          const inputData = { some: 'data' }
          await Endpoint.patch(inputUrlString, inputData, { headers: inputHeaders })

          expect(httpClient.promiseDataTo).to.have.property('calledOnce', true)
          const { 0: firstCallArgs } = httpClient.promiseDataTo.args
          expect(firstCallArgs).to.be.instanceof(Array)
          expect(firstCallArgs).to.have.property('length', 3)
          const { 0: endpoint, 1: data, 2: options } = firstCallArgs
          expect(endpoint).to.equal(inputUrlString)
          expect(data).to.deep.equal(inputData)
          expect(options).to.have.property('method', 'PATCH')
          expect(options).to.have.property('headers')
          expect(options.headers).to.have.property('auth', inputHeaders.auth)
        })
      })
    })
  })
})
