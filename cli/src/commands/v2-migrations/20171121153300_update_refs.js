import highland from 'highland';
import Statement from 'lib/models/statement';
import union from 'lodash/union';
import logger from 'lib/logger';
import {
  getActivitiesFromStatement,
  getRelatedActivitiesFromStatement
} from 'xapi-statements/dist/service/storeStatements/queriables/getActivitiesFromStatement';
import {
  getAgentsFromStatement,
  getRelatedAgentsFromStatement
} from 'xapi-statements/dist/service/storeStatements/queriables/getAgentsFromStatement';
import getRegistrationsFromStatement from 'xapi-statements/dist/service/storeStatements/queriables/getRegistrationsFromStatement';
import getVerbsFromStatement from 'xapi-statements/dist/service/storeStatements/queriables/getVerbsFromStatement';

const BATCH_SIZE = 10000;
const REVISION = 1;

const getQueriables = (doc) => {
  const statement = doc.statement;
  const refs = doc.refs ? doc.refs : [];
  const statements = [statement, ...refs];

  return {
    activities: union(...statements.map(getActivitiesFromStatement)),
    agents: union(...statements.map(getAgentsFromStatement)),
    registrations: union(...statements.map(getRegistrationsFromStatement)),
    relatedActivities: union(...statements.map(getRelatedActivitiesFromStatement)),
    relatedAgents: union(...statements.map(getRelatedAgentsFromStatement)),
    verbs: union(...statements.map(getVerbsFromStatement))
  };
};

const migrateStatementsBatch = (statements) => {
  const bulkOp = Statement.collection.initializeUnorderedBulkOp();
  let i = 0;
  statements.forEach((doc) => {
    try {
      const queriables = getQueriables(doc);
      const update = {
        $set: {
          rev: REVISION
        },
        $addToSet: {
          activities: { $each: queriables.activities },
          agents: { $each: queriables.agents },
          registrations: { $each: queriables.registrations },
          relatedActivities: { $each: queriables.relatedActivities },
          relatedAgents: { $each: queriables.relatedAgents },
          verbs: { $each: queriables.verbs }
        }
      };
      bulkOp.find({ _id: doc._id }).updateOne(update);
      i += 1;
    } catch (err) {
      const docId = doc._id ? doc._id : 'unknown';
      logger.error(`Error migrating statement with _id: ${docId}`, err.message);
    }
  });
  if (i > 0) {
    return highland(bulkOp.execute().then(() => {
      logger.info(`Completed batch of ${BATCH_SIZE}`);
    }));
  }
  return highland(Promise.resolve());
};

const processStream = stream =>
  new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.apply(resolve);
  });

const createIndex = key => Statement.collection.createIndex(
  {
    organisation: 1,
    lrs_id: 1,
    [key]: 1
  },
    { background: true }
  );

const createIndexes = keys => keys.map(createIndex);

const up = async () => {
  const query = {
    $or: [
      { rev: { $exists: false } },
      { rev: { $lte: REVISION } },
    ]
  };
  const statementStream = highland(Statement.find(query).cursor());
  const migrationStream = statementStream.batch(BATCH_SIZE).flatMap(migrateStatementsBatch);
  await processStream(migrationStream);
  createIndexes([
    'activities',
    'agents',
    'registrations',
    'relatedActivities',
    'relatedAgents',
    'verbs'
  ]);
};

const down = async () => {
  const filter = {};
  const update = {
    $unset: {
      activities: '',
      agents: '',
      registrations: '',
      relatedActivities: '',
      relatedAgents: '',
      verbs: '',
      rev: '',
    },
  };
  const options = { multi: true };
  await Statement.update(filter, update, options);
};

export default { up, down };
