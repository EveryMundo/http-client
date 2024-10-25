'use strict'

const Endpoint = require('../classes/Endpoint.class.js')
const Headers = require('../classes/Headers.class.js')
const RequestError = require('../classes/Headers.class.js')
const logr = require('../lib/logr.js.js')
// const { addQueryToPath } = require('../lib/add-query-to-path.js')
const { simulatedResponse } = require('../lib/simulate-response.js')
// const { setResTxt } = require('../lib/set-response-text.js')
const { decompressBuffer } = require('../lib/decompress-buffer.js')
const { getDataFromXData } = require('../lib/get-data-from-xdata.js')
const { setHeaders } = require('../lib/set-headers.js')

const SIMULATE = +process.env.SIMULATE
const MAX_RETRY_ATTEMPTS = Math.abs(process.env.MAX_RETRY_ATTEMPTS) || 3
const RETRY_TIMEOUT_MS = process.env.RETRY_TIMEOUT_MS && Math.abs(process.env.RETRY_TIMEOUT_MS)
const REQUEST_TIMEOUT_MS = process.env.REQUEST_TIMEOUT_MS && Math.abs(process.env.REQUEST_TIMEOUT_MS)

const writeMethods = new Set(['PUT', 'PATCH', 'POST', 'DELETE'])

const getEndpoint = (endpoint) => {
  if (!endpoint) {
    throw new Error('EM: INVALID ENDPOINT')
  }

  if (!(endpoint instanceof Endpoint)) {
    return new Endpoint(endpoint)
  }

  return endpoint
}

const getHeaders = (endpoint, options, data, compress) => {
  const headers = (options && options.headers && new Headers(options.headers).toObject()) ||
    endpoint.headers.toObject()

  return setHeaders(headers, data, compress)
}

const readStreamPromise = (response) => new Promise((resolve, reject) => {
  const buffers = []

  response
    .on('data', (chunk) => { buffers.push(chunk) })
    .on('end', () => { resolve(Buffer.concat(buffers)) })
    .on('error', reject)
})

const httpRequestPromise = (http, requestOptions, timeout, cb) => {
  const request = http.request(requestOptions, cb)

  if (timeout != null) {
    if (Number.isNaN(+timeout)) {
      throw new Error(`timeout param is not a number [${timeout}]`)
    }

    request.on('socket', (socket) => {
      socket.on('timeout', () => {
        request.abort()
      })

      socket.setTimeout(timeout)
    })
  }

  return request
}

const promiseDataTo = async (_endpoint, inputData, options = {}) => {
  const endpoint = getEndpoint(_endpoint)
  const {
    query,
    // endpoint: url,
    method = options.method || 'POST',
    maxRetry = MAX_RETRY_ATTEMPTS,
    timeout = REQUEST_TIMEOUT_MS,
    compress = false
  } = endpoint

  // An object of options to indicate where to post to
  // const data = typeof xData === 'string' ? xData : JSON.stringify(xData),
  const data = getDataFromXData(inputData, compress)
  const start = new Date()

  if (SIMULATE) {
    return simulatedResponse(start, inputData)
  }

  // const headers = setHeaders(endpoint.headers.toObject(), data, compress)
  const headers = getHeaders(endpoint, options, data, compress)

  const requestOptions = {
    host: endpoint.host,
    port: endpoint.port,
    query,
    // path: query ? addQueryToPath(query, endpoint.path) : endpoint.path,
    path: endpoint.path,
    method,
    headers,
    agent: endpoint.agent
  }

  const post = async (attempt = 1) => {
    const stats = {
      get statusCode () { return this.code },
      code: undefined,
      data,
      start,
      end: undefined,
      get err () { return this.error },
      error: undefined,
      attempt,
      // endpoint: url,
      endpoint,
      // resTxt: undefined,
      get resTxt () {
        console.warn('DEPRECATION WARING! promiseDataTo .resTxt will be replaced by .responseText')
        return this.responseText
      },
      get responseText () {
        return Object.defineProperty(this, 'responseText', { value: this.buffer.toString('utf8') }).responseText
      },
      get buffer () {
        return Object.defineProperty(this, 'buffer', { value: decompressBuffer(this.responseBuffer) }).buffer
      },
      responseBuffer: undefined,
      dataType: inputData && inputData.constructor.name,
      dataLen: Array.isArray(inputData) && inputData.length,
      compress,
      requestHeaders: headers,
      responseHeaders: undefined
    }

    const request = httpRequestPromise(endpoint.http, requestOptions, timeout, onRequestResponse)
    request.on('error', (error) => {
      logr.error('http.request', error)

      stats.code = 599
      stats.error = error

      return tryAgain(error, stats, maxRetry, post)
    })

    async function onRequestResponse (response) {
      // const response = await awaitResponseFromRequest(request)
      const responseBuffer = await readStreamPromise(response).catch(e => e)

      stats.code = response.statusCode
      stats.end = Date.now()
      stats.responseBuffer = responseBuffer
      stats.responseHeaders = response.headers

      if (response.statusCode === 400) {
        throw new RequestError('400 Status', stats)
      }

      if (response.statusCode > 400) {
        return tryAgain(`Status Code: ${response.statusCode}`, stats, maxRetry, post)
      }

      if (response.statusCode > 299) {
        stats.error = new Error(`{"Response": ${stats.resTxt}, "statusCode": ${response.statusCode}, "data": ${data}}`)

        return stats
      }

      return stats
    }

    // it posts the data
    if (writeMethods.has(method)) {
      request.write(data)
    }

    request.end()
  }

  return post()
}

async function tryAgain (error, stats, maxRetry, post) {
  const { attempt, endpoint } = stats

  logr.error('tryAgain: attempt', attempt, 'has failed.', endpoint.endpoint, error)
  if (attempt < maxRetry) {
    return delayedCall(() => post(attempt + 1), 500)
  }

  const err = error instanceof Error ? error : new Error(error)
  err.message = `tryAgain has exceeded max delivery attempts (${attempt}):${err.message}`
  logr.error(err.message)
  stats.err = err

  return stats
}

const delayedCall = (func, ms) => new Promise((resolve) => {
  setTimeout(() => resolve(func()), ms)
})

module.exports = {
  getEndpoint,
  promiseDataTo,
  MAX_RETRY_ATTEMPTS,
  RETRY_TIMEOUT_MS,
  loadedAt: new Date(),
  getDataFromXData
}
