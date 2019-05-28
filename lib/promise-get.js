const { promiseDataTo } = require('../lib/promise-data-to')

const promiseGet = ({
  protocol,
  http,
  host,
  port,
  query,
  path,
  endpoint,
  headers,
  agent,
  maxRetry
}) => {
  const config = {
    protocol,
    http,
    host,
    port,
    query,
    path,
    endpoint,
    headers,
    agent,
    maxRetry,
    method: 'GET'
  }

  return promiseDataTo(config)
}

module.exports = { promiseGet }
