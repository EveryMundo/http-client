const logr = require('@everymundo/simple-logr')
const buildResponse = require('./build-response')

function simulatedResponse (endpoint, inputData, headers, compress, start) {
  // const
  //   stats = {
  //     code: 222,
  //     start,
  //     end: Date.now(),
  //     endpoint,
  //     resTxt: '{"success":true,"data":[]}',
  //     dataType: inputData && inputData.constructor.name,
  //     dataLen: Array.isArray(inputData) && inputData.length
  //   }

  const stats = buildResponse(endpoint, inputData, headers, compress, start)
  stats.code = 222
  stats.end = Date.now()

  logr.info(`process.env.SIMULATE=${process.env.SIMULATE}`)

  return stats
}

module.exports = { simulatedResponse }
