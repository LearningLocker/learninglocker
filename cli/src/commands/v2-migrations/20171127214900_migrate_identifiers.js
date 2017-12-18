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
  const ops = docs.filter((doc) => {
    const identOps = doc.identifiers.filter(({ key, value }) => {
      if (!/^statement\./.test(key)) {
        const personaId = doc.persona;
        const organisation = doc.organisation;
        const newKey = key.replace('persona.import.', '');
        const attribute = { personaId, organisation, key: newKey, value };
        bulkOp.insert(attribute);
        return true;
      }
      return false;
    });
    return identOps.length > 0;
  });
  
  if (ops.length > 0) {
    return highland(bulkOp.execute());
  }
  return highland(Promise.resolve());
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
  await collection.update({"ifi.key": "statement.actor.account"}, { $set: {"ifi.key": "account"} }, {multi: true});
  await collection.update({"ifi.key": "statement.actor.mbox"}, { $set: {"ifi.key": "mbox"} }, {multi: true});
  await collection.update({"ifi.key": "statement.actor.openid"}, { $set: {"ifi.key": "openid"} }, {multi: true});
  await collection.update({"ifi.key": "statement.actor.mbox_sha1sum"}, { $set: {"ifi.key": "mbox_sha1sum"} }, {multi: true});
};

const cloneIdentifiersToNewCollection = async () => {
  const pipeline = [{ $match: {} }];
  await new Promise((resolve, reject) => {
    connection.collection(oldIdentsCollectionName).aggregate(pipeline, { out: newIdentsCollectionName }, (err) => {
      console.log('Error: ', err);
      if (err) return reject(err);
      resolve();
    });
  });
};

const up = async () => {
  await createAttributesFromIdentifiers();
  await cloneIdentifiersToNewCollection();
  await updateIdentifierFields();
  logger.info(`You may want to delete the now unused ${oldIdentsCollectionName} collection`);
};

const down = async () => {
  logger.info('Dropping persona attributes and new idents');
  connection.collection(newIdentsCollectionName).drop();
  connection.collection(attributesCollectionName).drop();
};

export default { up, down };
