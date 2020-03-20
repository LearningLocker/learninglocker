import { List, Map } from 'immutable';
import { call, put, takeEvery } from 'redux-saga/effects';
import { actions as routerActions } from 'redux-router5';
import { addModel } from 'ui/redux/modules/models';
import { IGNORING_COLUMN_SET as VIZ_IGNORING_COLUMN_SET } from 'ui/redux/modules/visualisation/copyVisualisation';

export const COPY_DASHBOARD = 'learninglocker/dashboard/COPY_DASHBOARD';

/**
 * @type {Set} - not immutable.Set
 */
const IGNORING_COLUMN_SET = new Set(['_id', 'updatedAt', 'createdAt', '__v', 'owner']);

/**
 * This function includes effect
 *
 * @param {(action: object) => null} _.dispatch - react-redux dispatch
 * @param {immutable.List<immutable.Map>} _.visualisations
 * @param {string} _.userId
 * @returns {Promise<immutable.List>} - new visualisation list
 */
const copyVisualisations = async ({ dispatch, visualisations, userId }) => {
  const promises = visualisations.map(visualisation => dispatch(addModel({
    schema: 'visualisation',
    props: visualisation
      .filter((_, k) => !VIZ_IGNORING_COLUMN_SET.has(k))
      .set('owner', userId),
    isExpanded: false,
  }))).toJS();

  const results = await Promise.all(promises);
  return new List(results.map(result => result.model));
};

/**
 * @param {function} _.dispatch
 * @param {immutable.Map} _.dashboard
 * @param {immutable.List<immutable.Map>} _.visualisations
 * @param {string} _.organisationId
 * @param {string} _.userId
 */
function* copyDashboard({ dashboard, visualisations, dispatch, organisationId, userId }) {
  // Copy visualisations
  const uniqueVisualisations = visualisations.toSet().toList();
  const newVisualisations = yield call(
    copyVisualisations,
    { dispatch, visualisations: uniqueVisualisations, userId }
  );

  // Map original visualisationId to copied visualisationId
  const mapOriginalToCopied = uniqueVisualisations.reduce(
    (acc, v, i) => acc.set(v.get('_id'), newVisualisations.getIn([i, '_id'])),
    new Map(),
  );

  const newWidgets = dashboard
    .get('widgets', new List())
    .map((widget) => {
      const filteredWidget = widget.filter((_, k) => k !== '_id');
      const originalVisualisationId = widget.get('visualisation');
      if (originalVisualisationId) {
        const newVisualisationId = mapOriginalToCopied.get(originalVisualisationId);
        return filteredWidget.set('visualisation', newVisualisationId);
      }
      return filteredWidget;
    });

  const newShareable = dashboard
    .get('shareable', new List())
    .map(shareable => shareable.filter((_, k) => k !== '_id'));

  const newDashboard = dashboard
    .filter((_, k) => !IGNORING_COLUMN_SET.has(k))
    .set('widgets', newWidgets)
    .set('shareable', newShareable)
    .set('owner', userId);

  const { model } = yield call(dispatch, addModel({
    schema: 'dashboard',
    props: newDashboard,
  }));

  yield put(routerActions.navigateTo(
    'organisation.data.dashboards.id',
    {
      organisationId,
      dashboardId: model.get('_id'),
    }
  ));
}

function* watchCopyDashboardSaga() {
  if (__CLIENT__) yield takeEvery(COPY_DASHBOARD, copyDashboard);
}

export const sagas = [watchCopyDashboardSaga];
