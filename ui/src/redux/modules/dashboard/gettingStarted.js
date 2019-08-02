import { Map } from 'immutable';
import { actions as routerActions } from 'redux-router5';
import { put, call, takeEvery } from 'redux-saga/effects';
import {
  TEMPLATE_MOST_POPULAR_VERBS,
  TEMPLATE_WEEKDAYS_ACTIVITY,
} from 'lib/constants/visualise';
import { LAST_2_MONTHS } from 'ui/utils/constants';
import buildTemplateLast7DaysStatements from 'ui/containers/Visualisations/TemplateLast7DaysStatements/buildModel';
import buildTemplateActivityOverTime from 'ui/containers/Visualisations/TemplateActivityOverTime/buildModel';
import buildTemplateMostActivePeople from 'ui/containers/Visualisations/TemplateMostActivePeople/buildModel';
import buildTemplateMostPopularActivities from 'ui/containers/Visualisations/TemplateMostPopularActivities/buildModel';
import { addModel } from '../models';

export const CREATE_GETTING_STARTED = 'learninglocker/dashboard/CREATE_GETTING_STARTED';

/**
 * @param {(action: object) => null} _.dispatch - react-redux dispatch
 * @param {string} _.userId
 * @returns {Promise<string[]>} - visualisationId list
 */
const createVisualisations = async ({ dispatch, userId }) => {
  const results = await Promise.all([
    dispatch(addModel({
      schema: 'visualisation',
      props: buildTemplateLast7DaysStatements(new Map({ owner: userId })),
      isExpanded: false,
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: buildTemplateActivityOverTime(new Map({ owner: userId })),
      isExpanded: false,
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: {
        description: 'What are the most popular verbs?',
        type: TEMPLATE_MOST_POPULAR_VERBS,
        previewPeriod: LAST_2_MONTHS,
        axesgroup: new Map({ optionKey: 'verb', searchString: 'Verb' }),
        owner: userId,
      },
      isExpanded: false,
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: buildTemplateMostPopularActivities(new Map({ owner: userId })),
      isExpanded: false,
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: buildTemplateMostActivePeople(new Map({ owner: userId })),
      isExpanded: false,
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: {
        description: 'How does activity change in a week?',
        type: TEMPLATE_WEEKDAYS_ACTIVITY,
        axesgroup: new Map({ optionKey: 'weekday', searchString: 'Day' }),
        owner: userId,
      },
      isExpanded: false,
    })),
  ]);

  return results.map(r => r.model.get('_id'));
};

function* createGettingStarted({ userId, organisationId, dispatch }) {
  const visualisationIds = yield call(createVisualisations, { dispatch, userId });

  const { model } = yield call(dispatch, addModel({
    schema: 'dashboard',
    props: {
      owner: userId,
      title: 'Getting Started',
      isExpanded: true,
      widgets: [
        { x: 0, y: 0, w: 6, h: 8, visualisation: visualisationIds[0] },
        { x: 6, y: 0, w: 6, h: 8, visualisation: visualisationIds[1] },
        { x: 0, y: 8, w: 6, h: 9, visualisation: visualisationIds[2] },
        { x: 6, y: 8, w: 6, h: 9, visualisation: visualisationIds[3] },
        { x: 0, y: 17, w: 6, h: 9, visualisation: visualisationIds[4] },
        { x: 6, y: 17, w: 6, h: 9, visualisation: visualisationIds[5] },
      ],
    },
  }));

  yield put(routerActions.navigateTo(
    'organisation.data.dashboards.id',
    {
      organisationId,
      dashboardId: model.get('_id'),
    }
  ));
}

function* watchGettingStartedSaga() {
  if (__CLIENT__) yield takeEvery(CREATE_GETTING_STARTED, createGettingStarted);
}

export const sagas = [watchGettingStartedSaga];
