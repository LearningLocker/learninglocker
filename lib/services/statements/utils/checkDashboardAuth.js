import map from 'lodash/map';
import filterNot from 'lodash/reject';
import isEmpty from 'lodash/isEmpty';
import { fromJS, List } from 'immutable';
import Promise from 'bluebird';
import { getConnection } from 'lib/connections/mongoose';
import getDashboardFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getDashboardFromAuthInfo';
import getOrgFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import pipelinesFromQueries from 'ui/utils/visualisations/pipelinesFromQueries';
import NotFoundError from 'lib/errors/NotFoundError';
import UnauthorisedQueryError from 'lib/errors/UnauthorisedQueryError';
import { unflattenAxes, deserialiseAxes } from 'lib/helpers/visualisation';
import { VISUALISE_AXES_PREFIX } from 'lib/constants/visualise';

/**
 * Checks that the requested pipeline is permitted for the given authInfo
 * @param {Object} authInfo
 * @param {Array} pipeline
 */
export default (authInfo, pipeline = []) =>
  new Promise((resolve, reject) => {
    const dashboardId = getDashboardFromAuthInfo(authInfo);
    // if authentication has a dashboard scope, check that the query is in the dashboard's queries
    if (dashboardId) {
      const Dashboard = getConnection().model('Dashboard');
      return Dashboard.findById(dashboardId)
        .then((dashboard) => {
          if (!dashboard) {
            return reject(new NotFoundError('dashboard', dashboardId));
          }
          const Visualisation = getConnection().model('Visualisation');
          const allVisualisationIds = map(dashboard.widgets, 'visualisation');
          const visualisationIds = filterNot(allVisualisationIds, isEmpty);

          return Promise.props({
            organisationId: dashboard.organisation,
            visualisations: Visualisation.find({
              _id: { $in: visualisationIds }
            })
          });
        })
        .then(({ organisationId, visualisations }) => {
          const immutPipeline = fromJS(pipeline);
          const immutPipelines = new List(visualisations)
            .flatMap((visualisation) => {
              const axes2 = unflattenAxes(fromJS(visualisation.toObject()));
              const axes3 = deserialiseAxes(axes2, VISUALISE_AXES_PREFIX);

              const parsedQueries = new List(visualisation.filters).map(query =>
                fromJS(JSON.parse(query))
              );
              return pipelinesFromQueries(
                parsedQueries,
                axes3,
                visualisation.type,
                visualisation.previewPeriod,
                visualisation.id
              );
            })
            .flatten(true);
          const pipelineMatch = immutPipelines.contains(immutPipeline);
          if (pipelineMatch) return resolve(organisationId);
          return reject(new UnauthorisedQueryError());
        });
    }
    const organisationId = getOrgFromAuthInfo(authInfo, pipeline);
    return resolve(organisationId);
  });
