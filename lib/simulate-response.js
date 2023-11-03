const logr = require('../lib/logr.js')
const Response = require('../classes/Response.class.js')

function simulatedResponse (endpoint, inputData, headers, compress, start) {
  const stats = new Response(endpoint, inputData, headers, compress, start)
  stats.code = 222
  stats.end = Date.now()

  logr.info(`process.env.SIMULATE=${process.env.SIMULATE}`)

  return stats
}

module.exports = { simulatedResponse }
