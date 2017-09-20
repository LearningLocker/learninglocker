import logger from 'lib/logger';
import PersonaIdentifier from 'lib/models/personaidentifier';
import QueryBuilderCache from 'lib/models/querybuildercache';
import QueryBuilderCacheValue from 'lib/models/querybuildercachevalue';
import { getCachesFromIdent, saveCaches } from 'lib/services/querybuildercache';

const logStart = () =>
  logger.info('Adding persona identifiers to cache paths and values...');

const logSuccess = results =>
  logger.info(`${results.length} models updated`);

const logError = err =>
  logger.error(err);

const handleDoc = (doc, { pathsBatch, valuesBatch }) => {
  const organisation = doc.organisation;
  const caches = getCachesFromIdent(doc.identifiers);
  saveCaches(caches, organisation, pathsBatch, valuesBatch);
};

export default function () {
  logStart();
  PersonaIdentifier.find({})
    .then((docs) => {
      const pathsBatch = QueryBuilderCache.collection.initializeUnorderedBulkOp();
      const valuesBatch = QueryBuilderCacheValue.collection.initializeUnorderedBulkOp();
      return { docs, pathsBatch, valuesBatch };
    })
    .then(({ docs, pathsBatch, valuesBatch }) => {
      docs.forEach(doc =>
        handleDoc(doc, { pathsBatch, valuesBatch })
      );
      return { pathsBatch, valuesBatch };
    }).then(({ pathsBatch, valuesBatch }) =>
      Promise.all([
        pathsBatch.execute({ w: 0 }),
        valuesBatch.execute({ w: 0 })
      ])
    )
    .then(logSuccess, logError)
    .then(() => process.exit());
}
