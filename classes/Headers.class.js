require('../lib/object-polyfill')(Object)

class Headers extends Map {
  constructor (entries) {
    if (Array.isArray(entries) || entries instanceof Headers) {
      super(entries)
    } else if (entries instanceof Object) {
      super(Object.entries(entries))
    } else {
      super()
    }
  }

  set (k, v) {
    const name = k.toLowerCase()
    if (name === 'keep-alive') {
      super.set('connection', 'Keep-Alive')
    }

    super.set(name, v)
    this._hasChanged = true

    return this
  }

  toJSON () {
    return Object.fromEntries(this.entries())
  }

  toObject () {
    if (this._hasChanged) {
      this._value = this.toJSON()
      this._hasChanged = false
    }

    return this._value
  }
}

Object.defineProperties(Headers.prototype, {
  _value: { value: null, writable: true, enumerable: false },
  _hasChanged: { value: true, writable: true, enumerable: false }
})

module.exports = Headers
