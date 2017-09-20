import { List, Map } from 'immutable';
import { createSelector } from 'reselect';
import { take, takeEvery, put, fork, select } from 'redux-saga/effects';
import { identity } from 'lodash';
import moment from 'moment';
import {
  fetchAggregation,
  aggregationShouldFetchSelector,
  aggregationResultsSelector,
  aggregationRequestStateSelector,
  IN_PROGRESS,
  SUCCESS,
  FAILED,
} from 'ui/redux/modules/aggregation';
import {
  shouldFetchSelector,
  requestStateSelector,
  fetchModels,
  fetchModelsCount,
  countSelector
} from 'ui/redux/modules/pagination';
import {
  modelsSchemaIdSelector,
  modelsByFilterSelector,
  updateModel
} from 'ui/redux/modules/models';
import { UPDATE_MODEL } from 'ui/redux/modules/models/updateModel';
import {
  TYPES,
  NONE,
  JOURNEY,
  JOURNEY_PROGRESS,
} from 'ui/utils/constants';
import { pipelinesFromQueries, getJourney } from 'ui/utils/visualisations';
import { unflattenAxes } from 'lib/helpers/visualisation';
import { periodToDate } from 'ui/utils/dates';

export const FETCH_VISUALISATION = 'learninglocker/models/learninglocker/visualise/FETCH_VISUALISATION';

/*
 * Actions
 */

/**
 * @param  {String} id of visualisation to fetch data for
 */
export const fetchVisualisation = id => ({
  type: FETCH_VISUALISATION,
  id
});


/*
* Selectors
*/

 /**
 * gets the visualisation pipeline associated with the provided ID
 * @param  {String}          id  id of visualisation
 * @return {Immutable.Map}       Map of pipeline
 */

export const visualisationPiplelinesSelector = (
  id,
  cb = pipelinesFromQueries // whilst waiting for https://github.com/facebook/jest/issues/3608
) => createSelector(
  [modelsSchemaIdSelector('visualisation', id)],
  (visualisation) => {
    if (!visualisation) return new List();
    const type = visualisation.get('type');
    const journey = visualisation.get('journey');
    const previewPeriod = visualisation.get('previewPeriod');
    const queries = visualisation.get('filters', new List());
    const axes = unflattenAxes(visualisation);
    return cb(queries, axes, type, previewPeriod, journey);
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
  visualisationPiplelinesSelector(visualisationId),
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

const getPipelinesResults = state => pipelines => pipelines.map(pipeline => (
  aggregationResultsSelector(pipeline)(state) || new Map()
));

const getSeriesResults = (visualisationId, state) => {
  const series = visualisationPiplelinesSelector(visualisationId)(state);
  const out = series.map(getPipelinesResults(state));
  return out;
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
      return getJourneyResults(visualisation, filter)(state);
    default:
      return getSeriesResults(visualisationId, state);
  }
});

const getWaypointFetchStates = (visualisation, pipelines, state) => {
  const journeyId = visualisation.get('journey');
  return pipelines.map(() => {
    const waypoint = getJourney(journeyId, 'waypoint');
    return requestStateSelector('journeyProgress', waypoint)(state);
  });
};

const getPipelinesFetchStates = (pipelines, state) => pipelines.map(pipeline => (
  aggregationRequestStateSelector(pipeline)(state)
));

const getSeriesFetchStates = (series, state) =>
  series.reduce((fetchStates, pipelines) => {
    const states = getPipelinesFetchStates(pipelines, state);
    return fetchStates.concat(states);
  }, new List());

const getVisualisationFetchStates = (id, state) => {
  const visualisation = modelsSchemaIdSelector('visualisation', id)(state);
  const pipelines = visualisationPiplelinesSelector(id)(state);
  switch (visualisation.get('type')) {
    case JOURNEY_PROGRESS:
      return getWaypointFetchStates(visualisation, pipelines, state);
    default:
      return getSeriesFetchStates(pipelines, state);
  }
};

const getOverallFetchState = (fetchStates) => {
  const potentialStates = new List([IN_PROGRESS, SUCCESS, FAILED]);
  return fetchStates.reduce((reduction, requestState) => {
    const reductionPriority = potentialStates.indexOf(reduction);
    const requestStatePriority = potentialStates.indexOf(requestState);
    return reductionPriority > requestStatePriority ? reduction : requestState;
  });
};

/**
 * Takes a visualisation id and returns the fetching state of its queries
 * where the fetch states are different between queries the highest priorty state will be returned
 * priority order lw to high = [COMPLETED, IN_PROGRESS, FAILED]
 * @param  {visualisationId} id of the visualisation to check
 * @return {Immutable.List}
 */
export const visualisationFetchStateSelector =
  visualisationId => createSelector([identity], (state) => {
    const fetchStates = getVisualisationFetchStates(visualisationId, state);
    return getOverallFetchState(fetchStates);
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
    const pipelines = visualisationPiplelinesSelector(id)(state);
    for (let i = 0; i < pipelines.size; i += 1) {
      const journeyId = visualisation.get('journey');
      const filter = new Map({ journey: journeyId });
      yield put(fetchModelsCount('journeyProgress', filter));
      yield put(fetchModels('journey', new Map({ _id: journeyId })));
    }
  } else {
    const series = visualisationPiplelinesSelector(id)(state);
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

export const getEndDate = (dateStart, period) => {
  const dateEnd = moment(dateStart); // Clones the date so it's not mutated.
  return periodToDate(period, dateEnd);
};

export const getDates = (dateStart, dateEnd) => {
  const values = [];
  while (dateStart.isAfter(dateEnd, 'day')) {
    values.push({ x: dateEnd.format('YYYY-MM-DD'), s1: 0, s2: 0, s3: 0 });
    dateEnd.add(1, 'day');
  }
  values.push({ x: dateStart.format('YYYY-MM-DD'), s1: 0, s2: 0, s3: 0 });
  return values;
};

export const getHours = (dateStart, dateEnd) => {
  const values = [];
  while (dateStart.isAfter(dateEnd, 'hours')) {
    values.push({ x: dateEnd.format('HH'), y: 0 });
    dateEnd.add(1, 'hours');
  }
  return values;
};

export const getDateRange = (period) => {
  const dateStart = moment();
  const dateEnd = getEndDate(dateStart, period);
  switch (period) {
    case 'LAST_24_HOURS': return getHours(dateStart, dateEnd);
    default: return getDates(dateStart, dateEnd);
  }
};

const MAX_NAME_LENGTH = 12;
export const trimName = (name, length = MAX_NAME_LENGTH) => {
  if (name.length <= length) return name;
  return `...${name.substr(-length)}`;
};

export const isDateRange = () => {
  const group = this.props.visualisation.getIn(['axes', 'group']);
  const ranges = ['minute', 'hour', 'weekday', 'date'];
  return ranges.indexOf(group) !== -1;
};
