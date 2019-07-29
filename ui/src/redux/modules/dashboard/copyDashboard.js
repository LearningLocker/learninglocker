import { List } from 'immutable';
import { call, put, takeEvery } from 'redux-saga/effects';
import { actions as routerActions } from 'redux-router5';
import { addModel } from 'ui/redux/modules/models';

export const COPY_DASHBOARD = 'learninglocker/dashboard/COPY_DASHBOARD';

/**
 * @param {immutable.Map} _.dashboard
 * @param {function} _.dispatch
 * @param {string} _.organisationId
 */
function* copyDashboard({ dashboard, dispatch, organisationId }) {
  const { model } = yield call(dispatch, addModel({
    schema: 'dashboard',
    props: {
      title: `Copied from "${dashboard.get('title', '')}"`,
      widgets: dashboard.get('widgets', new List()).map(widget => widget.filter((_, k) => k !== '_id')),
      shareable: dashboard.get('shareable', new List()).map(shareable => shareable.filter((_, k) => k !== '_id')),
      organisation: dashboard.get('organisation', organisationId),
      owner: dashboard.get('owner'),
      isPublic: dashboard.get('isPublic'),
      hasBeenMigrated: dashboard.get('hasBeenMigrated'),
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

function* watchCopyDashboardSaga() {
  if (__CLIENT__) yield takeEvery(COPY_DASHBOARD, copyDashboard);
}

export const sagas = [watchCopyDashboardSaga];
