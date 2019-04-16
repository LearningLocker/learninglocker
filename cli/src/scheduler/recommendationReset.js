
import moment from 'moment';
import cachePrefix from 'lib/helpers/cachePrefix';
import logger from 'lib/logger';
import { map } from 'bluebird';
import { publish as publishQueue } from 'lib/services/queue';
import { RECOMENDATION_RESET_QUEUE } from 'lib/constants/recommendation';
import * as redis from 'lib/connections/redis';
import Organisation from 'lib/models/organisation';

const redisClient = redis.createClient();


/**
 * Recommendation
 */
const RECOMMENDATION_LOCK_DURATION_SEC = 30;
const RECOMMENDATION_CACHE_KEY = cachePrefix('RECOMMENDATION_CACHE_KEY');

const runRecommendationReset = async ({
  timeout = setTimeout,
  publish = publishQueue,
  now = moment(),
  lockTimoutSec = RECOMMENDATION_LOCK_DURATION_SEC
}) => {
  const res =
    lockTimoutSec ?
      await redisClient.set(RECOMMENDATION_CACHE_KEY, 1, 'EX', lockTimoutSec, 'NX') :
      'OK';

  if (res === 'OK') {
    logger.info('recommendation');
    const organisations = await Organisation.find({});

    await map(organisations, async (organisation) => {
      await publish({
        queueName: RECOMENDATION_RESET_QUEUE,
        payload: {
          organisationId: organisation._id.toString()
        }
      });
    });
  } else {
    logger.info('skip recommendation reset');
  }

  let nextRun = moment('02:00:00', 'HH:mm:ss').diff(now);
  if (nextRun < 0) {
    nextRun = moment(nextRun).add(1, 'days');
  }
  timeout(runRecommendationReset, nextRun.valueOf());
};

export default runRecommendationReset;
