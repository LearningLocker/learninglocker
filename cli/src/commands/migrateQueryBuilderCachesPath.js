import logger from 'lib/logger';
import highland from 'highland';
import querybuildercache from 'lib/models/querybuildercache';
import { isNull, dropRight, each } from 'lodash';

const count = a => a + 1;
const checkUnique = (a, b) => {
  const searchStringMatch = a.searchString === b.searchString;
  const orgMatch = a.organisation.equals(b.organisation);
  return searchStringMatch && orgMatch;
};

const createSubPaths = (queryBuilderCache) => {
  const subPath = dropRight(queryBuilderCache.path);
  if (subPath.length === 0) return null;

  queryBuilderCache.path = subPath;
  queryBuilderCache.searchString = subPath.join('.');
  delete queryBuilderCache._id;

  return queryBuilderCache;
};

const saveBatch = (queryBuilderCaches) => {
  const batch = querybuildercache.collection.initializeUnorderedBulkOp();
  try {
    each(queryBuilderCaches, (item) => {
      batch.insert(item);
    });
  } catch (ex) {
    console.error(ex);
  }
  const promise = batch
    .execute()
    .then((res) => {
      logger.info(`Completed batch of ${queryBuilderCaches.length}.`);
      return res;
    })
    .catch((error) => {
      logger.info(
        'Duplicate keys detected. May indicate that thsis migration has already been run.',
        error.message
      );
    });

  return highland(promise);
};

const logAndExit = (totalCount) => {
  logger.info(`Inserted ${totalCount} batches.`);
  process.exit();
};

export default async function () {
  logger.info('Adding new cache paths...');

  const cursor = querybuildercache.find().lean().cursor();

  const cacheStream = highland(cursor);

  cacheStream.on('error', (err) => {
    logger.error(err);
    process.exit();
  });

  cacheStream
    .map(createSubPaths)
    .reject(isNull)
    .uniqBy(checkUnique)
    .batch(500)
    .map(saveBatch)
    .parallel(10)
    .reduce(0, count)
    .apply(logAndExit);
};
