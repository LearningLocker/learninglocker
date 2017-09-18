import { Map, fromJS } from 'immutable';
import { handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { put, call } from 'redux-saga/effects';
import createAsyncDuck from 'ui/utils/createAsyncDuck';

const FETCH_APP_DATA = 'learninglocker/app/FETCH_APP_DATA';
const SET_APP_DATA = 'learninglocker/app/SET_APP_DATA';

/*
 * Reducers
 */
const handler = handleActions({
  [SET_APP_DATA]: (state, { key, value }) =>
    state.set(key, value),
});

const initialState = {};
export default function reducer(state = initialState, action = {}) {
  if (!Map.isMap(state)) return reducer(fromJS(state), action); // ensure immutability
  return handler(state, action);
}

/*
 * Actions
 */
export const setAppData = (key, value) => ({
  type: SET_APP_DATA,
  key,
  value
});

const fetchAppDataDuck = createAsyncDuck({
  actionName: FETCH_APP_DATA,
  checkShouldFire: ({ key }, state) => !state.app.hasIn(key),
  doAction: function* fetchAppDataSaga({ key, llClient }) {
    const { status, body } = yield call(llClient.getAppData, key);
    if (status >= 400) throw new Error(body.errmsg || body.message || body);
    yield put(setAppData(key, fromJS(body)));
    return yield body;
  }
});

/*
 * Selectors
 */
const appSelector = state => state.app;

export const getAppDataSelector = key => createSelector(
  [appSelector],
  state => state.get(key, new Map())
);

export const fetchAppData = fetchAppDataDuck.actions.start;
export const sagas = fetchAppDataDuck.sagas;
