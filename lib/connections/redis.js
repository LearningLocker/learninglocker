import redis from 'redis';
import logger from 'lib/logger';
import Promise from 'bluebird';

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

export const getOptions = () => {
  const options = {};

  // these options should only be set in the config if present (even defaults shouldnt be provided)
  if (process.env.REDIS_PASSWORD) options.auth_pass = process.env.REDIS_PASSWORD;
  if (process.env.REDIS_DB) options.db = process.env.REDIS_DB;

  return options;
};

export const createClient = () => {
  let client;
  try {
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT || 6379;
    const url = `redis://${host}:${port}`;
    const options = getOptions();
    client = redis.createClient(url, options);
  } catch (e) {
    logger.error("Couldn't connect to redis", e);
  }

  return client;
};
