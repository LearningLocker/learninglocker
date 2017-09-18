import logger from 'lib/logger';
// import _ from 'lodash';
import Organisation from 'lib/models/organisation';
import LRS from 'lib/models/lrs';
import async from 'async';
import updateStatementCount from 'cli/commands/updateStatementCount';
import updateStatementOrganisation from 'cli/commands/updateStatementOrganisation';
import updateClientOrganisation from 'cli/commands/updateClientOrganisation';


export default function (orgId) {
  if (!(orgId)) {
    logger.error('OrgId is required.');
    process.exit();
  }

  Organisation.findById(orgId, (err, org) => {
    if (err) throw new Error(err);
    if (!org) {
      logger.info('Organisation not found. Existing.');
      process.exit();
    }

    logger.info(`Organisation ${org.name} found. Looking for all stores with no organisation`);
    LRS.find({ organisation: { $exists: false } }, (err, stores) => {
      logger.info(`Found ${stores.length} stores with no org`);
      async.each(
        stores,
        (store, done) => {
          logger.info(`Updating ${store.title}...`);
          store.organisation = org.id;
          store.save(done);
        },
        (err) => {
          if (err) logger.error(err);
          updateStatementOrganisation(updateClientOrganisation.bind(null, updateStatementCount));
        }
      );
    });
  });
}
