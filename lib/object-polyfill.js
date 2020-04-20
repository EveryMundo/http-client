module.exports = (Object) => {
  if (typeof Object.fromEntries !== 'function') {
    // eslint-disable-next-line no-return-assign,no-sequences
    Object.fromEntries = entries => Array.from(entries).reduce((o, [k, v]) => (o[k] = v, o), {})
  }
}
