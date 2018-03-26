'require strict';

/* eslint-env mocha */
/* eslint-disable import/no-unresolved, no-unused-expressions */

describe('lib/addQueryToPath.js', () => {
  const
    { sandbox }  = require('sinon'),
    { expect }   = require('chai'),
    // { clone }    = require('@everymundo/simple-clone'),
    // cleanrequire = require('@everymundo/cleanrequire'),
    // noop = () => { },
    loadLib = () => require('../lib/add-query-to-path');

  // eslint-disable-next-line one-var-declaration-per-line
  let box;

  beforeEach(() => { box = sandbox.create(); });
  afterEach(() => { box.restore(); });

  describe('#addQueryToPath', () => {
    const { addQueryToPath } = loadLib();

    context('when query is empty', () => {
      it('should return inputPath', () => {
        const query = undefined;
        const path  = '/something';

        const result = addQueryToPath(query, path);

        expect(result).to.equal(path);
      });
    });

    context('when query is an object', () => {
      it('should return the correct concatenated string', () => {
        const
          query    = {var1: 'value1', var2: 'v2'},
          path     = '/something',
          expected = `${path}?var1=value1&var2=v2`;

        const result = addQueryToPath(query, path);

        expect(result).to.equal(expected);
      });
    });

    context('when query is a string', () => {
      context('that already includes ?', () => {
        it('should return the correct concatenated string', () => {
          const
            query = '?name=daniel&descr=awesome',
            path = '/something',
            expected = '/something?name=daniel&descr=awesome';

          const result = addQueryToPath(query, path);

          expect(result).to.equal(expected);
        });
      });

      context('that DOES NOT include ?', () => {
        it('should return the correct concatenated string', () => {
          const
            query = 'name=daniel&descr=awesome',
            path = '/something',
            expected = '/something?name=daniel&descr=awesome';

          const result = addQueryToPath(query, path);

          expect(result).to.equal(expected);
        });
      });
    });

    context('when path already includes the ?', () => {
      it('should return the correct concatenated string', () => {
        const
          query = '?name=daniel&descr=awesome',
          path = '/something?crazy=true',
          expected = '/something?crazy=true&name=daniel&descr=awesome';

        const result = addQueryToPath(query, path);

        expect(result).to.equal(expected);
      });
    });
  });
});
