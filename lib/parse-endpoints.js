'use strict'

/* eslint-disable no-console */
const Endpoint = require('../classes/Endpoint.class')

const validateEndpointProtocol = endpointKey => (urlString) => {
  if (/^https?:/.test(urlString)) return true

  throw new Error(`endpointKey: [${endpointKey}] has an invalid endpoint [${urlString}]`)
}

const parseEndpoints = (pattern = /^(MAIN)_ENDPOINT$/) => {
  const parsedEndpoints = {}
  Object
    .keys(process.env)
    .filter(envVar => pattern.test(envVar))
    .sort()
    .forEach((envVar) => {
      const match = envVar.match(pattern)
      const endpointKey = match[1] || match[0]

      if (parsedEndpoints[endpointKey]) {
        throw new Error(`${endpointKey} present twice`)
      }

      const endpoints = process.env[envVar]
        .split(/[|,;\s]+/)
        .filter(validateEndpointProtocol(endpointKey))

      const headersEnv = `${envVar}_HEADERS`
      const rawHeaders = process.env[headersEnv] ? process.env[headersEnv].split('|||') : []

      parsedEndpoints[endpointKey] = new Array(endpoints.length)

      for (let i = endpoints.length; i--;) {
        parsedEndpoints[endpointKey][i] = new Endpoint(endpoints[i], rawHeaders[i] && JSON.parse(rawHeaders[i]))
      }
    })

  return parsedEndpoints
}

/*
const parseEndpointsOld = (pattern = /^(MAIN)_ENDPOINT$/) => {
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
        const { protocol, hostname, port, path, auth } = parseUrl(endpoint)
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
            const { max, timeout } = parseKeepAliveHeader(headers[ix])

            configs.agent = new configs.http.Agent({
              keepAlive: true,
              maxSockets: Math.abs(max) || 50,
              timeout: Math.abs(timeout) || undefined
            })
          }
        }

        // auth
        if (auth) {
          configs.headers.authorization = auth.replace(':', ' ')
          configs.endpoint = configs.endpoint.replace(`${auth}@`, '')
        }

        configs.compress = configs.headers['content-encoding']
      })
    })

  return parsedEndpoints
} */

// to benchmark
// const parseKeepAlive2 = keepAlive => Object.fromEntries(keepAlive
//   .split(/[\s,]+/)
//   .map(x => { const [k, v] = x.split(/[\s=]+/g); return [k.toLowerCase(), v] })
// )

module.exports = {
  // parseEndpoints: parseEndpointsOld,
  parseEndpoints
}
