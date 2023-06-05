'use strict'

const { Endpoint } = require('../classes/Endpoint.class')
const urlToEndpoint = (url, headers, agent) => new Endpoint(url, headers || null, agent)

module.exports = { urlToEndpoint }
