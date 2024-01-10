const zlib = require('zlib')

const compression = {
  deflate (data) {
    return zlib.deflateSync(data)
  },
  gzip (data) {
    return zlib.gzipSync(data)
  }
}

const getProperDataFromInputData = (inputData, compressMethod) => {
  if (inputData == null) return inputData

  const data = inputData instanceof Buffer || typeof inputData === 'string'
    ? inputData
    : JSON.stringify(inputData)

  if (compressMethod && compression[compressMethod]) {
    return compression[compressMethod](data).toString('base64')
  }

  return data
}

module.exports = {
  getDataFromXData: getProperDataFromInputData,
  getProperDataFromInputData,
  compression
}
