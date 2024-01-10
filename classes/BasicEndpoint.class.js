const EMUrl = require('./EMUrl.class.js')
const Headers = require('./Headers.class.js')

const protocols = {
  'http:': require('node:http'),
  'https:': require('node:https')
}

class BasicEndpoint extends EMUrl {
  // _headers = undefined
  constructor (_url, headers = _url.headers, agent = _url.agent) {
    const url = _url.url || _url
    super(url)

    this.http = protocols[this.protocol]
    this.agent = agent
    this.host = this.hostname
    this.headers = headers
    this.method = undefined
    this.timeout = undefined

    if (this.username) {
      this._headers.set('authorization', this.auth.replace(':', ' '))
    }

    if (!this.agent && this._headers.has('keep-alive')) {
      const { max, timeout } = BasicEndpoint.parseKeepAlive(this._headers.get('keep-alive'))

      this.agent = new this.http.Agent({
        keepAlive: true,
        maxSockets: Math.abs(max) || 50,
        timeout: Math.abs(timeout) || undefined
      })
    }

    this.compress = this._headers.get('x-compression')
  }

  static parseKeepAlive = keepAlive => keepAlive
    .split(/[\s,]+/)
    .map(v => v.split(/[\s=]+/g))
    .filter(a => a.length === 2 && a[0] && a[1])
    .reduce((acc, [k, v]) => (acc[k.toLowerCase()] = v) && acc, {})

  static clone (endpoint) {
    const cloned = new this(endpoint, endpoint.headers, endpoint.agent)

    cloned.method = endpoint.method

    return cloned
  }

  get endpoint () {
    if (this.username) {
      return this.href.replace(`${this.auth}@`, '')
    }

    return this.href
  }

  set headers (headers) {
    if (headers != null && !(headers instanceof Object)) {
      throw new Error(`headers must be an instance of Object! Got a ${headers.constructor.name} [${headers}]`)
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

module.exports = BasicEndpoint
