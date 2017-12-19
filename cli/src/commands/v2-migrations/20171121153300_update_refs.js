import highland from 'highland';
import Statement from 'lib/models/statement';
import union from 'lodash/union';
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
  statements.forEach((doc) => {
    const queriables = getQueriables(doc);
    const update = {
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
  });
  return highland(bulkOp.execute());
};

const processStream = stream =>
  new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.apply(resolve);
  });

const createIndex = (key) => {
  return Statement.collection.createIndex(
    {
      organisation: 1,
      lrs_id: 1,
      [key]: 1
    },
    { background: true }
  );
};

const createIndexes = keys => keys.map(createIndex);

const up = async () => {
  const batchSize = 10;
  const query = {};
  const statementStream = highland(Statement.find(query).cursor());
  const migrationStream = statementStream.batch(batchSize).flatMap(migrateStatementsBatch);
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
      verbs: ''
    }
  };
  const options = { multi: true };
  await Statement.update(filter, update, options);
};

export default { up, down };
