import map from 'lodash/map';
import filterNot from 'lodash/reject';
import isEmpty from 'lodash/isEmpty';
import find from 'lodash/find';
import { fromJS, List, Map } from 'immutable';
import Promise from 'bluebird';
import { getConnection } from 'lib/connections/mongoose';
import getDashboardFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getDashboardFromAuthInfo';
import getShareableFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getShareableFromAuthInfo';
import getOrgFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import pipelinesFromQueries from 'ui/utils/visualisations/pipelinesFromQueries';
import NotFoundError from 'lib/errors/NotFoundError';
import UnauthorisedQueryError from 'lib/errors/UnauthorisedQueryError';
import { unflattenAxes, deserialiseAxes } from 'lib/helpers/visualisation';
import { VISUALISE_AXES_PREFIX } from 'lib/constants/visualise';
import { ANY, JWT_SECURED } from 'lib/constants/dashboard';

/**
 * Checks that the requested pipeline is permitted for the given authInfo
 * @param {Object} authInfo
 * @param {Array} pipeline
 */
export default (authInfo, pipeline = []) =>
  new Promise((resolve, reject) => {
    const dashboardId = getDashboardFromAuthInfo(authInfo);
    const shareableId = getShareableFromAuthInfo(authInfo);

    // if authentication has a dashboard scope, check that the query is in the dashboard's queries
    if (dashboardId) {
      const Dashboard = getConnection().model('Dashboard');
      return Dashboard.findById(dashboardId)
        .then((dashboard) => {
          if (!dashboard) {
            return reject(new NotFoundError('dashboard', dashboardId));
          }
          const Visualisation = getConnection().model('Visualisation');
          const Organisation = getConnection().model('Organisation');
          const allVisualisationIds = map(dashboard.widgets, 'visualisation');
          const visualisationIds = filterNot(allVisualisationIds, isEmpty);

          return Promise.props({
            organisationId: dashboard.organisation,
            visualisations: Visualisation.find({
              _id: { $in: visualisationIds }
            }),
            organisations: Organisation.find({
              _id: dashboard.organisation
            }),
            shareable: find(dashboard.shareable, share => share._id.toString() === shareableId),
          });
        })
        .then(({ organisationId, organisations, visualisations, shareable }) => {
          const organisation = organisations[0];
          const defaultTimezone = organisation.timezone || 'UTC';

          let immutPipeline = fromJS(pipeline); // pipeline to authenticate

          const immutPipelines = new List(visualisations) // pipelines from the visualisations
            .flatMap((visualisation) => {
              const axes2 = unflattenAxes(fromJS(visualisation.toObject()));
              const axes3 = deserialiseAxes(axes2, VISUALISE_AXES_PREFIX);

              const parsedQueries = new List(visualisation.filters).map((query) => {
                const parsedQuery = fromJS(JSON.parse(query));

                if (shareable) {
                  const and = immutPipeline.getIn([1, '$match', '$and']);

                  // filterMode === ANY
                  if (shareable.filterMode === ANY && and && and.size > 2) {
                    immutPipeline = immutPipeline.setIn([1, '$match', '$and'], and.slice(0, -1));
                  }

                  // filterMode === JWT
                  if (shareable.filterMode === JWT_SECURED && and && and.size > 2) {
                    immutPipeline = immutPipeline.setIn([1, '$match', '$and'], and.slice(0, -1));
                  }

                  return parsedQuery.set('$match', new Map({
                    $and: new List([
                      parsedQuery.get('$match', new Map()),
                      fromJS(JSON.parse(shareable.filter))
                    ])
                  }));
                }
                return fromJS(JSON.parse(query));
              });

              const timezone = visualisation.timezone || defaultTimezone;

              return pipelinesFromQueries(
                parsedQueries,
                axes3,
                visualisation.type,
                visualisation.previewPeriod,
                visualisation.id,
                timezone,
                visualisation.benchmarkingEnabled,
              );
            })
            .flatten(true);

          const pipelineMatch = immutPipelines.contains(immutPipeline);

          if (pipelineMatch) {
            return resolve(organisationId);
          }

          return reject(new UnauthorisedQueryError());
        });
    }
    const organisationId = getOrgFromAuthInfo(authInfo, pipeline);
    return resolve(organisationId);
  });
