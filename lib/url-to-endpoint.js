'use strict'

/* eslint-disable no-console */
const protos = { 'http:': require('http'), 'https:': require('https') }
const { parseUrl } = require('../lib/parse-url')

const urlToEndpoint = (url, headers = {}) => {
  if (!/^https?:/.test(url)) {
    throw new Error(`Invalid endpoint url [${url}]`)
  }

  const { protocol, hostname, port, path, auth, search } = parseUrl(url)
  const configs = {
    http: protos[protocol],
    host: hostname,
    headers: {},
    search,
    port,
    path,
    endpoint: url,
    compress: false
  }

  if (headers && headers instanceof Object) {
    Object.entries(headers).forEach(([headerName, headerValue]) => {
      configs.headers[headerName.toLowerCase()] = '' + headerValue
    })

    if ('content-encoding' in configs.headers) {
      configs.compress = configs.headers['content-encoding']
    }
  }

  // auth
  if (auth) {
    configs.headers.Authorization = auth.replace(':', ' ')
    configs.endpoint = configs.endpoint.replace(`${auth}@`, '')
  }

  return configs
}

module.exports = { urlToEndpoint }
