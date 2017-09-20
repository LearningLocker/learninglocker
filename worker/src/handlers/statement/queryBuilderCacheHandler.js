import QueryBuilderCache from 'lib/models/querybuildercache';
import QueryBuilderCacheValue from 'lib/models/querybuildercachevalue';
import wrapHandlerForStatement from 'worker/handlers/statement/wrapHandlerForStatement';
import { STATEMENT_QUERYBUILDERCACHE_QUEUE } from 'lib/constants/statements';
import { each, isArray } from 'lodash';
import {
  getCachesFromStatement,
  saveCachePaths,
  saveCacheValues
} from 'lib/services/querybuildercache';
import Promise from 'bluebird';

const promiseResolver = (cachePathsBatch, cacheValuesBatch, done) => Promise.all([
  cachePathsBatch.execute({ w: 0 }), // write concern set to 0 to supress warnings of duplicate key errors
  cacheValuesBatch.execute({ w: 0 }) //  these are expected, letting mongo assert the uniqueness is the fastest way
])
.then((result) => {
  done(null, result);
})
.catch((err) => {
  done(err);
});

const handleStatement = (pathsBatch, valuesBatch, statement) => {
  const organisation = statement.organisation;
  const caches = getCachesFromStatement(statement);
  saveCachePaths(caches, organisation, pathsBatch);
  saveCacheValues(caches, organisation, valuesBatch);
};

export const queryBuilderCacheStatementHandler = (statements, done) => {
  const pathsBatch = QueryBuilderCache.collection.initializeUnorderedBulkOp();
  const valuesBatch = QueryBuilderCacheValue.collection.initializeUnorderedBulkOp();

  if (isArray(statements)) {
    each(statements, handleStatement.bind(null, pathsBatch, valuesBatch));
  } else {
    handleStatement(pathsBatch, valuesBatch, statements);
  }

  return promiseResolver(pathsBatch, valuesBatch, done);
};

export default wrapHandlerForStatement(
  STATEMENT_QUERYBUILDERCACHE_QUEUE,
  queryBuilderCacheStatementHandler
);
