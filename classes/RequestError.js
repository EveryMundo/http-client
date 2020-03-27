class RequestError extends Error {
  constructor (message, response) {
    super(message)

    this.response = response
  }

  get stats () {
    console.warn('DEPRECATION WARNING! Error.stats will be replaced by Error.response')

    return this.response
  }
}

module.exports = RequestError
