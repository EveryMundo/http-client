const setHeaders = (headers, data, compress) => {
  if (!headers['Content-type']) headers['Content-type'] = 'application/json';

  if (data) headers['Content-Length'] = Buffer.byteLength(data);

  if (compress && ['deflate', 'gzip'].includes(compress)) {
    headers['Content-Encoding'] = compress;
  }
};

module.exports = { setHeaders };
