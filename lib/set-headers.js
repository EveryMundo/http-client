const setHeaders = (headers, data, compress) => {
  if (headers['content-type'] === undefined) {
    headers['content-type'] = 'application/json'
  }

  if (data) {
    headers['content-length'] = Buffer.byteLength(data)
  }

  // if (compress && ['deflate', 'gzip'].includes(compress)) {
  if (compress && (compress === 'deflate' || compress === 'gzip')) {
    headers['content-encoding'] = compress
  }

  return headers
}

module.exports = { setHeaders }
