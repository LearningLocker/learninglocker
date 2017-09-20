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
import addIdentsToCache from 'cli/commands/addIdentsToCache';
import reseedOrganisationScoringSchemes from 'cli/commands/reseedOrganisationScoringSchemes';
import batchJobs from 'cli/commands/worker/batchJobs';
import migrateExportsToCSV from 'cli/commands/migrateExportsToCSV';
import migrateScopesToRoles from 'cli/commands/migrateScopesToRoles';
import migrateTimestamps from 'cli/commands/v1-migrations/migrateTimestamps';
import migrateXAPIReadScope from 'cli/commands/v1-migrations/migrateXAPIReadScope';
import migrateDownloadPaths from 'cli/commands/migrateDownloadPaths';

import clearAggregationCache from 'cli/commands/clearAggregationCache';
import migrateVisualiseAxes from 'cli/commands/migrateVisualiseAxes';
import migrateQueryBuilderCachesPath from 'cli/commands/migrateQueryBuilderCachesPath';

import testStatementForwarding from 'cli/commands/testStatementForwarding';
import testQueryBuilderCache from 'cli/commands/testQueryBuilderCache';


program.version('0.0.1');

program
.command('clearAggregationCache')
.option('-o, --org [org]', 'Organisation ID')
.action(clearAggregationCache);

program
.command('bulkInsert [host] [username] [password] [total] [batchSize]')
.action(bulkInsert);
// node cli/dist/server bulkInsert http://localhost/learninglocker_cloud/public/data/xAPI/ 611f0d520c168c8a94e0e9b407afe4a01e283fac a5905b55ef2d3ab864e6e8eedc7dc99b196cfc50 1 1

program
.command('createSiteAdmin [email] [organisation] [password] ')
.option('-f, --forceUpdatePassword [forceUpdatePassword]', 'Force the command to update the password (if valid)')
.action(createSiteAdmin);
// node cli/dist/server createSiteAdmin andrew.hickey@ht2labs.com HT2 password

program
.command('updateStatementCount')
.action(updateStatementCount);
// node cli/dist/server updateStatementCount

program
.command('requeueStatements [lrs_id]')
.option('-s, --since [since]', 'Requeue statements stored since this ISO date')
.action(requeueStatements);
// 1. Stop workers.
// 2. db.personas.remove({}); db.personstatements.remove({}); db.statementwaypoints.remove({}); db.queryBuilderCaches.remove({}); db.queryBuilderCacheValues.remove({}); db.personaidentifiers.remove({}); db.statements.update({}, {$set: {processingQueues: [], completedQueues: []}}, {multi: true});
// 3a. node cli/dist/server updateStatementCount #we skip running the lrs count workers using this instead
// 3b. node cli/dist/server requeueStatements
// 4. npm run start-dev-worker

program
.command('migrateV1-LRS [orgId]')
.action(migrateLRS);
// node cli/dist/server migrateV1-LRS 572cac001bb110583ed76177

program
.command('migrateVisualiseQueries')
.action(migrateVisualiseQueries);
// node cli/dist/server migrateVisualiseQueries

program
.command('updateStatementOrganisation')
.action(updateStatementOrganisation);
// node cli/dist/server updateStatementOrganisation

program
.command('migrateToOrgSettings')
.action(migrateToOrgSettings.bind(null, null));
// node cli/dist/server migrateToOrgSettings

program
.command('migrateTimestamps')
.action(migrateTimestamps);
// node cli/dist/server migrateTimestamps

program
.command('migrateClientAuthority')
.action(migrateClientAuthority.bind(null, null));
// node cli/dist/server migrateClientAuthority

program
.command('migrateClientId')
.action(migrateClientId.bind(null, null));
// node cli/dist/server migrateClientId

program
.command('migrateExportsToCSV')
.action(migrateExportsToCSV.bind(null, null));
// node cli/dist/server migrateExportsToCSV

program
.command('migrateScopesToRoles')
.action(migrateScopesToRoles.bind(null, null));
// node cli/dist/server migrateScopesToRoles

program
.command('migrateXAPIReadScope')
.action(migrateXAPIReadScope.bind(null, null));
// node cli/dist/server migrateXAPIReadScope

program
.command('migrateDownloadPaths')
.action(migrateDownloadPaths);
// node cli/dist/server migrateDownloadPaths

program
.command('addIdentsToCache')
.action(addIdentsToCache.bind(null, null));
// node cli/dist/server addIdentsToCache

program
.command('reseedOrganisationScoringSchemes')
.option('-s, --since [since]', 'Requeue statements stored since this ISO date')
.action(reseedOrganisationScoringSchemes);
// node cli/dist/server reseedOrganisationScoringSchemes
//
//

program
.command('migrateVisualiseAxes')
.action(migrateVisualiseAxes.bind(null, null));
// node cli/dist/server migrateVisualiseAxes

program
  .command('migrateQueryBuilderCachesPath')
  .action(migrateQueryBuilderCachesPath);
// node cli/dist/server migrateQueryBuilderCachesPath

program
  .command('testStatementForwarding [statementId]')
  .option('-p, --port [port]')
  .action(testStatementForwarding);
// node cli/dist/server testStatementForwarding

program
  .command('testQueryBuilderCache')
  .action(testQueryBuilderCache);
// node cli/dist/server testQueryBuilderCache

const dateType = val => new Date(val);

program
.command('batchJobs')
.option(
  '-j --job <job>', 'Worker job', /^(querybuildercache|personas)$/i,
  'querybuildercache'
)
.option('-f, --from [from]', 'From', dateType)
.option('-t, --to [to]', 'To', dateType)
.option('-o, --org [org]', 'Organisation ID')
.option('-l, --lrs [lrs]', 'LRS ID')
.option('-b, --batchSize [batchSize]', 'Batch size..')
.action(batchJobs);
// node cli/dist/server batchJobs

program.parse(process.argv);
