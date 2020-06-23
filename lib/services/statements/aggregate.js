import setOrgIdOnAuthInfo
  from 'lib/services/auth/authInfoSelectors/setOrgIdOnAuthInfo';
import Statement from 'lib/models/statement';

import { get, set, find } from 'lodash';
import getDashboardFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getDashboardFromAuthInfo';
import getShareableFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getShareableFromAuthInfo';
import { getConnection } from 'lib/connections/mongoose';
import { JWT_SECURED, OFF } from 'lib/constants/dashboard';
import UnauthorisedQueryError from 'lib/errors/UnauthorisedQueryError';
import jwt from 'jsonwebtoken';

import checkDashboardAuth from './utils/checkDashboardAuth';

export const dashboardPipeline = async ({
  pipeline,
  authInfo
}) => {
  const dashboardId = getDashboardFromAuthInfo(authInfo);
  const shareableId = getShareableFromAuthInfo(authInfo);

  if (!dashboardId) {
    return pipeline;
  }

  const Dashboard = getConnection().model('Dashboard');
  const dashboard = await Dashboard.findById(dashboardId);


  if (!dashboard) {
    return pipeline;
  }

  const shareable = dashboard &&
    (find(dashboard.shareable, share => share._id.toString() === shareableId));

  if (get(shareable, 'filterMode', OFF) !== JWT_SECURED) {
    return pipeline;
  }

  const secret = get(shareable, 'filterJwtSecret');

  const query = get(pipeline, [1, '$match', '$and', 2]);
  if (!query) {
    if (get(shareable, 'filterRequired', false)) {
      // if no query has been passed but we require one, throw an error
      throw new UnauthorisedQueryError();
    }
    // otherwise just return the default pipeline
    return pipeline;
  }
  // verify the passed query and add it to the pipeline
  const unencodedPayload = jwt.verify(query, secret);
  return set(pipeline, [1, '$match', '$and', 2], unencodedPayload);
};

export default async ({
  authInfo,
  limit,
  skip,
  cache,
  maxTimeMS,
  pipeline,
  sampleSize
}) => {
  const pipelineWithDashboard = await dashboardPipeline({ authInfo, pipeline });

  const options = { skip, limit, cache, batchSize: 100, maxTimeMS, sampleSize };
  const organisationId = await checkDashboardAuth(authInfo, pipelineWithDashboard);
  const authInfoWithOrgId = setOrgIdOnAuthInfo(authInfo, organisationId);

  return new Promise((resolve, reject) =>
    Statement.aggregateByAuth(
      authInfoWithOrgId,
      pipelineWithDashboard,
      options,
      (err, results) => (err ? reject(err) : resolve(results))
    )
  );
};
