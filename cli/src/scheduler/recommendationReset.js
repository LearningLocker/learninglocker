
import moment from 'moment';
import cachePrefix from 'lib/helpers/cachePrefix';
import { map } from 'bluebird';
import { publish as publishQueue } from 'lib/services/queue';
import { RECOMENDATION_RESET_QUEUE } from 'lib/constants/recommendation'
import * as redis from 'lib/connections/redis';

const redisClient = redis.createClient();


/**
 * Recommendation
 */
const RECOMMENDATION_LOCK_DURATION_SEC = 30;
const RECOMMENDATION_CACHE_KEY = cachePrefix('RECOMMENDATION_CACHE_KEY');

const runRecommendationReset = async ({
  timeout = setTimeout,
  publish = publishQueue,
  lockTimoutSec = RECOMMENDATION_LOCK_DURATION_SEC
}) => {
  const res = await redisClient.set(RECOMMENDATION_CACHE_KEY, 1, 'EX', lockTimoutSec, 'NX');

  if (res === 'OK') {
    logger.info('recommendation');
    const organisations = await Organisation.find({});

    const promises = map(organisations, (organisation) => {
      await publish({
        queueName: RECOMENDATION_RESET_QUEUE,
        payload: {
          organisationId: organisation._id.toString()
        }
      })
    });

    await Promise.all(promises);
  } else {
    logger.info('skip recommendation reset');
  }

  let nextRun = moment('02:00:00').diff(moment());
  if (nextRun.valueOf() < 0) {
    nextRun = nextRun.add(1, 'days');
  }
  setTimeout(runRecommendationReset, nextRun.valueOf());
}

export default runRecommendationReset;