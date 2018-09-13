'use strict';

const
  logr = require('@everymundo/simple-logr'),
  { addQueryToPath }    = require('../lib/add-query-to-path'),
  { simulatedResponse } = require('../lib/simulate-response'),
  { setResTxt }         = require('../lib/set-response-text'),
  { getDataFromXData }  = require('../lib/get-data-from-xdata'),
  { setHeaders }        = require('../lib/set-headers'),
  protocols = {'http:': require('http'), 'https:': require('https')},
  SIMULATE = +process.env.SIMULATE,
  MAX_RETRY_ATTEMPTS = Math.abs(process.env.MAX_RETRY_ATTEMPTS) || 3,
  RETRY_TIMEOUT_MS   = Math.abs(process.env.RETRY_TIMEOUT_MS)   || 500;

const promiseDataTo = ({
  protocol,
  http,
  host,
  port,
  query,
  path,
  endpoint,
  headers = {},
  agent,
  method = 'POST',
  maxRetry = MAX_RETRY_ATTEMPTS,
  compress = false // eslint-disable-line comma-dangle
}, xData) => new Promise((resolve, reject) => {
  if (!http) http = protocols[protocol];
  // An object of options to indicate where to post to
  const
    // data = typeof xData === 'string' ? xData : JSON.stringify(xData),
    data = getDataFromXData(xData, compress),
    start = new Date(),
    post_options = {
      host,
      port,
      query,
      path: query ? addQueryToPath(query, path) : path,
      method,
      headers,
      agent,
    };

  let attempt = 1;

  if (SIMULATE) return resolve(simulatedResponse(start, xData));

  setHeaders(headers, data, compress);
  // if (!headers['Content-type']) headers['Content-type'] = 'application/json';

  // if (compress && ['deflate', 'gzip'].includes(compress)) {
  //   headers['Content-Encoding'] = compress;
  // }

  // if (data) headers['Content-Length'] = Buffer.byteLength(data);

  const post = () => {
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
              compress,
              requestHeaders: headers,
              responseHeaders: res.headers,
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
        logr.error('http.request', err);
        const stats = {
          code: 599,
          start,
          end: Date.now(),
          err,
          attempt,
          endpoint,
          compress,
          requestHeaders: headers,
        };
        tryAgain(err, stats);
      });

    // post the data
    if (['PUT', 'PATCH', 'POST'].includes(method.toUpperCase())) post_req.write(data);
    post_req.end();
  };

  function tryAgain(error, stats) {
    logr.error('tryAgain: attempt', attempt, 'has failed.', host + path, error);
    if (attempt < maxRetry) {
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


module.exports = {
  promiseDataTo,
  MAX_RETRY_ATTEMPTS,
  RETRY_TIMEOUT_MS,
  loadedAt: new Date(),
  getDataFromXData,
};
