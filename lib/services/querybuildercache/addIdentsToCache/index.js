import QueryBuilderCache from 'lib/models/querybuildercache';
import QueryBuilderCacheValue from 'lib/models/querybuildercachevalue';
import { getCachesFromIdent, saveCaches } from 'lib/services/querybuildercache';

export default (organisation, identifiers) => {
  const pathsBatch = QueryBuilderCache.collection.initializeUnorderedBulkOp();
  const valuesBatch = QueryBuilderCacheValue.collection.initializeUnorderedBulkOp();
  const caches = getCachesFromIdent(identifiers);
  if (Array.isArray(caches) && caches.length > 0) {
    saveCaches(caches, organisation, pathsBatch, valuesBatch);
    return Promise.all([
      pathsBatch.execute({ w: 0 }),
      valuesBatch.execute({ w: 0 })
    ]);
  }
  return Promise.resolve();
};
