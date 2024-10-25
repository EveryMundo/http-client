const Endpoint = require('../classes/Endpoint.class.js')
const httpClient = require('../index.js')

const fetch = (url, options = {}) => {
  const {
    // credentials,
    headers = {},
    referrer,
    // referrerPolicy,
    body,
    // mode,
    method = body ? 'POST' : 'GET'
  } = options

  const endpoint = new Endpoint(url, headers)

  if (referrer != null) {
    endpoint.headers.set('referrer', referrer)
  }

  endpoint.method = method

  return httpClient.promiseDataTo(endpoint, body)
}

module.exports = { fetch, httpClient }
