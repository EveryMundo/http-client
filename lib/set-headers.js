const setHeaders = (headers, data, compress) => {
  const headerKeys = Object.keys(headers);

  const contentType = headerKeys.find(key => key.toLowerCase() === 'content-type');
  if (!headers[contentType]) headers['content-type'] = 'application/json';

  if (data) headers['content-length'] = Buffer.byteLength(data);

  if (compress && ['deflate', 'gzip'].includes(compress)) {
    headers['content-encoding'] = compress;
  }
};

module.exports = { setHeaders };
