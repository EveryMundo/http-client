const lazy = require('@danielsan/node-lazy-loader')(module)
const { Endpoint, GetEndpoint, PostEndpoint } = require('./classes/Endpoint.class.js')
const Headers = require('./classes/Headers.class.js')
const Response = require('./classes/Response.class.js')

const urlToEndpoint = (url, headers, agent) => new Endpoint(url, headers || null, agent)

module.exports = {
  Endpoint,
  GetEndpoint,
  PostEndpoint,
  Headers,
  Response,
  get parseEndpoints () { return lazy('parseEndpoints', './lib/parse-endpoints', 'parseEndpoints') },
  urlToEndpoint,
  promiseDataTo: Endpoint.post,
  promiseGet: Endpoint.get,
  promisePost: Endpoint.post,
  fetch: Endpoint.fetch,
  get: Endpoint.get,
  post: Endpoint.post,
  patch: Endpoint.patch,
  put: Endpoint.put,
  head: Endpoint.head
}
