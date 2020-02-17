'use strict'

const Endpoint = require('../classes/Endpoint.class')
const Headers = require('../classes/Headers.class')
const logr = require('@everymundo/simple-logr')
// const { addQueryToPath } = require('../lib/add-query-to-path')
const { simulatedResponse } = require('../lib/simulate-response')
const { setResTxt } = require('../lib/set-response-text')
const { getDataFromXData } = require('../lib/get-data-from-xdata')
const { setHeaders } = require('../lib/set-headers')

const SIMULATE = +process.env.SIMULATE
const MAX_RETRY_ATTEMPTS = Math.abs(process.env.MAX_RETRY_ATTEMPTS) || 3
const RETRY_TIMEOUT_MS = Math.abs(process.env.RETRY_TIMEOUT_MS) || 500
const REQUEST_TIMEOUT_MS = Math.abs(process.env.RETRY_TIMEOUT_MS) || 10000
const writeMethods = ['PUT', 'PATCH', 'POST']

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

const promiseDataTo = (_endpoint, xData, options = {}) => new Promise((resolve, reject) => {
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
  const data = getDataFromXData(xData, compress)
  const start = new Date()

  if (SIMULATE) {
    return resolve(simulatedResponse(start, xData))
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
    agent: endpoint.agent,
    timeout
  }

  let attempt = 1

  const post = () => {
    // Set up the request
    const request = endpoint.http.request(requestOptions, (res) => {
      // res.setEncoding('utf8');
      const buffers = []

      res
        .on('data', (chunk) => { buffers.push(chunk) })
        .on('end', () => {
          const buffer = Buffer.concat(buffers)

          setResTxt(res, buffer).then((resTxt) => {
            const stats = {
              code: res.statusCode,
              start,
              end: Date.now(),
              attempt,
              // endpoint: url,
              endpoint,
              resTxt,
              buffer,
              dataType: xData && xData.constructor.name,
              dataLen: Array.isArray(xData) && xData.length,
              compress,
              requestHeaders: headers,
              responseHeaders: res.headers
            }

            if (res.statusCode === 400) {
              logr.error({ resTxt })
              const err = new Error('400 Status')
              err.stats = stats

              return reject(err)
            }

            if (res.statusCode > 400) {
              logr.error({ resTxt })
              return tryAgain(`Status Code: ${res.statusCode}`, stats)
            }

            if (res.statusCode > 299) {
              stats.err = new Error(`{"Response": ${stats.resTxt}, "statusCode": ${res.statusCode}, "data": ${data}}`)
              return resolve(stats)
            }

            resolve(stats)
          })
            .catch((err) => {
              logr.error(err)
              reject(err)
            })
        })
    })
      .on('error', (err) => {
        logr.error('http.request', err)
        const stats = {
          code: 599,
          start,
          end: Date.now(),
          err,
          attempt,
          // endpoint: url,
          endpoint,
          compress,
          requestHeaders: headers
        }
        tryAgain(err, stats)
      })

    // post the data
    if (writeMethods.indexOf(method.toUpperCase()) > -1) {
      request.write(data)
    }
    request.end()
  }

  function tryAgain (error, stats) {
    logr.error('tryAgain: attempt', attempt, 'has failed.', endpoint.href, error)
    if (attempt < maxRetry) {
      return setTimeout(() => { post(++attempt) }, 500)
    }

    const err = error instanceof Error ? error : new Error(error)
    err.message = `tryAgain has exceeded max delivery attempts (${attempt}):${err.message}`
    logr.error(err.message)
    stats.err = err
    reject(stats)
  }

  post()
})

module.exports = {
  promiseDataTo,
  MAX_RETRY_ATTEMPTS,
  RETRY_TIMEOUT_MS,
  loadedAt: new Date(),
  getDataFromXData
}
