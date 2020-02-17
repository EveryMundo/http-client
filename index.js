const { promiseGet } = require('./lib/promise-get')
const { promiseDataTo } = require('./lib/promise-data-to')
const { urlToEndpoint } = require('./lib/url-to-endpoint')
const { parseEndpoints } = require('./lib/parse-endpoints')
const { fetch } = require('./lib/fetch')

module.exports = {
  Endpoint: require('./classes/Endpoint.class'),
  GetEndpoint: require('./classes/GetEndpoint.class'),
  PostEndpoint: require('./classes/PostEndpoint.class'),
  Headers: require('./classes/Headers.class'),
  fetch,
  promiseDataTo,
  parseEndpoints,
  urlToEndpoint,
  promiseGet
}
