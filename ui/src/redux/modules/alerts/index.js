import { take, put, call, fork } from 'redux-saga/effects';
import { List } from 'immutable';
import { createSelector } from 'reselect';
import { handleActions } from 'redux-actions';
import { uniqueId, get } from 'lodash';
import { delay } from 'bluebird';

const ALERT = 'learninglocker/alerts/ALERT';
const ALERT_START = 'learninglocker/alerts/ALERT_START';
const DELETE_ALERT = 'learninglocker/alerts/DELETE_ALERT';
const DELETE_ALERT_BY_UUID = 'learninglocker/alerts/DELETE_ALERT_BY_UUID';

const MIN_DELAY = 2000;
const MS_PER_CHARACTER = 100;

export const DANGER = 'danger';
export const INFO = 'info';
export const WARNING = 'warning';
export const SUCCESS = 'success';

/*
 * Reducers
 */
const handler = handleActions({
  [ALERT_START]: (state, action) => state.push(action),
  [DELETE_ALERT]: (state, { key }) => state.delete(key),
  [DELETE_ALERT_BY_UUID]: (state, { uuid }) => state.filter(item => item.uuid !== uuid),
});

/*
 * Actions
 */
export const alert = ({
  schema,
  id,
  message,
  alertType = DANGER,
  options,
}) =>
  ({
    type: ALERT,
    alertType,
    schema,
    id,
    message,
    options,
  });

const alertFailureStart = ({
  schema,
  id,
  message,
  alertType,
  options,
  uuid = uniqueId(),
}) =>
  ({
    type: ALERT_START,
    schema,
    id,
    message,
    uuid,
    options,
    alertType,
  });

export const deleteAlert = ({
  key
}) =>
  ({
    type: DELETE_ALERT,
    key
  });

const deleteAlertByUuid = ({
  uuid
}) => ({
  type: DELETE_ALERT_BY_UUID,
  uuid,
});

/*
 * Selectors
 */
export const alertsSelector = state => state.alerts;

const initialState = new List();
export default function reducer(state = initialState, action = {}) {
  return handler(state, action);
}

export const getAlertsSelector = createSelector(
  [alertsSelector],
  alertState =>
    alertState.filter(alertItem => get(alertItem, ['options', 'status']) !== 404)
);

// const delayFn = ms => new Promise(resolve => setTimeout(resolve, ms));

function* alertSaga(action) {
  const uuid = uniqueId();

  yield put(alertFailureStart({
    ...action,
    uuid
  }));

  const delay1 = action.message.length * MS_PER_CHARACTER;

  let delay2 = delay1;
  if (delay1 < MIN_DELAY) { // allways show atleast for 2 seconds
    delay2 = MIN_DELAY;
  }

  yield call(
    delay,
    delay2
  );

  yield put(deleteAlertByUuid({ uuid }));
}

function* watchAlertsSaga() {
  while (__CLIENT__) {
    const action = yield take(ALERT);
    yield fork(alertSaga, action);
  }
}

export const sagas = [watchAlertsSaga];
