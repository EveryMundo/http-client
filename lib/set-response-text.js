const zlib = require('zlib');

const setResTxt = (res, buffer) => new Promise((resolve, reject) => {
  if (res.headers['content-encoding'] !== 'gzip') {
    return resolve(buffer.toString('utf-8'));
  }

  zlib.gunzip(buffer, (err, buff) => {
    if (err) return reject(err);

    resolve(Buffer.from(buff).toString('utf-8'));
  });
});

module.exports = { setResTxt };
