const zlib = require('zlib')

const compression = {
  deflate (data) {
    return zlib.deflateSync(data)
  },
  gzip (data) {
    return zlib.gzipSync(data)
  }
}

const getDataFromXData = (xData, compressMethod) => {
  const data = (xData && [Object, Array].includes(xData.constructor)) ? JSON.stringify(xData) : xData

  if (compressMethod && compression[compressMethod]) {
    return compression[compressMethod](data)
  }

  return data
}

module.exports = {
  getDataFromXData,
  compression
}
