import { Map } from 'immutable';
import { actions as routerActions } from 'redux-router5';
import { put, call, takeEvery } from 'redux-saga/effects';
import buildTemplateCuratrActivitiesWithMostComments from 'ui/containers/Visualisations/TemplateCuratrActivitiesWithMostComments/buildModel';
import buildTemplateCuratrInteractionsVsEngagement from 'ui/containers/Visualisations/TemplateCuratrInteractionsVsEngagement/buildModel';
import buildTemplateCuratrProportionOfSocialInteractions from 'ui/containers/Visualisations/TemplateCuratrProportionOfSocialInteractions/buildModel';
import buildTemplateCuratrCommentCount from 'ui/containers/Visualisations/TemplateCuratrCommentCount/buildModel';
import buildTemplateCuratrLearnerInteractionsByDateAndVerb from 'ui/containers/Visualisations/TemplateCuratrLearnerInteractionsByDateAndVerb/buildModel';
import buildTemplateCuratrUserEngagementLeaderboard from 'ui/containers/Visualisations/TemplateCuratrUserEngagementLeaderboard/buildModel';
import buildTemplateLast7DaysStatements from 'ui/containers/Visualisations/TemplateLast7DaysStatements/buildModel';
import { addModel } from '../models';

export const CREATE_CURATR_STARTER = 'learninglocker/dashboard/CREATE_CURATR_STARTER';

/**
 * @param {(action: object) => null} _.dispatch - react-redux dispatch
 * @param {string} _.userId
 * @returns {Promise<string[]>} - visualisationId list
 */
const createVisualisations = async ({ dispatch, userId }) => {
  const results = await Promise.all([
    dispatch(addModel({
      schema: 'visualisation',
      props: buildTemplateCuratrInteractionsVsEngagement(new Map({ owner: userId })),
      isExpanded: false,
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: buildTemplateCuratrCommentCount(new Map({ owner: userId })),
      isExpanded: false,
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: buildTemplateCuratrLearnerInteractionsByDateAndVerb(new Map({ owner: userId })),
      isExpanded: false,
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: buildTemplateCuratrUserEngagementLeaderboard(new Map({ owner: userId })),
      isExpanded: false,
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: buildTemplateCuratrProportionOfSocialInteractions(new Map({ owner: userId })),
      isExpanded: false,
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: buildTemplateCuratrActivitiesWithMostComments(new Map({ owner: userId })),
      isExpanded: false,
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: buildTemplateLast7DaysStatements(new Map({ owner: userId })),
      isExpanded: false,
    }))
  ]);

  return results.map(r => r.model.get('_id'));
};

function* createCuratrStarter({ userId, organisationId, dispatch }) {
  const visualisationIds = yield call(createVisualisations, { dispatch, userId });

  const { model } = yield call(dispatch, addModel({
    schema: 'dashboard',
    props: {
      owner: userId,
      title: 'Curatr Starter',
      isExpanded: true,
      widgets: [
        { x: 0, y: 0, w: 6, h: 8, visualisation: visualisationIds[0] },
        { x: 6, y: 0, w: 3, h: 8, visualisation: visualisationIds[1] },
        { x: 9, y: 0, w: 3, h: 8, visualisation: visualisationIds[6] },
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

function* watchCuratrStarterSaga() {
  if (__CLIENT__) yield takeEvery(CREATE_CURATR_STARTER, createCuratrStarter);
}

export const sagas = [watchCuratrStarterSaga];
