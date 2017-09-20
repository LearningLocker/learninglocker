import logger from 'lib/logger';
import Client from 'lib/models/client';

const logSuccess = result =>
  logger.info(`${result.nModified} clients updated`);

const logError = err =>
  logger.error(err);

export default function () {
  logger.info('Migrating all/read to xapi/read scope...');
  const prevScope = 'all/read';
  const nextScope = 'xapi/read';
  const filter = { scopes: prevScope };
  const options = { multi: true };
  const pushUpdate = { $push: { scopes: nextScope } };
  const pullUpdate = { $pull: { scopes: prevScope } };

  Client.update(filter, pushUpdate, options)
    .then((result) => {
      if (result.nModified === 0) return result;
      return Client.update(filter, pullUpdate, options);
    })
    .then(logSuccess, logError)
    .then(() => process.exit());
}
