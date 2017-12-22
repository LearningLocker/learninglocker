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
  const attributesCollection = connection.collection(attributesCollectionName);
  const newIdentsCollection = connection.collection(newIdentsCollectionName);

  const opsPromises = [];

  // Create attributes from idents
  const attrBulkOp = attributesCollection.initializeUnorderedBulkOp();
  const attrOps = docs.filter((doc) => {
    const identOps = doc.identifiers.filter(({ key, value }) => {
      if (!/^statement\./.test(key)) {
        const personaId = doc.persona;
        const organisation = doc.organisation;
        const newKey = key.replace('persona.import.', '');
        const attribute = { personaId, organisation, key: newKey, value };
        attrBulkOp.insert(attribute);
        return true;
      }
      return false;
    });
    return identOps.length > 0;
  }); 
  
  if (attrOps.length > 0) {
    opsPromises.push(attrBulkOp.execute());
  }

  // Create new identifiers from old
  const identBulkOp = newIdentsCollection.initializeUnorderedBulkOp();
  const identOps = docs.map((doc) => {
    const { key, value } = doc.uniqueIdentifier;
    let newKey;
    if (/^statement\.actor\./.test(key)) {
      newKey = key.replace('statement.actor.', '');
    }

    identBulkOp.insert({
      _id: doc._id,
      organisation: doc.organisation,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      persona: doc.persona,
      ifi: {
        key: newKey,
        value,
      }
    });
  });

  if (identOps.length > 0){
    // execute the ident bulk op
    opsPromises.push(identBulkOp.execute());
  }

  return highland(Promise.all(opsPromises));
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
  // await cloneIdentifiersToNewCollection();
  // await updateIdentifierFields();
  logger.info(`You may want to delete the now unused ${oldIdentsCollectionName} collection`);
};

const down = async () => {
  logger.info('Dropping persona attributes and new idents');
  connection.collection(newIdentsCollectionName).drop();
  connection.collection(attributesCollectionName).drop();
};

export default { up, down };
