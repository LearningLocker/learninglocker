import { Map } from 'immutable';
import { actions as routerActions } from 'redux-router5';
import { put, call, takeEvery } from 'redux-saga/effects';
import {
  LEADERBOARD,
  STATEMENTS,
  FREQUENCY,
  COUNTER,
  LAST_2_MONTHS,
} from 'ui/utils/constants';
import { addModel } from '../models';

export const CREATE_GETTING_STARTED = 'learninglocker/dashboard/CREATE_GETTING_STARTED';

/**
 * @param {(action: object) => null} dispatch - react-redux dispatch
 * @returns {Promise<string[]>} - visualisationId list
 */
const createVisualisations = async (dispatch) => {
  const results = await Promise.all([
    dispatch(addModel({
      schema: 'visualisation',
      props: {
        description: 'How many statements have been stored in the last 7 days?',
        type: COUNTER,
      },
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: {
        description: 'How has activity changed over time?',
        type: FREQUENCY,
        previewPeriod: LAST_2_MONTHS,
      },
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: {
        description: 'What are the most popular verbs?',
        type: LEADERBOARD,
        previewPeriod: LAST_2_MONTHS,
        axesgroup: new Map({ optionKey: 'verb', searchString: 'Verb' }),
      },
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: {
        description: 'What are the most popular activities?',
        type: LEADERBOARD,
        previewPeriod: LAST_2_MONTHS,
        axesgroup: new Map({ optionKey: 'activities', searchString: 'Activity' }),
      },
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: {
        description: 'How has activity changed over time?',
        type: LEADERBOARD,
        previewPeriod: LAST_2_MONTHS,
        axesgroup: new Map({ optionKey: 'people', searchString: 'Person' }),
      },
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: {
        description: 'How does activity change in a week?',
        type: STATEMENTS,
        axesgroup: new Map({ optionKey: 'weekday', searchString: 'Day' }),
      },
    })),
  ]);

  return results.map(r => r.model.get('_id'));
};

function* createGettingStarted({ userId, organisationId, dispatch }) {
  const visualisationIds = yield call(createVisualisations, dispatch);

  const { model } = yield call(dispatch, addModel({
    schema: 'dashboard',
    props: {
      owner: userId,
      title: 'Getting Started',
      isExpanded: true,
      widgets: [
        { x: 0, y: 0, w: 3, h: 4, visualisation: visualisationIds[0] },
        { x: 3, y: 0, w: 6, h: 11, visualisation: visualisationIds[1] },
        { x: 0, y: 4, w: 3, h: 7, visualisation: visualisationIds[2] },
        { x: 0, y: 11, w: 3, h: 8, visualisation: visualisationIds[3] },
        { x: 6, y: 11, w: 3, h: 8, visualisation: visualisationIds[4] },
        { x: 3, y: 11, w: 3, h: 8, visualisation: visualisationIds[5] },
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
