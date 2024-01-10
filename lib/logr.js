function mkLogr (konsole, libName) {
  try {
    return require(libName)
  } catch (error) {
    konsole.error(error)
  }

  return {
    mkLogr: undefined,
    trace: konsole.trace,
    info: konsole.info,
    error: konsole.error,
    debug: konsole.debug,
    warn: konsole.warn
  }
}
const logr = mkLogr(console, '@everymundo/simple-logr')

logr.mkLogr = mkLogr

module.exports = logr
