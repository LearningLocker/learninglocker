import QueryBuilderCache from 'lib/models/querybuildercache';
import QueryBuilderCacheValue from 'lib/models/querybuildercachevalue';
import logger from 'lib/logger';
import {
  getCachesFromStatement,
  saveCachePaths,
  saveCacheValues
} from 'lib/services/querybuildercache';

export default async (model, organisation) => {
  const pathsBatch = QueryBuilderCache.collection.initializeUnorderedBulkOp();
  const valuesBatch = QueryBuilderCacheValue.collection.initializeUnorderedBulkOp();
  const caches = getCachesFromStatement(model);
  saveCachePaths(caches, organisation, pathsBatch);
  saveCacheValues(caches, organisation, valuesBatch);
  try {
    await Promise.all([
      pathsBatch.execute({ w: 0 }), // write concern set to 0 to supress warnings of duplicate key errors
      valuesBatch.execute({ w: 0 }) //  these are expected, letting mongo assert the uniqueness is the fastest way
    ]);
  } catch (err) {
    logger.error(err);
  }
};
