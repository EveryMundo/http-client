const Endpoint = require('./Endpoint.class')

class GetEndpoint extends Endpoint {
  constructor (url, headers, agent) {
    super(url, headers, agent)

    this.method = 'GET'
  }
}

module.exports = GetEndpoint
