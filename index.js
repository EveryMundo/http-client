const lazy = require('@danielsan/node-lazy-loader')(module)

module.exports = {
  get Endpoint () { return lazy('Endpoint', './classes/Endpoint.class') },
  get GetEndpoint () { return lazy('GetEndpoint', './classes/GetEndpoint.class') },
  get PostEndpoint () { return lazy('PostEndpoint', './classes/PostEndpoint.class') },
  get Headers () { return lazy('Headers', './classes/Headers.class') },
  get fetch () { return lazy('fetch', './lib/fetch', 'fetch') },
  get promiseDataTo () { return lazy('promiseDataTo', './lib/promise-data-to', 'promiseDataTo') },
  get promisePost () { return lazy('promisePost', './lib/promise-data-to', 'promiseDataTo') },
  get post () { return lazy('post', './lib/promise-data-to', 'promiseDataTo') },
  get parseEndpoints () { return lazy('parseEndpoints', './lib/parse-endpoints', 'parseEndpoints') },
  get urlToEndpoint () { return lazy('urlToEndpoint', './lib/url-to-endpoint', 'urlToEndpoint') },
  get promiseGet () { return lazy('promiseGet', './lib/promise-get', 'promiseGet') },
  get get () { return lazy('get', './lib/promise-get', 'promiseGet') },
  head (url, options = { method: null }) { options.method = 'HEAD'; return this.fetch(url, options) }
}
