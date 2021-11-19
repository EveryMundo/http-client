# http-client
[![Coverage Status](https://coveralls.io/repos/github/EveryMundo/http-client/badge.svg?branch=master)](https://coveralls.io/github/EveryMundo/http-client?branch=master)
![Node.js CI](https://github.com/EveryMundo/http-client/workflows/Node.js%20CI/badge.svg)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/EveryMundo/http-client/graphs/commit-activity)
[![CodeQL](https://github.com/EveryMundo/http-client/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/EveryMundo/http-client/actions/workflows/codeql-analysis.yml)

This is yet another nodejs promise based ```/https?/``` client.

## Features
* Automatically retries to send the requests when statusCode > 399
* Supports compressed POST
* Supports compressed GET

## Install
```sh
npm install @everymundo/http-client
```

## Usage
### POST some data
```js
const httpClient = require('@everymundo/http-client')

const headers = { 'content-type': 'application/json' }
const endpoint = new httpClient.PostEndpoint('http://your-host.com/path', headers)
const data = { myData:'Something' }

const res = await httpClient.promiseDataTo(endpoint, data)
// OR
const res = await httpClient.promisePost(endpoint, data)
// OR
const res = await httpClient.post(endpoint, data)
```

#### Write methods
If you want to use PUT or PATCH, just pass the method name on the options object, don't forget to use `.Endpoint` when creating the endpoint object
```js
const httpClient = require('@everymundo/http-client')

const headers = { 'content-type': 'application/json' }
// Note that httpClient.Endpoint is used instead of .PostEndpoint
const endpoint = new httpClient.Endpoint('http://your-host.com/path', headers)
// Here we set the write method desired
const options = { method: 'PUT'}
const data = { myData:'Something' }
const res = await httpClient.promiseDataTo(endpoint, data, options)
// OR
const res = await httpClient.promisePost(endpoint, data, options)
// OR
const res = await httpClient.post(endpoint, data, options)
```

### POST compressed data
```js
const httpClient = require('@everymundo/http-client')

const headers = { 'content-type': 'application/json', 'x-compression': 'gzip' }
const endpoint = new httpClient.PostEndpoint('http://your-host.com/path', headers)

// because of the x-compression header this will be gzipped after JSON.stringify
const res = await httpClient.post(endpoint, data)
```


### GET some data
```js
const httpClient = require('@everymundo/http-client')

const headers = { 'authorization': 'your token' }
const endpoint = new httpClient.GetEndpoint('http://your-host.com/path', headers)

const res = await httpClient.promiseGet(endpoint)
// OR
const res = await httpClient.get(endpoint)
```

### POST using the Fetch API
```js
const httpClient = require('@everymundo/http-client')

const headers = { 'authorization': 'your token' }
const res = await httpClient.fetch('http://your-host.com/path', { headers, body: data })
```

### HEAD request
```js
const httpClient = require('@everymundo/http-client')

const headers = { 'authorization': 'your token' }
const res = httpClient.head('http://your-host.com/path', { headers })
```

### GET using the Fetch API
```js
const { fetch } = require('@everymundo/http-client')

const headers = { 'authorization': 'your token' }
const res = await fetch('http://your-host.com/path', { headers })
```

### HEAD using the Fetch API
```js
const { fetch } = require('@everymundo/http-client')

const headers = { 'authorization': 'your token' }
const res = await fetch('http://your-host.com/path', { headers })
```

## Response Schema
```js
{
    statusCode, // the response statusCode
    code, // alias for statusCode [for backaward compatibility]
    err,
    method, // Request Method
    start, // Date Object captured right before starting the request
    end: Date.now(), // Int Timestamp from when the request has finished
    attempt, // the number of attempts of the retries
    endpoint, // the endpoint object either passed or generated from a string
    resTxt, // alias for responseText [for backaward compatibility]
    responseText, // the response buffer.toString()
    buffer, // uncompressed responseBuffer if that one is compressed, otherwise, responseBuffer
    responseBuffer, // raw response buffer
    dataType, // the name of the constructor of the posted data [Array, Object, String, Buffer]
    dataLen, // when posting arrays it shows the number of array items posted
    compress, // the type of compression for the POST request, if any. Valid values are gzip and deflate
    requestHeaders, // the headers used on the request
    responseHeaders // the headers received from the remote server
}
```
