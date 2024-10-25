const httpClient = require('../lib/promise-data-to.js')

const promiseGet = async (_endpoint) => {
  const endpoint = httpClient.getEndpoint(_endpoint)
  // endpoint.method = 'GET'

  return httpClient.promiseDataTo(endpoint, undefined, { method: 'GET' })
}

module.exports = { promiseGet }
