import { List, Map, fromJS } from 'immutable';
import { createSelector } from 'reselect';
import { take, takeEvery, put, fork, select } from 'redux-saga/effects';
import { identity, get } from 'lodash';
import {
  fetchAggregation,
  aggregationShouldFetchSelector,
  aggregationResultsSelector,
  aggregationHasResultSelector,
} from 'ui/redux/modules/aggregation';
import {
  shouldFetchSelector,
  fetchModels,
  fetchModelsCount,
  countSelector
} from 'ui/redux/modules/pagination';
import {
  modelsSchemaIdSelector,
  modelsByFilterSelector,
  updateModel
} from 'ui/redux/modules/models';
import activeOrgSelector from 'ui/redux/modules/activeOrgSelector';
import { orgTimezoneFromTokenSelector } from 'ui/redux/modules/auth';
import { metadataSelector } from 'ui/redux/modules/metadata';
import { modelsSelector } from 'ui/redux/modules/models/selectors';
import { UPDATE_MODEL } from 'ui/redux/modules/models/updateModel';
import {
  TYPES,
  NONE,
  JOURNEY,
  JOURNEY_PROGRESS,
} from 'ui/utils/constants';
import { pipelinesFromQueries } from 'ui/utils/visualisations';
import { unflattenAxes } from 'lib/helpers/visualisation';
import { OFF, ANY } from 'lib/constants/dashboard';

export const FETCH_VISUALISATION = 'learninglocker/models/learninglocker/visualise/FETCH_VISUALISATION';

/*
 * Actions
 */

/**
 * @param  {String} id of visualisation to fetch data for
 */
export const fetchVisualisation = (id, benchmark) => ({
  type: FETCH_VISUALISATION,
  id,
  benchmark
});


/*
* Selectors
*/

const dashboardShareableIdSelector = (state) => {
  const out =
    state.router &&
    state.router.route &&
    state.router.route.params &&
    state.router.route.params.shareableId;
  return out;
};

const dashboardIdSelector = (state) => {
  const out =
    state.router &&
    state.router.route &&
    state.router.route.params &&
    state.router.route.params.dashboardId;
  return out;
};

const routeNameSelector = (state) => {
  const out =
    state.router &&
    state.router.route &&
    state.router.route.name;
  return out;
};

const routeFilterSelector = state => get(state, ['router', 'route', 'params', 'filter']);

 /**
 * gets the visualisation pipeline associated with the provided ID
 * @param  {String}          id  id of visualisation
 * @return {Immutable.Map}       Map of pipeline
 */

const shareableDashboardFilterSelector = () => createSelector(
  [
    metadataSelector,
    modelsSelector,
    dashboardShareableIdSelector,
    dashboardIdSelector,
    routeNameSelector,
    routeFilterSelector
  ],
  (metadata, models, routeShareableId, routeDashboardId, routeName, filter) => {
    const viewingDashboardExternally = (routeName && routeName.indexOf('embedded-dashboard') !== -1);
    const dashboards = models.get('dashboard', new Map()).filter(d => Map.isMap(d));

    // if we are viewing a shared dashboard externally
    if (viewingDashboardExternally) {
      if (!routeDashboardId) {
        console.warn('Dashboard ID should exist on this route');
        return [new Map()];
      }

      const theDashboard = dashboards.get(routeDashboardId, new Map());
      if (!theDashboard) {
        // No dashboard found, return an empty filter
        return [new Map()];
      }

      if (!routeShareableId) {
        // must be a legacy link (no shareable ID) - use the first filter
        const legacyShare = theDashboard.get('remoteCache', new Map()).get('shareable', new List()).first();
        return [legacyShare.get('filter', new Map())];
      }

      // otherwise find the filter on the dasboard's shareables and return it
      const theShare = theDashboard.get('remoteCache', new Map())
        .get('shareable', new List())
        .find(share => share.get('_id') === routeShareableId);

      // get paramater filter
      if (
        theShare.get('filterMode', OFF) !== OFF && filter
      ) {
        let parsedFilter = filter; // either JSON or JWT
        if (theShare.get('filterMode') === ANY) {
          try {
            // if JSON, attempt to parse
            parsedFilter = fromJS(JSON.parse(decodeURI(filter)));
          } catch (err) {
            parsedFilter = fromJS({});
          }
        }
        return [
          theShare.get('filter', new Map()),
          parsedFilter
        ];
      }

      return [theShare.get('filter', new Map())];
    }

    const expandedKey = (metadata || new Map())
      .get('dashboardSharing', new Map())
      .findKey(share => share.get('isExpanded', false) === true);

    if (!expandedKey) {
      // we aren't filtering - return empty filter
      return [new Map()];
    }

    // if we are filtering due to an expanded shareable model
    // Find the dashboard with the corresponding shareable ID
    const theDashboard = dashboards.find(dash =>
      dash.get('remoteCache', new Map())
      .get('shareable', new List())
      .find(share =>
        (share.get('_id') === expandedKey)
      )
    );

    // return the filter from that dashboard's shareable model
    return [theDashboard.get('remoteCache', new Map())
      .get('shareable', new List())
      .find(share => share.get('_id') === expandedKey)
      .get('filter', new Map())];
  }
);

/**
 * @param {string} id - visualisation._id
 * @param {(queries: immutable.List) => immutableList} cb - queries to pipelines
 * @return {(state: any) => immutable.List} - selector. Select pipelines from state
 */
export const visualisationPipelinesSelector = (
  id,
  cb = pipelinesFromQueries // whilst waiting for https://github.com/facebook/jest/issues/3608
) => createSelector(
  [
    modelsSchemaIdSelector('visualisation', id),
    shareableDashboardFilterSelector(),
    activeOrgSelector,
    orgTimezoneFromTokenSelector,
  ],
  (visualisation, filter, organisationModel, orgTimezoneFromToken) => {
    if (!visualisation) return new List();
    const type = visualisation.get('type');
    const journey = visualisation.get('journey');
    const previewPeriod = visualisation.get('previewPeriod');
    const benchmarkingEnabled = visualisation.get('benchmarkingEnabled', false);
    const timezone = visualisation.get('timezone') || orgTimezoneFromToken || organisationModel.get('timezone', 'UTC');
    const queries = visualisation.get('filters', new List()).map((vFilter) => {
      if (!filter) {
        return vFilter;
      }

      const out = new Map({
        $match: new Map({
          $and: new List([
            vFilter.get('$match', new Map()),
            ...filter,
          ])
        })
      });

      return out;
    });

    const axes = unflattenAxes(visualisation);
    return cb(queries, axes, type, previewPeriod, journey, timezone, benchmarkingEnabled);
  }
);

/**
 * Takes a visualisation object and suggests a wizard step to be completed
 * e.g. visualisation.type is not completed, a popup for choosing a type is suggested
 * @param  {Object} visualisation Plain JS object representing a visualisation
 * @return {String} Constant describing a step in the form wizard
 */
export const suggestedStepSelector = (visualisation) => {
  if (visualisation.get('suggestedStep') === NONE) return NONE;
  if (!visualisation.has('type')) return TYPES;
  if (visualisation.get('type') === JOURNEY_PROGRESS) {
    if (!visualisation.has('journey')) return JOURNEY;
  }

  return NONE;
};

const shouldFetchPipeline = (pipeline, state) => aggregationShouldFetchSelector(pipeline)(state);

const shouldFetchPipelines = (pipelines, state) =>
  pipelines.reduce((reduction, pipeline) => (
    reduction || shouldFetchPipeline(pipeline, state)
  ), false);

const shouldFetchSeries = (series, state) =>
  series.reduce((reduction, pipelines) => (
    reduction || shouldFetchPipelines(pipelines, state)
  ), false);

const shouldFetchJourney = (pipelines, state) =>
  pipelines.reduce((reduction, pipeline) => (
    reduction || shouldFetchSelector('journeyProgress', pipeline)(state)
  ), false);

/**
 * Takes a visualisation id and checks if it needs its sources fetching
 * @param  {visualisationId} id of the visualisation to check
 * @return {Boolean}
 */
export const visualisationShouldFetchSelector = visualisationId => createSelector([
  identity,
  visualisationPipelinesSelector(visualisationId),
  modelsSchemaIdSelector('visualisation', visualisationId)
], (state, pipelines, visualisation) => {
  switch (visualisation.get('type')) {
    case JOURNEY_PROGRESS: return shouldFetchJourney(pipelines, state);
    default: return shouldFetchSeries(pipelines, state);
  }
});

/**
 * Takes a JourneyProgress pipeline and returns
 * the corresponding journeyProgress in a format for graphing
 * @param  {visualisationId} id of the visualisation to check
 * @return {Immutable.List}
 */
export const journeyProgressResultsSelector =
  (journeyId, filter = new Map({ journey: journeyId })) => createSelector([
    modelsByFilterSelector('journeyProgress', filter),
    countSelector('journeyProgress', filter)
  ], (journeyProgresses, count) => new Map({
    journeyProgresses,
    count
  }));

const getJourneyResults = (visualisation, filter, state) => {
  const journey = visualisation.get('journey');
  return journeyProgressResultsSelector(journey, filter)(state);
};

/**
 * @param {*} state
 * @returns {(pipelines: immutable.List) => immutable.List}
 */
const getPipelinesResults = state => pipelines => pipelines.map(pipeline => (
  aggregationResultsSelector(pipeline)(state) || new Map()
));

/**
 *
 * @param {string} visualisationId
 * @param {*} state
 * @return {immutable.List}
 */
const getSeriesResults = (visualisationId, state) => {
  const series = visualisationPipelinesSelector(visualisationId)(state);
  return series.map(getPipelinesResults(state));
};

/**
 * Takes a visualisation id and returns the results of its queries
 * @param  {visualisationId} id of the visualisation to check
 * @return {Immutable.List}
 */
export const visualisationResultsSelector = (visualisationId, filter) => createSelector([
  identity,
  modelsSchemaIdSelector('visualisation', visualisationId)
], (state, visualisation) => {
  switch (visualisation.get('type')) {
    case JOURNEY_PROGRESS:
      return getJourneyResults(visualisation, filter, state);
    default:
      return getSeriesResults(visualisationId, state);
  }
});

export const visualisationAllAggregationsHaveResultSelector = visualisationId => createSelector([
  identity,
], (state) => {
  const series = visualisationPipelinesSelector(visualisationId)(state);
  return series.reduce(
    (acc1, pipelines) =>
      acc1 && pipelines.reduce(
        (acc2, pipeline) => acc2 && aggregationHasResultSelector(pipeline)(state),
        true
      ),
    true
  );
});

function* handleVisualisation(action) {
  const { keyPath, silent } = action;
  const keyPathList = new List(keyPath);

  if (keyPathList.get(0) === 'visualisation' && !silent) {
    const modelId = keyPathList.get(1);
    const model = yield select(modelsSchemaIdSelector, 'visualisation', modelId);
    const suggestedStep = suggestedStepSelector(model);
    yield put(updateModel({
      schema: 'visualisation',
      id: modelId,
      path: 'suggestedStep',
      value: suggestedStep,
      silent: true
    }));
  }
}

export function* watchUpdateVisualisation() {
  if (__CLIENT__) {
    yield* takeEvery(UPDATE_MODEL, handleVisualisation);
  }
}

export function* fetchVisualisationSaga(state, id) {
  const visualisation = modelsSchemaIdSelector('visualisation', id)(state);

  if (visualisation.get('type') === JOURNEY_PROGRESS) {
    const pipelines = visualisationPipelinesSelector(id)(state);
    for (let i = 0; i < pipelines.size; i += 1) {
      const journeyId = visualisation.get('journey');
      const filter = new Map({ journey: journeyId });
      yield put(fetchModelsCount('journeyProgress', filter));
      yield put(fetchModels('journey', new Map({ _id: journeyId })));
    }
  } else {
    const series = visualisationPipelinesSelector(id)(state);
    for (let s = 0; s < series.size; s += 1) {
      const pipelines = series.get(s);
      for (let p = 0; p < pipelines.size; p += 1) {
        const shouldFetch = shouldFetchPipeline(pipelines.get(p), state);
        if (shouldFetch) yield put(fetchAggregation({ pipeline: pipelines.get(p) }));
      }
    }
  }
}

export function* watchFetchVisualisation() {
  while (__CLIENT__) {
    const { id } = yield take(FETCH_VISUALISATION);
    const state = yield select();
    const shouldFetch = visualisationShouldFetchSelector(id)(state);
    if (shouldFetch) {
      yield fork(fetchVisualisationSaga, state, id);
    }
  }
}

export const sagas = [watchUpdateVisualisation, watchFetchVisualisation];

const MAX_NAME_LENGTH = 17;
export const trimName = (name, length = MAX_NAME_LENGTH) => {
  if (name.length >= length) {
    let formattedName;
    if (name.indexOf('/') !== -1) {
      formattedName = name.split('/')[name.split('/').length - 1];
    } else if (name.indexOf('@') !== -1) {
      formattedName = name.split('@')[0];
    } else if (name.indexOf(' ') !== -1) {
      formattedName = name.split(' ')[name.split(' ').length - 1];
    } else if (name.indexOf('.') !== -1) {
      formattedName = name.split('.')[name.split('.').length - 1];
    } else {
      formattedName = `${name.substr(0, 12)} ${name.substr(12, 12)}`;
    }
    return formattedName.length >= length ? `${formattedName.substr(-length)}...` : formattedName;
  }
  return name || 'Unnamed';
};

export const isDateRange = () => {
  const group = this.props.visualisation.getIn(['axes', 'group']);
  const ranges = ['minute', 'hour', 'weekday', 'date'];
  return ranges.indexOf(group) !== -1;
};
