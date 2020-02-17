const url = require('url')

class EMUrl extends url.URL {
  static parseUrl (url, options) {
    return new EMUrl(url, options)
  }

  constructor (url, options = {}) {
    super(url.url || url)

    this.slashes = true
    this.method = url.method || options.method
  }

  get auth () {
    if (this.username) {
      if (this.password) return `${this.username}:${this.password}`

      return `${this.username}`
    }

    return `${this.password}`
  }

  get query () { return this.search.slice(1) }

  get path () { return `${this.pathname}${this.search}` }
}

module.exports = EMUrl
