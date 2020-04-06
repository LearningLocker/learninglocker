import { Map } from 'immutable';
import { actions as routerActions } from 'redux-router5';
import { put, call, takeEvery } from 'redux-saga/effects';
import buildTemplateStreamActivitiesWithMostComments from 'ui/containers/Visualisations/TemplateStreamActivitiesWithMostComments/buildModel';
import buildTemplateStreamInteractionsVsEngagement from 'ui/containers/Visualisations/TemplateStreamInteractionsVsEngagement/buildModel';
import buildTemplateStreamProportionOfSocialInteractions from 'ui/containers/Visualisations/TemplateStreamProportionOfSocialInteractions/buildModel';
import buildTemplateStreamCommentCount from 'ui/containers/Visualisations/TemplateStreamCommentCount/buildModel';
import buildTemplateStreamLearnerInteractionsByDateAndVerb from 'ui/containers/Visualisations/TemplateStreamLearnerInteractionsByDateAndVerb/buildModel';
import buildTemplateStreamUserEngagementLeaderboard from 'ui/containers/Visualisations/TemplateStreamUserEngagementLeaderboard/buildModel';
import buildTemplateLast7DaysStatements from 'ui/containers/Visualisations/TemplateLast7DaysStatements/buildModel';
import buildTemplateLearningExperienceType from 'ui/containers/Visualisations/TemplateLearningExperienceType/buildModel';
import { addModel } from '../models';

export const CREATE_STREAM_STARTER = 'learninglocker/dashboard/CREATE_STREAM_STARTER';

/**
 * @param {(action: object) => null} _.dispatch - react-redux dispatch
 * @param {string} _.userId
 * @returns {Promise<string[]>} - visualisationId list
 */
const createVisualisations = async ({ dispatch, userId }) => {
  const results = await Promise.all([
    dispatch(addModel({
      schema: 'visualisation',
      props: buildTemplateStreamInteractionsVsEngagement(new Map({ owner: userId })),
      isExpanded: false,
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: buildTemplateStreamCommentCount(new Map({ owner: userId })),
      isExpanded: false,
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: buildTemplateStreamLearnerInteractionsByDateAndVerb(new Map({ owner: userId })),
      isExpanded: false,
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: buildTemplateStreamUserEngagementLeaderboard(new Map({ owner: userId })),
      isExpanded: false,
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: buildTemplateStreamProportionOfSocialInteractions(new Map({ owner: userId })),
      isExpanded: false,
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: buildTemplateStreamActivitiesWithMostComments(new Map({ owner: userId })),
      isExpanded: false,
    })),
    dispatch(addModel({
      schema: 'visualisation',
      props: buildTemplateLast7DaysStatements(new Map({ owner: userId })),
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

function* createStreamStarter({ userId, organisationId, dispatch }) {
  const visualisationIds = yield call(createVisualisations, { dispatch, userId });

  const { model } = yield call(dispatch, addModel({
    schema: 'dashboard',
    props: {
      owner: userId,
      title: 'Stream Starter',
      type: 'streamStarter',
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

function* watchStreamStarterSaga() {
  if (__CLIENT__) yield takeEvery(CREATE_STREAM_STARTER, createStreamStarter);
}

export const sagas = [watchStreamStarterSaga];
