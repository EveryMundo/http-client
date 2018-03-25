'use strict';

const querystring = require('querystring');

const addQueryToPath = (inputQuery, path) => {
  if (!inputQuery) return path;

  let query = inputQuery;

  if (typeof inputQuery !== 'string') {
    query = querystring.stringify(inputQuery);
  }

  if (query.indexOf('?') === 0) {
    query = query.substr(1);
  }

  const joinChar = path.includes('?') ? '&' : '?';

  return `${path}${joinChar}${query}`;
};

module.exports = { addQueryToPath };
