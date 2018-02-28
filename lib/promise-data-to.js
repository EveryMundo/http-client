'use strict';

const
  logr = require('@everymundo/simple-logr'),
  zlib = require('zlib'),
  // escape       = require('querystring').escape,
  SIMULATE = +process.env.SIMULATE,
  MAX_RETRY_ATTEMPTS = Math.abs(process.env.MAX_RETRY_ATTEMPTS) || 3,
  RETRY_TIMEOUT_MS   = Math.abs(process.env.RETRY_TIMEOUT_MS)   || 500;
logr.debug({SIMULATE});
const setResTxt = (res, buffer) => new Promise((resolve) => {
  if (res.headers['content-encoding'] !== 'gzip') {
    return resolve(buffer.toString('utf-8'));
  }

  zlib.gunzip(buffer, (err, buff) => resolve(buff.toString('utf-8')));
});


const promiseDataTo = ({ http, host, port, path, endpoint, headers, method = 'POST'}, xData) => new Promise((resolve, reject) => {
  // An object of options to indicate where to post to
  const
    data = typeof xData === 'string' ? xData : JSON.stringify(xData),
    start = new Date(),
    post_options = {
      host,
      port,
      path,
      method,
      headers,
    };

  let attempt = 1;

  if (SIMULATE) return resolve(simulatedResponse(start, xData));

  if (!headers['Content-type']) headers['Content-type'] = 'application/json';

  if (data) headers['Content-Length'] = Buffer.byteLength(data);

  function post() {
    // Set up the request
    const post_req = http.request(post_options, (res) => {
      // res.setEncoding('utf8');
      const buffers = [];

      res
        .on('data', (chunk) => { buffers.push(chunk); })
        .on('end', () => {
          const buffer = Buffer.concat(buffers);

          setResTxt(res, buffer).then((resTxt) => {
            const stats = {
              code: res.statusCode,
              start,
              end: Date.now(),
              attempt,
              endpoint,
              resTxt,
              buffer,
              dataType: xData && xData.constructor.name,
              dataLen: Array.isArray(xData) && xData.length,
            };

            if (res.statusCode === 400) {
              logr.error({ resTxt });
              const err = new Error('400 Status');
              err.stats = stats;

              return reject(err);
            }

            if (res.statusCode > 400) {
              logr.error({ resTxt });
              return tryAgain(`Status Code: ${res.statusCode}`, stats);
            }

            if (res.statusCode > 299) {
              stats.err = new Error(`{"Response": ${stats.resTxt}, "statusCode": ${res.statusCode}, "data": ${data}}`);
              return resolve(stats);
            }

            resolve(stats);
          })
            .catch((err) => {
              logr.error(err);
              reject(err);
            });
        });
    })
      .on('error', (err) => {
        logr.error('ERROR!', err);
        const stats = {
          code: 599, start, end: Date.now(), err, attempt, endpoint,
        };
        tryAgain(err, stats);
      });

    // post the data
    if (['PUT', 'PATCH', 'POST'].includes(method.toUpperCase())) post_req.write(data);
    post_req.end();
  }

  function tryAgain(error, stats) {
    logr.error('tryAgain: attempt', attempt, 'has failed.', host + path, error);
    if (attempt < MAX_RETRY_ATTEMPTS) {
      return setTimeout(() => { post(++attempt); }, 500);
    }

    const err = error instanceof Error ? error : new Error(error);
    err.message = `tryAgain has exceeded max delivery attempts (${attempt}):${err.message}`;
    logr.error(err.message);
    stats.err = err;
    reject(stats);
  }

  post();
});

function simulatedResponse(start, endpoint, xData) {
  const
    stats = {
      code: 222,
      start,
      end: Date.now(),
      endpoint,
      resTxt: '{"success":true,"data":[]}',
      dataType: xData && xData.constructor.name,
      dataLen: Array.isArray(xData) && xData.length,
    };

  logr.log('process.env.SIMULATE', stats.dataLen);
  return stats;
}

module.exports = {
  promiseDataTo,
  simulatedResponse,
  MAX_RETRY_ATTEMPTS,
  RETRY_TIMEOUT_MS,
  loadedAt: new Date(),
};
