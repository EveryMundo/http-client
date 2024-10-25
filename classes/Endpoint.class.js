const BasicEndpoint = require('./BasicEndpoint.class.js')
const lib = require('../lib/promise-data-to.js')

class Endpoint extends BasicEndpoint {
  post (data, options) { return this.constructor.post(this, data, options) }
  static post (endpoint, data, options = { method: null }) {
    options.method = 'POST'

    return lib.promiseDataTo(endpoint, data, options)
  }

  get (options) { return this.constructor.get(this, options) }
  static get (endpoint, options = { method: null }) {
    options.method = 'GET'

    return lib.promiseDataTo(endpoint, undefined, options)
  }

  patch (data, options) { return this.constructor.patch(this, data, options) }
  static patch (url, data, options = { method: null }) {
    options.method = 'PATCH'

    return lib.promiseDataTo(url, data, options)
  }

  put (data, options) { return this.constructor.put(this, data, options) }
  static put (url, data, options = { method: null }) {
    options.method = 'PUT'

    return lib.promiseDataTo(url, data, options)
  }

  delete (data, options) { return this.constructor.delete(this, data, options) }
  static delete (url, data, options = { method: null }) {
    options.method = 'DELETE'

    return lib.promiseDataTo(url, data, options)
  }

  head (options) { return this.constructor.head(this, options) }
  static head (url, options = { method: null }) {
    options.method = 'HEAD'

    return lib.promiseDataTo(url, undefined, options)
  }

  fetch (options) { return this.constructor.fetch(this, options) }
  static fetch (url, options = {}) {
    const {
      // credentials,
      headers = {},
      // referrer,
      // referrerPolicy,
      body,
      // mode,
      method = body ? 'POST' : 'GET'
    } = options

    const endpoint = url instanceof Endpoint
      ? url
      : new Endpoint(url, headers)

    if (options.referrer != null) {
      endpoint.headers.set('referrer', options.referrer)
    }

    endpoint.method = method

    return lib.promiseDataTo(endpoint, body)
  }
}

class GetEndpoint extends Endpoint {
  constructor (url, headers, agent) {
    super(url, headers, agent)

    this.method = 'GET'
  }
}

class PostEndpoint extends Endpoint {
  constructor (url, headers, agent) {
    super(url, headers, agent)

    this.method = 'POST'
  }
}

module.exports = {
  Endpoint,
  GetEndpoint,
  PostEndpoint
}
