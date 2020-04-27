import { actions as routerActions } from 'redux-router5';
import { put, call, takeEvery } from 'redux-saga/effects';
import { addModel } from '../models';

export const CREATE_BLANK_DASHBOARD = 'learninglocker/dashboard/CREATE_BLANK_DASHBOARD';

function* createBlankDashboard({ userId, organisationId, dispatch }) {
  const { model } = yield call(dispatch, addModel({
    schema: 'dashboard',
    props: {
      owner: userId,
      title: 'Blank Dashboard',
      type: 'blankDashboard',
      isExpanded: true,
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

function* watchBlankDashboardSaga() {
  if (__CLIENT__) yield takeEvery(CREATE_BLANK_DASHBOARD, createBlankDashboard);
}

export const sagas = [watchBlankDashboardSaga];
