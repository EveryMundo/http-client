const zlib = require('zlib')

const decompressBuffer = (buffer, contentEncodingHeader) => {
  if (Buffer.byteLength(buffer) === 0 || contentEncodingHeader == null) {
    return buffer
  }

  if (contentEncodingHeader === 'gzip') {
    return zlib.gunzipSync(buffer)
  }

  if (contentEncodingHeader === 'deflate') {
    return zlib.inflateSync(buffer)
  }

  if (contentEncodingHeader === 'br') {
    return zlib.brotliDecompressSync(buffer)
  }

  return buffer
}

module.exports = { decompressBuffer }
