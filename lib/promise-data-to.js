'use strict'
const logr = require('@everymundo/simple-logr')

const BasicEndpoint = require('../classes/BasicEndpoint.class.js')
const Headers = require('../classes/Headers.class.js')
const Response = require('../classes/Response.class.js')

const sim = require('../lib/simulate-response.js')
const { getProperDataFromInputData } = require('../lib/get-data-from-xdata.js')
const { setHeaders } = require('../lib/set-headers.js')
const config = require('../lib/config.js')

const writeMethods = new Set(['PUT', 'PATCH', 'POST'])

const getEndpoint = (endpoint) => {
  if (!endpoint) {
    throw new Error('EM: INVALID ENDPOINT')
  }

  if (endpoint instanceof BasicEndpoint) {
    return endpoint
  }

  return new BasicEndpoint(endpoint)
}

const getHeaders = (endpoint, options, data, compress) => {
  const _headers = options?.headers ?? endpoint?.headers
  const headers = _headers instanceof Headers
    ? _headers.toObject()
    : (_headers && new Headers(_headers).toObject())

  return setHeaders(headers, data, compress)
}

const readStreamPromise = (response) => new Promise((resolve, reject) => {
  const buffers = []

  response
    .on('data', (chunk) => { buffers.push(chunk) })
    .on('end', () => { resolve(Buffer.concat(buffers)) })
    .on('error', reject)
})

const promiseDataTo = (_endpoint, inputData, options = {}) => new Promise((resolve, reject) => {
  const endpoint = getEndpoint(_endpoint)
  const {
    query,
    // endpoint: url,
    method = options.method || 'POST',
    maxRetry = config.MAX_RETRY_ATTEMPTS,
    timeout = config.REQUEST_TIMEOUT_MS,
    compress = false
  } = endpoint

  // An object of options to indicate where to post to
  // const data = typeof xData === 'string' ? xData : JSON.stringify(xData),
  const data = getProperDataFromInputData(inputData, compress)
  const start = new Date()
  const headers = getHeaders(endpoint, options, data, compress)

  if (config.SIMULATE) {
    return resolve(sim.simulatedResponse(endpoint, inputData, headers, compress, start))
  }

  const requestOptions = {
    host: endpoint.hostname,
    port: endpoint.port,
    query,
    path: endpoint.path,
    method,
    headers,
    agent: endpoint.agent
  }

  const doRequest = (attempt = 1) => {
    const stats = new Response(endpoint, inputData, headers, compress, start, method, attempt)

    const request = endpoint.http.request(requestOptions, async (res) => {
      stats.end = Date.now()
      stats.code = res.statusCode
      stats.responseHeaders = res.headers
      stats.responseBuffer = await readStreamPromise(res)

      if (res.statusCode === 400) {
        logr[config.EMHC_LOG_LEVEL]({ resTxt: stats.responseText })
        const err = new Error('400 Status')
        err.stats = stats

        return reject(err)
      }

      if (res.statusCode > 400) {
        logr[config.EMHC_LOG_LEVEL]({ resTxt: stats.responseText })
        return tryAgain(`Status Code: ${res.statusCode}`, stats, attempt)
      }

      if (res.statusCode > 299) {
        stats.err = new Error(`{"Response": ${stats.responseText}, "statusCode": ${res.statusCode}, "data": ${data}}`)
        return resolve(stats)
      }

      return resolve(stats)
    })
      .on('error', (error) => {
        logr[config.EMHC_LOG_LEVEL]('http.request', error)
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
    logr[config.EMHC_LOG_LEVEL]('try Again: attempt', attempt, 'has failed.', endpoint.href, error)
    if (attempt < maxRetry) {
      return setTimeout(doRequest, config.RETRY_TIMEOUT_MS, attempt + 1)
    }

    stats.err = error instanceof Error ? error : new Error(error)
    stats.err.message = `try Again has exceeded max delivery attempts (${attempt}):${stats.err.message}`

    reject(stats)
  }

  doRequest()
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
  get MAX_RETRY_ATTEMPTS () { return config.MAX_RETRY_ATTEMPTS },
  get RETRY_TIMEOUT_MS () { return config.RETRY_TIMEOUT_MS },
  loadedAt: new Date(),
  getDataFromXData: getProperDataFromInputData
}
