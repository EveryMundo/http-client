const { decompressBuffer } = require('../lib/decompress-buffer.js')

class Response {
  code = undefined
  err = undefined
  method = undefined
  start = undefined
  end = undefined
  attempt = undefined
  endpoint = undefined
  responseBuffer = undefined
  dataType = undefined
  dataLen = undefined
  compress = undefined
  requestHeaders = undefined
  responseHeaders = undefined

  constructor (endpoint, inputData, headers, compress, start, method, attempt = 1) {
    this.endpoint = endpoint
    this.dataType = inputData && inputData.constructor.name
    this.requestHeaders = headers
    this.compress = compress
    this.start = start
    this.dataLen = Array.isArray(inputData) && inputData.length
    this.method = method
    this.attempt = attempt

    Object.defineProperty(this, 'resTxt', {
      get () {
        console.warn('DEPRECATION WARING! promiseDataTo .resTxt will be replaced by .responseText')

        return this.responseText
      }
    })
  }

  get statusCode () { return this.code }

  get responseText () {
    if (this.buffer) {
      return Object.defineProperty(this, 'responseText', { value: this.buffer.toString('utf8') }).responseText
    }
  }

  // buffer: responseBuffer,
  get buffer () {
    if (this.responseBuffer) {
      return Object.defineProperty(this, 'buffer', {
        value: decompressBuffer(this.responseBuffer, this.responseHeaders['content-encoding'])
      }).buffer
    }
  }
}

module.exports = Response
