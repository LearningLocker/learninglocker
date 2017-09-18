import { expect } from 'chai';
import QueryBuilderCache from 'lib/models/querybuildercache';
import QueryBuilderCacheValue from 'lib/models/querybuildercachevalue';
import mongoose from 'mongoose';
import addIdentsToCache from '.';

const objectId = mongoose.Types.ObjectId;
const organisation = objectId();
const value = 'Hello World';
const path = ['persona', 'import', 'foobar'];
const key = path.join('.');

const assertCount = model => (expectedCount, query) =>
  model.count(query).then((actualCount) => {
    expect(actualCount).to.equal(expectedCount);
  });

const assertCacheKeys = assertCount(QueryBuilderCache);
const assertCacheValues = assertCount(QueryBuilderCacheValue);

describe('addIdentsToCache', () => {
  beforeEach((done) => {
    Promise.all([
      QueryBuilderCache.remove({}),
      QueryBuilderCacheValue.remove({}),
    ]).then(() => done(), done);
  });
  const uniqueIdentifier = { key: 'statement.actor.mbox', value: 'mailto:test@example.com' };

  it('should udapte the query builder cache for one ident', (done) => {
    addIdentsToCache(
      organisation,
      [uniqueIdentifier, { key, value }]
    ).then(() =>
      Promise.all([
        assertCacheKeys(1, {
          organisation,
          path,
          searchString: key,
          valueType: 'String',
        }),
        assertCacheValues(1, {
          organisation,
          path: key,
          hash: JSON.stringify(value),
          value,
          display: value,
          valueType: 'String',
          searchString: JSON.stringify(value),
        })
      ])
    ).then(() => done(), err => done(err));
  });

  it('should not update the query builder cache for no idents', (done) => {
    addIdentsToCache(
      organisation,
      [uniqueIdentifier]
    ).then(() =>
      Promise.all([
        assertCacheKeys(0, {}),
        assertCacheValues(0, {})
      ])
    ).then(() => done(), err => done(err));
  });
});
