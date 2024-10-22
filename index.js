const { Endpoint, GetEndpoint, PostEndpoint } = require('./classes/Endpoint.class.js')
const Headers = require('./classes/Headers.class.js')
const Response = require('./classes/Response.class.js')
const { parseEndpoints } = require('./lib/parse-endpoints.js')

const urlToEndpoint = (url, headers, agent) => new Endpoint(url, headers || null, agent)

module.exports = {
  Endpoint,
  GetEndpoint,
  PostEndpoint,
  Headers,
  Response,
  parseEndpoints,
  urlToEndpoint,
  promiseDataTo: Endpoint.post,
  promiseGet: Endpoint.get,
  promisePost: Endpoint.post,
  fetch: Endpoint.fetch,
  get: Endpoint.get,
  post: Endpoint.post,
  patch: Endpoint.patch,
  put: Endpoint.put,
  head: Endpoint.head,
  delete: Endpoint.delete
}
