const zlib = require('zlib')

const compression = {
  deflate (data) {
    return zlib.deflateSync(data)
  },
  gzip (data) {
    return zlib.gzipSync(data)
  }
}

const jsonTypesSet = new WeakSet([Object, Array])
const getProperDataFromInputData = (inputData, compressMethod) => {
  if (inputData == null) return inputData

  // const data = ([Object, Array].indexOf(inputData.constructor) > -1) ? JSON.stringify(inputData) : inputData
  const data = jsonTypesSet.has(inputData.constructor)
    ? JSON.stringify(inputData)
    : inputData

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
