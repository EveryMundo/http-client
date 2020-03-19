/*
const parseUrlOld = (urlString) => {
  const u = new url.URL(urlString)
  const result = {
    href: u.href,
    origin: u.origin,
    protocol: u.protocol,
    username: u.username,
    password: u.password,
    host: u.host,
    hostname: u.hostname,
    port: u.port,
    pathname: u.pathname,
    search: u.search,
    searchParams: u.searchParams,
    hash: u.hash,
    slashes: true,

    get auth () {
      if (this.username) {
        if (this.password) return `${this.username}:${this.password}`

        return `${this.username}`
      }

      return `${this.password}`
    },
    get query () { return this.search.slice(1) },
    get path () { return `${this.pathname}${this.search}` }
  }

  return result
} */

module.exports = require('../classes/EMUrl.class')
