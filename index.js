const
  { promiseDataTo }  = require('./lib/promise-data-to'),
  { urlToEndpoint }  = require('./lib/url-to-endpoint'),
  { parseEndpoints } = require('./lib/parse-endpoints');

module.exports = {
  promiseDataTo,
  parseEndpoints,
  urlToEndpoint,
};
