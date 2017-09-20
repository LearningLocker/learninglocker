import getClientScopeFilter from 'lib/services/auth/modelFilters/client';
import getDashboardScopeFilter from 'lib/services/auth/modelFilters/dashboard';
import getLrsScopeFilter from 'lib/services/auth/modelFilters/lrs';
import getOrganisationScopeFilter
  from 'lib/services/auth/modelFilters/organisation';
import getPersonaScopeFilter from 'lib/services/auth/modelFilters/persona';
import getRoleScopeFilter from 'lib/services/auth/modelFilters/role';
import getStatementScopeFilter from 'lib/services/auth/modelFilters/statement';
import getUserScopeFilter from 'lib/services/auth/modelFilters/user';
import getDownloadScopeFilter from 'lib/services/auth/modelFilters/download';
import getExportScopeFilter from 'lib/services/auth/modelFilters/export';
import getQueryScopeFilter from 'lib/services/auth/modelFilters/query';
import getQueryBuilderCacheScopeFilter from 'lib/services/auth/modelFilters/querybuildercache';
import getVisualisationScopeFilter
  from 'lib/services/auth/modelFilters/visualisation';
import getStatementForwardingScopeFilter
  from 'lib/services/auth/modelFilters/statementForwarding';

export default async (opts) => {
  switch (opts.modelName.toLowerCase()) {
    case 'client':
      return getClientScopeFilter(opts);
    case 'dashboard':
      return getDashboardScopeFilter(opts);
    case 'lrs':
      return getLrsScopeFilter(opts);
    case 'organisation':
      return getOrganisationScopeFilter(opts);
    case 'persona':
    case 'personaidentifier':
    case 'importcsv':
      return getPersonaScopeFilter(opts);
    case 'role':
      return getRoleScopeFilter(opts);
    case 'statement':
      return getStatementScopeFilter(opts);
    case 'statementforwarding':
      return getStatementForwardingScopeFilter(opts);
    case 'user':
      return getUserScopeFilter(opts);
    case 'visualisation':
      return getVisualisationScopeFilter(opts);
    case 'download':
      return getDownloadScopeFilter(opts);
    case 'export':
      return getExportScopeFilter(opts);
    case 'query':
      return getQueryScopeFilter(opts);
    case 'querybuildercache':
    case 'querybuildercachevalue':
      return getQueryBuilderCacheScopeFilter(opts);
    default:
      throw new Error(`Invalid scope ${opts.modelName.toLowerCase()} requested`);
  }
};
