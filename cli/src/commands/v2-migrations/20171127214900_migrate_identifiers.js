import highland from 'highland';
import logger from 'lib/logger';
import { getConnection } from 'lib/connections/mongoose';

const connection = getConnection();
const attributesCollectionName = 'personaAttributes';
const oldIdentsCollectionName = 'personaidentifiers';
const newIdentsCollectionName = 'personaIdentifiers';

const processStream = stream =>
  new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.apply(resolve);
  });

const migrateIdentifierBatch = (docs) => {
  const collection = connection.collection(attributesCollectionName);
  const bulkOp = collection.initializeUnorderedBulkOp();
  docs.forEach((doc) => {
    doc.identifiers.forEach(({ key, value }) => {
      const personaId = doc.persona;
      const attribute = { personaId, key, value };
      bulkOp.insert(attribute);
    });
  });
  return highland(bulkOp.execute());
};

const createAttributesFromIdentifiers = async () => {
  const batchSize = 10;
  const filter = {};
  const collection = connection.collection(oldIdentsCollectionName);
  const docStream = highland(collection.find(filter));
  const migrationStream = docStream.batch(batchSize).flatMap(migrateIdentifierBatch);
  await processStream(migrationStream);
};

const updateIdentifierFields = async () => {
  const filter = {};
  const update = {
    $unset: { identifiers: '', personaScores: '' },
    $rename: { uniqueIdentifier: 'ifi' },
  };
  const opts = { multi: true };
  const collection = connection.collection(newIdentsCollectionName);
  await collection.update(filter, update, opts);
};

const cloneIdentifiersToNewCollection = async () => {
  const pipeline = [{ $match: {} }, { $out: newIdentsCollectionName }];
  await connection.collection(oldIdentsCollectionName).aggregate(pipeline);
};

const up = async () => {
  await createAttributesFromIdentifiers();
  await cloneIdentifiersToNewCollection();
  await updateIdentifierFields();
  logger.info(`You may want to delete the now unused ${oldIdentsCollectionName} collection`);
};

const down = async () => {
  logger.info('Not implemented');
};

export default { up, down };
