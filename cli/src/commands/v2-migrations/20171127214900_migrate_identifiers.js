import highland from 'highland';
import logger from 'lib/logger';
import PersonaIdentifier from 'lib/models/personaidentifier';
import { getConnection } from 'lib/connections/mongoose';

const connection = getConnection();

const processStream = stream =>
  new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.apply(resolve);
  });

const migrateIdentifierBatch = (docs) => {
  const bulkOp = connection.collection('personaAttributes').initializeUnorderedBulkOp();
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
  const docStream = highland(PersonaIdentifier.find(filter).cursor());
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
  await PersonaIdentifier.collection.update(filter, update, opts);
};

const up = async () => {
  await createAttributesFromIdentifiers();
  await updateIdentifierFields();
};

const down = async () => {
  logger.info('Not implemented.');
};

export default { up, down };
