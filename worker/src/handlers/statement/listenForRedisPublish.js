import async from 'async';
import logger from 'lib/logger';
import Statement from 'lib/models/statement';
import statementHandler from 'worker/handlers/statement/statementHandler';
import * as redis from 'lib/connections/redis';
import cachePrefix from 'lib/helpers/cachePrefix';

const redisOpts = redis.getOptions();

export default () => {
  const subClient = redis.createClient();
  const pubClient = redis.createClient();
  const subKey = cachePrefix('statement.notify'); // subscribe channel is not prefixed by bull, so must manually do this!
  const pubKey = cachePrefix('statement.new');
  logger.debug('Using redis options:', redisOpts);
  logger.info(`Subscribing to '${subKey}' and will rpop on key '${pubKey}'`);

  let currentlyWorking = false;
  subClient.on('message', (channel) => {
    logger.debug(`Message on channel '${channel}'`);

    if (!currentlyWorking) {
      currentlyWorking = true;
      let latestResult = null;
      // while there are payloads left in the work queue, process them
      async.doUntil(
        (cb) => {
          pubClient.rpop(pubKey, (err, payload) => {
            if (err) {
              logger.error('ERROR ON REDIS RPOP', err);
              cb(err);
            }
            latestResult = payload;
            if (payload) {
              logger.debug(`Popped '${pubKey}':`, payload);
              Statement.findOne({ 'statement.id': JSON.parse(payload).statementId }, (err, statement) => {
                // get the statement so that we can find its database id
                // push it straight into the correct queues
                statementHandler({ statementId: statement._id });
              });
            }
            cb();
          });
        },
        () => !latestResult,
        () => {
          currentlyWorking = false;
        }
      );
    }
  });
  subClient.subscribe(subKey);
};
