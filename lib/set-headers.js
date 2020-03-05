const setHeaders = (headers, data, compress) => {
  if (data) {
    headers['content-length'] = Buffer.byteLength(data)
  }

  if (compress && (compress === 'deflate' || compress === 'gzip')) {
    headers['content-encoding'] = compress
  }

  return headers
}

module.exports = { setHeaders }
