const logr = require('@everymundo/simple-logr')

function simulatedResponse (start, endpoint, xData) {
  const
    stats = {
      code: 222,
      start,
      end: Date.now(),
      endpoint,
      resTxt: '{"success":true,"data":[]}',
      dataType: xData && xData.constructor.name,
      dataLen: Array.isArray(xData) && xData.length
    }

  logr.info(`process.env.SIMULATE=${process.env.SIMULATE}`)

  return stats
}

module.exports = { simulatedResponse }
