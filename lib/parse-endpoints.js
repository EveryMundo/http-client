'use strict'

const { Endpoint } = require('../classes/Endpoint.class.js')

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

module.exports = {
  parseEndpoints
}
