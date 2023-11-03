const logr = (() => {
  try {
    return require('@everymundo/simple-logr')
  } catch (error) {
    return {
      info: console.log,
      error: console.error,
      debug: console.log,
      warn: console.warn
    }
  }
})()

module.exports = logr
