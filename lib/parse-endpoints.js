'use strict'

/* eslint-disable no-console */
const protos = { 'http:': require('http'), 'https:': require('https') }
const { parseJson } = require('@everymundo/json-utils')

const validateEndpointProtocol = endpointKey => (endpoint) => {
  if (/^https?:/.test(endpoint)) return true

  throw new Error(`endpointKey: [${endpointKey}] has an invalid endpoint [${endpoint}]`)
}

const parseEndpoints = (pattern = /^(MAIN)_ENDPOINT$/) => {
  const parsedEndpoints = {}
  Object
    .keys(process.env)
    .filter(envVar => pattern.test(envVar))
    .sort()
    .forEach((envVar) => {
      const
        match = envVar.match(pattern)

      const endpointKey = match[1] || match[0]

      if (parsedEndpoints[endpointKey]) {
        throw new Error(`${endpointKey} present twice`)
      }

      const
        endpoints = process
          .env[envVar]
          .split(/[|,;\s]+/)
          .filter(validateEndpointProtocol(endpointKey))

      const headersEnv = `${envVar}_HEADERS`

      const rawHeaders = process.env[headersEnv] ? process.env[headersEnv].split('|||') : []

      const headers = rawHeaders.map(parseJson)

      parsedEndpoints[endpointKey] = new Array(endpoints.length)

      endpoints.forEach((endpoint, ix) => {
        const { protocol, hostname, port, path, auth } = require('url').parse(endpoint)
        const configs = {
          http: protos[protocol],
          agent: undefined,
          host: hostname,
          headers: {},
          port,
          path,
          endpoint,
          compress: undefined
        }
        parsedEndpoints[endpointKey][ix] = configs

        if (headers[ix] instanceof Error) {
          // console.error(headers_env, 'error for', { raw: raw_headers[ix], headers_env, raw_headers }, { error: headers[ix] });
          throw headers[ix]
        }

        if (headers[ix]) {
          Object.keys(headers[ix]).forEach((key) => {
            if (key !== 'keep-alive') {
              configs.headers[key.toLowerCase()] = headers[ix][key]
            }
          })

          if ('keep-alive' in headers[ix]) {
            const { max, timeout } = parseKeepAlive(headers[ix])

            configs.agent = new configs.http.Agent({
              keepAlive: true,
              maxSockets: Math.abs(max) || 50,
              timeout: Math.abs(timeout) || undefined
            })
          }
        }

        // auth
        if (auth) {
          configs.headers.Authorization = auth.replace(':', ' ')
          configs.endpoint = configs.endpoint.replace(`${auth}@`, '')
        }

        configs.compress = configs.headers['content-encoding']
      })
    })

  return parsedEndpoints
}

const parseKeepAlive = (headers) => ('' + headers['keep-alive'])
  .split(/[\s,]+/)
  .map(v => v.split(/[\s=]+/g))
  .filter(a => a.length === 2 && a[0] && a[1])
  .reduce((acc, [k, v]) => (acc[k.toLowerCase()] = v) && acc, {})

module.exports = { parseEndpoints, parseKeepAlive }
