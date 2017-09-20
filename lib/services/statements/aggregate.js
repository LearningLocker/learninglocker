import setOrgIdOnAuthInfo
  from 'lib/services/auth/authInfoSelectors/setOrgIdOnAuthInfo';
import Statement from 'lib/models/statement';
import checkDashboardAuth from './utils/checkDashboardAuth';

export default async ({
  authInfo,
  limit,
  skip,
  cache,
  maxTimeMS,
  maxScan,
  pipeline
}) => {
  const options = { skip, limit, cache, batchSize: 100, maxTimeMS, maxScan };
  const organisationId = await checkDashboardAuth(authInfo, pipeline);
  const authInfoWithOrgId = setOrgIdOnAuthInfo(authInfo, organisationId);

  return new Promise((resolve, reject) =>
    Statement.aggregateByAuth(
      authInfoWithOrgId,
      pipeline,
      options,
      (err, results) => (err ? reject(err) : resolve(results))
    )
  );
};
