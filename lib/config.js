class Config {
  SIMULATE = undefined
  MAX_RETRY_ATTEMPTS = undefined
  RETRY_TIMEOUT_MS = undefined
  REQUEST_TIMEOUT_MS = undefined
  EMHC_LOG_LEVEL = undefined

  constructor (env) {
    this.SIMULATE = +env.SIMULATE || 0
    this.MAX_RETRY_ATTEMPTS = Math.abs(env.MAX_RETRY_ATTEMPTS) || 3
    this.RETRY_TIMEOUT_MS = env.RETRY_TIMEOUT_MS ? Math.abs(env.RETRY_TIMEOUT_MS) : 500
    this.REQUEST_TIMEOUT_MS = env.REQUEST_TIMEOUT_MS && Math.abs(env.REQUEST_TIMEOUT_MS)
    this.EMHC_LOG_LEVEL = env.EMHC_LOG_LEVEL || 'error'
  }
}

module.exports = new Config(process.env)
