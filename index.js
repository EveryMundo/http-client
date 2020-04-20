module.exports = {
  get Endpoint  () { return lazyCall(this, 'Endpoint', './classes/Endpoint.class') },
  get GetEndpoint  () { return lazyCall(this, 'GetEndpoint', './classes/GetEndpoint.class') },
  get PostEndpoint  () { return lazyCall(this, 'PostEndpoint', './classes/PostEndpoint.class') },
  get Headers () { return lazyCall(this, 'Headers', './classes/Headers.class') },
  get fetch () { return lazyCall(this, 'fetch', './lib/fetch', 'fetch') },
  get promiseDataTo () { return lazyCall(this, 'promiseDataTo', './lib/promise-data-to', 'promiseDataTo') },
  get parseEndpoints () { return lazyCall(this, 'parseEndpoints', './lib/parse-endpoints', 'parseEndpoints') },
  get urlToEndpoint () { return lazyCall(this, 'urlToEndpoint', './lib/url-to-endpoint', 'urlToEndpoint') },
  get promiseGet () { return lazyCall(this, 'promiseGet', './lib/promise-get', 'promiseGet') }
}

function lazyCall (o, property, file, subProperty) {
  const value = subProperty == null ? require(file) : require(file)[subProperty]

  return Object.defineProperty(o, property, { value })[property]
}
