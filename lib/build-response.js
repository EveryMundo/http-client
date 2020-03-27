const { decompressBuffer } = require('../lib/decompress-buffer')

const buildResponse = (endpoint, inputData, headers, compress, start, attempt = 1) => ({
  get statusCode () { return this.code },
  code: undefined,
  err: undefined,
  start,
  end: undefined,
  attempt,
  endpoint,
  // get url () { return this.endpoint.endpoint },
  get resTxt () {
    console.warn('DEPRECATION WARING! promiseDataTo .resTxt will be replaced by .responseText')
    return this.responseText
  },
  get responseText () {
    if (this.buffer) {
      return Object.defineProperty(this, 'responseText', { value: this.buffer.toString('utf8') }).responseText
    }
  },
  // buffer: responseBuffer,
  get buffer () {
    if (this.responseBuffer) {
      return Object.defineProperty(this, 'buffer', { value: decompressBuffer(this.responseBuffer, this.responseHeaders['content-encoding']) }).buffer
    }
  },
  responseBuffer: undefined,
  dataType: inputData && inputData.constructor.name,
  dataLen: Array.isArray(inputData) && inputData.length,
  compress,
  requestHeaders: headers,
  responseHeaders: undefined
})

module.exports = buildResponse
