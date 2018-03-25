const { promiseDataTo } = require('../lib/promise-data-to');

const promiseGet = (config) => {
  config.method = 'GET';

  return promiseDataTo(config);
};

module.exports = { promiseGet };
