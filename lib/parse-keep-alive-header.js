const parseKeepAliveHeader = (headers) => headers['keep-alive'] && parseKeepAlive(headers['keep-alive'])

const parseKeepAlive = keepAlive => keepAlive
  .split(/[\s,]+/)
  .map(v => v.split(/[\s=]+/g))
  .filter(a => a.length === 2 && a[0] && a[1])
  .reduce((acc, [k, v]) => (acc[k.toLowerCase()] = v) && acc, {})

module.exports = {
  parseKeepAliveHeader,
  parseKeepAlive
}
