import logger from 'lib/logger';
import ScoringScheme from 'lib/models/scoringscheme';
import Organisation from 'lib/models/organisation';
import async from 'async';

export default function (options) {
  const orgId = options.orgId || false;
  const query = {};
  if (orgId) {
    logger.info(`Clearing scoring scheme for ${orgId}`);
    query.organisation = orgId;
  } else {
    logger.info('Clearing all scoring schemes');
  }


  // remove existing scoring schemes
  ScoringScheme.remove(query, (err) => {
    if (err) {
      logger.error(err);
      process.exit();
    }

    const orgQuery = {};
    if (orgId) orgQuery._id = orgId;
    Organisation.find(orgQuery, (err, models) => {
      logger.info(`Creating scoring scheme on ${models.length} organisations`);
      async.each(models,
        (org, asyncdone) => {
          new ScoringScheme({ organisation: org._id }).save(asyncdone);
        },
        (err) => {
          if (err) logger.error(err);
          logger.info('Scoring schemes updated');
          process.exit();
        }
      );
    });
  });
}
