class Headers extends Map {
  #value = undefined
  #hasChanged = true

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

    return this
  }

  toJSON () {
    return Object.fromEntries(this.entries())
  }

  toObject () {
    if (this.#hasChanged) {
      this.#value = this.toJSON()
      this.#hasChanged = false
    }

    return this.#value
  }
}

module.exports = Headers
