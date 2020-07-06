'use strict'
const logr = require('@everymundo/simple-logr')

const Endpoint = require('../classes/Endpoint.class')
const Headers = require('../classes/Headers.class')

const { simulatedResponse } = require('../lib/simulate-response')
const { getProperDataFromInputData } = require('../lib/get-data-from-xdata')
const { setHeaders } = require('../lib/set-headers')
const buildResponse = require('./build-response')

const SIMULATE = +process.env.SIMULATE
const MAX_RETRY_ATTEMPTS = Math.abs(process.env.MAX_RETRY_ATTEMPTS) || 3
const RETRY_TIMEOUT_MS = process.env.RETRY_TIMEOUT_MS ? Math.abs(process.env.RETRY_TIMEOUT_MS) : 500
const REQUEST_TIMEOUT_MS = process.env.REQUEST_TIMEOUT_MS && Math.abs(process.env.REQUEST_TIMEOUT_MS)
const { EMHC_LOG_LEVEL = 'error' } = process.env

const writeMethods = new Set(['PUT', 'PATCH', 'POST'])

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

const readStreamPromiseOld = (response) => new Promise((resolve, reject) => {
  const buffers = []

  response
    .on('data', (chunk) => { buffers.push(chunk) })
    .on('end', () => { resolve(Buffer.concat(buffers)) })
    .on('error', reject)
})

async function readStreamPromise (response) {
  const buffers = [];
  for await (const chunk of response) {
    buffers.push(chunk);
  }
  return Buffer.concat(buffers);
}

const promiseDataTo = (_endpoint, inputData, options = {}) => new Promise((resolve, reject) => {
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
  const data = getProperDataFromInputData(inputData, compress)
  const start = new Date()
  const headers = getHeaders(endpoint, options, data, compress)

  if (SIMULATE) {
    return resolve(simulatedResponse(endpoint, inputData, headers, compress, start))
  }

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

  // let attempt = 1

  const post = (attempt = 1) => {
    const stats = buildResponse(endpoint, inputData, headers, compress, start, method, attempt)

    const request = endpoint.http.request(requestOptions, async (res) => {
      stats.end = Date.now()
      stats.code = res.statusCode
      stats.responseHeaders = res.headers
      stats.responseBuffer = await readStreamPromise(res)

      if (res.statusCode === 400) {
        logr[EMHC_LOG_LEVEL]({ resTxt: stats.responseText })
        const err = new Error('400 Status')
        err.stats = stats

        return reject(err)
      }

      if (res.statusCode > 400) {
        logr[EMHC_LOG_LEVEL]({ resTxt: stats.responseText })
        return tryAgain(`Status Code: ${res.statusCode}`, stats, attempt)
      }

      if (res.statusCode > 299) {
        stats.err = new Error(`{"Response": ${stats.responseText}, "statusCode": ${res.statusCode}, "data": ${data}}`)
        return resolve(stats)
      }

      return resolve(stats)
    })
      .on('error', (error) => {
        logr[EMHC_LOG_LEVEL]('http.request', error)
        stats.err = error
        stats.code = 599
        stats.end = Date.now()

        tryAgain(error, stats, attempt)
      })

    setRequestTimeout(request, timeout)

    // post the data
    if (writeMethods.has(method.toUpperCase())) {
      request.write(data)
    }

    request.end()
  }

  function tryAgain (error, stats, attempt) {
    logr[EMHC_LOG_LEVEL]('try Again: attempt', attempt, 'has failed.', endpoint.href, error)
    if (attempt < maxRetry) {
      return setTimeout(post, RETRY_TIMEOUT_MS, attempt + 1)
    }

    stats.err = error instanceof Error ? error : new Error(error)
    stats.err.message = `try Again has exceeded max delivery attempts (${attempt}):${stats.err.message}`

    reject(stats)
  }

  post()
})

const setRequestTimeout = (request, timeout) => {
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
}

module.exports = {
  getEndpoint,
  promiseDataTo,
  MAX_RETRY_ATTEMPTS,
  RETRY_TIMEOUT_MS,
  loadedAt: new Date(),
  getDataFromXData: getProperDataFromInputData
}
