const setHeaders = (headers, data, compress) => {
  if (data) {
    headers['content-length'] = Buffer.byteLength(data)
  }

  if (compress && (compress === 'deflate' || compress === 'gzip')) {
    headers['x-compression'] = compress
    headers['content-transfer-encoding'] = 'base64'
  }

  return headers
}

module.exports = { setHeaders }
