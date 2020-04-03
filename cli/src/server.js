import program from 'commander';

import bulkInsert from 'cli/commands/bulkInsert';
import createSiteAdmin from 'cli/commands/createSiteAdmin';
import updateStatementOrganisation from 'cli/commands/updateStatementOrganisation';
import updateStatementCount from 'cli/commands/updateStatementCount';
import requeueStatements from 'cli/commands/requeueStatements';
import migrateLRS from 'cli/commands/v1-migrations/migrateLRS';
import migrateVisualiseQueries from 'cli/commands/migrateVisualiseQueries';
import migrateToOrgSettings from 'cli/commands/migrateToOrgSettings';
import migrateClientAuthority from 'cli/commands/v1-migrations/migrateClientAuthority';
import migrateClientId from 'cli/commands/v1-migrations/migrateClientId';
import batchJobs from 'cli/commands/worker/batchJobs';
import migrateExportsToCSV from 'cli/commands/migrateExportsToCSV';
import migrateScopesToRoles from 'cli/commands/migrateScopesToRoles';
import migrateTimestamps from 'cli/commands/v1-migrations/migrateTimestamps';
import migrateXAPIReadScope from 'cli/commands/v1-migrations/migrateXAPIReadScope';
import migrateDownloadPaths from 'cli/commands/migrateDownloadPaths';

import clearAggregationCache from 'cli/commands/clearAggregationCache';
import migrateVisualiseAxes from 'cli/commands/migrateVisualiseAxes';
import migrateQueryBuilderCachesPath from 'cli/commands/migrateQueryBuilderCachesPath';
import migrateToInQueries from 'cli/commands/migrateToInQueries';
import migrateFromInQueries from 'cli/commands/migrateFromInQueries';

import testStatementForwarding from 'cli/commands/testStatementForwarding';
import testQueryBuilderCache from 'cli/commands/testQueryBuilderCache';
import disableRegister from 'cli/commands/disableRegister';

import migrateMongo, { MIGRATIONS_PATH } from 'cli/migrateMongo';

import seed from 'cli/seed';
import expirationNotificationEmails from 'cli/commands/expirationNotificationEmails';
import orgUsageTracker from 'cli/commands/orgUsageTracker';

/**
 * Run an async function then exit process
 *
 * @param {(() => Promise)|((options: commander.Command) => Promise)} asyncFunc
 */
const runThenExit = asyncFunc => async (options) => {
  await asyncFunc(options);
  process.exit();
};

program.version('0.0.1');

program
  .command('clearAggregationCache')
  .option('-o, --org [org]', 'Organisation ID')
  .action(clearAggregationCache);

program.command('bulkInsert [host] [username] [password] [total] [batchSize]').action(bulkInsert);
// node cli/dist/server bulkInsert http://localhost/learninglocker_cloud/public/data/xAPI/ 611f0d520c168c8a94e0e9b407afe4a01e283fac a5905b55ef2d3ab864e6e8eedc7dc99b196cfc50 1 1

program
  .command('createSiteAdmin [email] [organisation] [password] ')
  .option(
    '-f, --forceUpdatePassword [forceUpdatePassword]',
    'Force the command to update the password (if valid)'
  )
  .action(createSiteAdmin);
// node cli/dist/server createSiteAdmin "example@email.com" "Your organisation name" "yourpassword"

program.command('updateStatementCount').action(updateStatementCount);
// node cli/dist/server updateStatementCount

program
  .command('requeueStatements [lrs_id]')
  .option('-s, --since [since]', 'Requeue statements stored since this ISO date')
  .action(requeueStatements);
// 1. Stop workers.
// 2. db.personas.remove({}); db.queryBuilderCaches.remove({}); db.queryBuilderCacheValues.remove({}); db.personaIdentifiers.remove({}); db.statements.updateMany({}, {$set: {processingQueues: [], completedQueues: []}});
// 3a. node cli/dist/server updateStatementCount #we skip running the lrs count workers using this instead
// 3b. node cli/dist/server requeueStatements
// 4. npm run start-dev-worker

program.command('migrateV1-LRS [orgId]').action(migrateLRS);
// node cli/dist/server migrateV1-LRS 572cac001bb110583ed76177

program.command('migrateVisualiseQueries').action(migrateVisualiseQueries);
// node cli/dist/server migrateVisualiseQueries

program.command('updateStatementOrganisation').action(updateStatementOrganisation);
// node cli/dist/server updateStatementOrganisation

program.command('migrateToOrgSettings').action(migrateToOrgSettings.bind(null, null));
// node cli/dist/server migrateToOrgSettings

program.command('migrateTimestamps').action(migrateTimestamps);
// node cli/dist/server migrateTimestamps

program.command('migrateClientAuthority').action(migrateClientAuthority.bind(null, null));
// node cli/dist/server migrateClientAuthority

program.command('migrateClientId').action(migrateClientId.bind(null, null));
// node cli/dist/server migrateClientId

program.command('migrateExportsToCSV').action(migrateExportsToCSV.bind(null, null));
// node cli/dist/server migrateExportsToCSV

program.command('migrateScopesToRoles').action(migrateScopesToRoles.bind(null, null));
// node cli/dist/server migrateScopesToRoles

program.command('migrateXAPIReadScope').action(migrateXAPIReadScope.bind(null, null));
// node cli/dist/server migrateXAPIReadScope

program.command('migrateDownloadPaths').action(migrateDownloadPaths);
// node cli/dist/server migrateDownloadPaths


program.command('migrateVisualiseAxes').action(migrateVisualiseAxes.bind(null, null));
// node cli/dist/server migrateVisualiseAxes

program.command('migrateQueryBuilderCachesPath').action(migrateQueryBuilderCachesPath);
// node cli/dist/server migrateQueryBuilderCachesPath

program.command('migrateToInQueries').action(runThenExit(migrateToInQueries));
// node cli/dist/server migrateToInQueries

program.command('migrateFromInQueries').action(runThenExit(migrateFromInQueries));
// node cli/dist/server migrateFromInQueries

program
  .command('testStatementForwarding [statementId]')
  .option('-p, --port [port]')
  .action(testStatementForwarding);
// node cli/dist/server testStatementForwarding

program.command('testQueryBuilderCache').action(testQueryBuilderCache);
// node cli/dist/server testQueryBuilderCache

program.command('seed [action]').action(seed);
// RUNTIME_NODE_ENV=test node cli/dist/server seed reset

const dateType = val => new Date(val);

program
  .command('batchJobs')
  .option('-j --job <job>', 'Worker job', /^(querybuildercache|personas)$/i, 'querybuildercache')
  .option('-f, --from [from]', 'From', dateType)
  .option('-t, --to [to]', 'To', dateType)
  .option('-o, --org [org]', 'Organisation ID')
  .option('-l, --lrs [lrs]', 'LRS ID')
  .option('-b, --batchSize [batchSize]', 'Batch size..')
  .action(batchJobs);
// node cli/dist/server batchJobs

program
  .command('disableRegister')
  .action(disableRegister);
// node cli/dist/server disableRegister


program
  .command('migrateMongo')
  .action(migrateMongo)
  .usage(`Runs migrations stored in ${MIGRATIONS_PATH}`)
  .option(
    '-u, --up [up]',
    "Optional, runs up migrations up to [up file name], also accepts ['next'], [up] arg is optional"
  )
  .option(
    '-d, --down <down>',
    "Optional, runs down migration down to [down file name], also accepts ['last']"
  )
  .option('-i, --info [info]', "Display the state of the migrations, optional ['v'|'verbose']")
  .option('-f, --fixOrder [fixOrder]', 'Resolves the migration order conflicts');
// node cli/dist/server migrateMongo

program
  .command('expirationNotificationEmails')
  .action(expirationNotificationEmails)
  .option('--weekBefore [weekBefore]', 'The date of when to send the week before email');
// node cli/dist/server expirationNotificationEmails

program
  .command('orgUsageTracker')
  .action(orgUsageTracker);

program.parse(process.argv);
