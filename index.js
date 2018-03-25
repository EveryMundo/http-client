const
  { promiseGet }     = require('./lib/promise-get'),
  { promiseDataTo }  = require('./lib/promise-data-to'),
  { urlToEndpoint }  = require('./lib/url-to-endpoint'),
  { parseEndpoints } = require('./lib/parse-endpoints');

module.exports = {
  promiseDataTo,
  parseEndpoints,
  urlToEndpoint,
  promiseGet,
};
