const Response = require('../classes/Response.class.js')

const buildResponse = (endpoint, inputData, headers, compress, start, method, attempt = 1) => {
  console.warn('DEPRECATION WARING! buildResponse will be removed! use new Response() instead')

  return new Response(endpoint, inputData, headers, compress, start, method, attempt)
}

module.exports = buildResponse
