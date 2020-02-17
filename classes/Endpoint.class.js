const EMUrl = require('./EMUrl.class')
const Headers = require('./Headers.class.js')
const { parseKeepAlive } = require('../lib/parse-keep-alive-header')

const protocols = {
  'http:': require('http'),
  'https:': require('https')
}

class Endpoint extends EMUrl {
  static clone (endpoint) {
    const cloned = new Endpoint(endpoint, endpoint.headers, endpoint.agent)

    cloned.method = endpoint.method

    return cloned
  }

  // _headers = undefined
  constructor (_url, headers = _url.headers, agent = _url.agent) {
    const url = _url.url || _url
    super(url)
    // const { protocol, hostname, port, path, auth } = parseUrl(url)
    this.http = protocols[this.protocol]
    this.agent = agent
    this.host = this.hostname
    this.headers = headers
    // this.port = port
    // this.path = path
    this.endpoint = this.href
    this.method = undefined

    if (this.auth) {
      this._headers.set('authorization', this.auth.replace(':', ' '))
      this.endpoint = this.href = this.href.replace(`${this.auth}@`, '')
    }

    if (!this.agent && this._headers.has('keep-alive')) {
      const { max, timeout } = parseKeepAlive(this._headers.get('keep-alive'))

      this.agent = new this.http.Agent({
        keepAlive: true,
        maxSockets: Math.abs(max) || 50,
        timeout: Math.abs(timeout) || undefined
      })
    }

    this.compress = this._headers.get('content-encoding')
  }

  set headers (headers) {
    if (headers != null && !(headers instanceof Object)) {
      throw new Error(`headers must be an instance of Object! Got a ${headers.constructor.name}`)
    }

    return (this._headers = new Headers(headers))
  }

  get headers () {
    return this._headers
  }

  getObject () {
    return this.toJSON()
  }

  toJSON () {
    return {
      // http: this.http,
      // agent: this.agent,
      host: this.host,
      headers: this.headers.toJSON(),
      port: this.port,
      path: this.path,
      endpoint: this.endpoint,
      compress: this.compress
    }
  }

  toString () {
    return this.endpoint
  }
}

module.exports = Endpoint
