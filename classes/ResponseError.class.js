class ResponseError extends Error {
  response = undefined

  get code () { return this.response.code }
  get err () { return this }
  get method () { return this.response.method }
  get start () { return this.response.start }
  get end () { return this.response.end }
  get attempt () { return this.response.attempt }
  get endpoint () { return this.response.endpoint }
  get responseBuffer () { return this.response.responseBuffer }
  get dataType () { return this.response.dataType }
  get dataLen () { return this.response.dataLen }
  get compress () { return this.response.compress }
  get requestHeaders () { return this.response.requestHeaders }
  get responseHeaders () { return this.response.responseHeaders }

  constructor (error, response, prefixMessage) {
    super(error)
    if (typeof prefixMessage === 'string' && prefixMessage.length > 0) {
      this.message = `${prefixMessage} ${error.message}`
    }
    response.err = this

    this.response = response
  }

  get responseText () { return this.response.responseText }
  get buffer () { return this.response.buffer }

  get stats () {
    console.warn('DEPRECATION WARNING! Error.stats will be replaced by Error.response')

    return this.response
  }
}

module.exports = ResponseError
