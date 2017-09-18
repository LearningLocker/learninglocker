import { saveCachePaths, saveCacheValues } from 'lib/services/querybuildercache';

export default (caches, organisation, pathsBatch, valuesBatch) => {
  saveCachePaths(caches, organisation, pathsBatch);
  saveCacheValues(caches, organisation, valuesBatch);
};
