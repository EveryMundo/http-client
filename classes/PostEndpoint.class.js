const Endpoint = require('./Endpoint.class')

class PostEndpoint extends Endpoint {
  constructor (url, headers, agent) {
    super(url, headers, agent)

    this.method = 'POST'
  }
}

module.exports = PostEndpoint
