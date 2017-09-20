import logger from 'lib/logger';
import * as redis from 'lib/connections/redis';
import cachePrefix from 'lib/helpers/cachePrefix';
import async from 'async';

const clearPrefix = (prefix, callback) => {
  const redisClient = redis.createClient();

  logger.info(`Clearing cache keys starting with "${prefix}"`);
  redisClient.keys(`${prefix}*`, (err, rows) => {
    async.each(rows, (row, callbackDelete) => {
      redisClient.del(row, callbackDelete);
    }, callback.bind(null, { total: rows.length }));
  });
};

export default function (options) {
  const orgId = options.orgId || false;
  let aggregationPrefix;
  if (orgId) {
    aggregationPrefix = cachePrefix(`${orgId}-AGGREGATION-*`);
  } else {
    aggregationPrefix = cachePrefix('*-AGGREGATION-*');
  }
  clearPrefix(aggregationPrefix, (data) => {
    logger.info(`Cleared ${data.total} keys`);
    process.exit();
  });
}
