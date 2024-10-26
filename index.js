const { Endpoint, GetEndpoint, PostEndpoint } = require('./classes/Endpoint.class.js')
const Headers = require('./classes/Headers.class.js')
const Response = require('./classes/Response.class.js')
const { parseEndpoints } = require('./lib/parse-endpoints.js')
const { promiseDataTo } = require('./lib/promise-data-to.js')

const urlToEndpoint = (url, headers, agent) => new Endpoint(url, headers || null, agent)

module.exports = {
  Endpoint,
  GetEndpoint,
  PostEndpoint,
  Headers,
  Response,
  parseEndpoints,
  urlToEndpoint,
  promiseDataTo,
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
