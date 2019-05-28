const { promiseGet } = require('./lib/promise-get')
const { promiseDataTo } = require('./lib/promise-data-to')
const { urlToEndpoint } = require('./lib/url-to-endpoint')
const { parseEndpoints } = require('./lib/parse-endpoints')

module.exports = {
  promiseDataTo,
  parseEndpoints,
  urlToEndpoint,
  promiseGet
}
