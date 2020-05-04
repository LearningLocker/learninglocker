import { Map } from 'immutable';
import { actions as routerActions } from 'redux-router5';
import { put, call, takeEvery } from 'redux-saga/effects';
import buildTemplateLast7DaysStatements from 'ui/containers/Visualisations/TemplateLast7DaysStatements/buildModel';
import buildTemplateActivityOverTime from 'ui/containers/Visualisations/TemplateActivityOverTime/buildModel';
import buildTemplateMostActivePeople from 'ui/containers/Visualisations/TemplateMostActivePeople/buildModel';
import buildTemplateMostPopularActivities from 'ui/containers/Visualisations/TemplateMostPopularActivities/buildModel';
import buildTemplateMostPopularVerbs from 'ui/containers/Visualisations/TemplateMostPopularVerbs/buildModel';
import buildTemplateWeekdaysActivity from 'ui/containers/Visualisations/TemplateWeekdaysActivity/buildModel';
import buildTemplateLearningExperienceType from 'ui/containers/Visualisations/TemplateLearningExperienceType/buildModel';
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
      props: buildTemplateMostPopularVerbs(new Map({ owner: userId })),
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
      props: buildTemplateWeekdaysActivity(new Map({ owner: userId })),
      isExpanded: false,
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: buildTemplateLearningExperienceType(new Map({ owner: userId })),
      isExpanded: false,
    }))
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
      type: 'gettingStarted',
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
