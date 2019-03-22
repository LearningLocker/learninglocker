import setOrgIdOnAuthInfo from 'lib/services/auth/authInfoSelectors/setOrgIdOnAuthInfo';
import Statement from 'lib/models/statement';

import checkDashboardAuth from './utils/checkDashboardAuth';
import { dashboardPipeline } from './aggregate';

const addDashboardAuthInfo = async ({
  authInfo,
  pipeline,
}) => {
  const pipelineWithDashboard = await dashboardPipeline({ authInfo, pipeline });
  const organisationId = await checkDashboardAuth(authInfo, pipelineWithDashboard);
  const authInfoWithOrgId = setOrgIdOnAuthInfo(authInfo, organisationId);

  return {
    authInfo: authInfoWithOrgId,
    pipeline: pipelineWithDashboard,
  };
};

/**
 * @param {object} - {
 *                     authInfo: object,
 *                     pipeline: array,
 *                     skip: number,
 *                     limit: number,
 *                     sinceAt: string|null,
 *                    }
 * @returns {Promise} - {
 *                        results: array|null,
 *                        startedAt: string,
 *                        completedAt: string|null,
 *                      }
 */
const aggregateAsync = async ({
  authInfo,
  pipeline,
  skip,
  limit,
  sinceAt,
}) => {
  const x = await addDashboardAuthInfo({ authInfo, pipeline });
  const resultAndStatus = await Statement.aggregateAsync(x.authInfo, x.pipeline, skip, limit, sinceAt);
  return resultAndStatus;
};

export default aggregateAsync;
