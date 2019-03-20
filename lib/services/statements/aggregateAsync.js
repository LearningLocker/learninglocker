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
 * @param {*} authInfo
 * @param {array} pipeline
 * @param {number} skip
 * @param {number} limit
 * @returns {Promise} - {
 *                        results: array|null|undefined,
 *                        status: {
 *                          startedAt: string,
 *                          completedAt: string|undefined,
 *                        }
 *                      }
 */
const aggregateAsync = async ({
  authInfo,
  pipeline,
  skip,
  limit,
}) => {
  const x = await addDashboardAuthInfo({ authInfo, pipeline });
  const resultsAndStatus = await Statement.aggregateAsync(x.authInfo, x.pipeline, skip, limit);
  return resultsAndStatus;
};

export default aggregateAsync;
