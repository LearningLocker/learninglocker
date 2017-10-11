import { put, call, takeEvery } from 'redux-saga/effects';
import Promise from 'bluebird';
import identity from 'lodash/identity';
import DispatchNotReadyError from 'ui/utils/errors/DispatchNotReadyError';
import Unauthorised from 'lib/errors/Unauthorised';
import { actions as logoutAcitons } from 'ui/redux/modules/auth/logout';
import { alert } from 'ui/redux/modules/alerts';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export default function createAsyncDuck({
  actionName,
  reduceStart = identity,
  reduceSuccess = identity,
  reduceFailure = identity,
  reduceComplete = identity,

  startAction = identity,
  successAction = identity,
  failureAction = identity,
  completeAction = identity,
  checkShouldFire = () => true, // (args, state) => bool

  doAction,

  successDelay = 2000,
  failureDelay = 2000
}) {
  // CREATE ACTION NAMES
  const START = actionName;
  const SUCCESS = `${START}_SUCCESS`;
  const FAILURE = `${START}_FAILURE`;
  const COMPLETE = `${START}_COMPLETE`;
  const constants = {
    start: START,
    success: SUCCESS,
    failure: FAILURE,
    complete: COMPLETE,
  };

  // CREATE REDUCERS
  const reducers = {
    [START]: reduceStart,
    [SUCCESS]: reduceSuccess,
    [FAILURE]: reduceFailure,
    [COMPLETE]: reduceComplete,
  };

  // CREATE ACTIONS
  // returns a promise from the action and passes resolve / reject in the action body
  // will not dispatch the action if checkShouldFire returns false
  // requires redux-thunk
  const wrapStartAction = args =>
    (dispatch, getState) => new Promise((resolve, reject) => {
      const action = startAction(args, getState());

      const shouldFire = checkShouldFire(action, getState());
      if (!shouldFire) return reject(new DispatchNotReadyError(`${actionName} not ready to fire`));
      const result = dispatch({ ...action, resolve, reject, type: START });
      return result;
    })
    .catch(DispatchNotReadyError, () => {});
  const wrapSuccessAction = args => ({ ...successAction(args), type: SUCCESS });
  const wrapFailureAction = args => ({ ...failureAction(args), type: FAILURE });
  const wrapCompleteAction = args => ({ ...completeAction(args), type: COMPLETE });

  const actions = {
    start: wrapStartAction,
    success: wrapSuccessAction,
    failure: wrapFailureAction,
    complete: wrapCompleteAction
  };

  // CREATE SAGAS
  function* doActionSaga(args) {
    try {
      const result = yield call(doAction, args);
      yield put(actions.success(result));
      args.resolve(result);
      if (successDelay > -1) {
        yield call(delay, successDelay); // shows the success state for 2 seconds
        yield put(actions.complete(args));
      }
    } catch (err) {
      yield put(actions.failure({ ...args, message: err.message }));
      yield put(alert({
        ...args,
        message: err.message,
        options: {
          status: err.status
        }
      }));

      args.reject(err);
      if (failureDelay > -1) {
        yield call(delay, failureDelay); // shows the failure state for 2 seconds
        yield put(actions.complete(args));
      }
      if (err.constructor === Unauthorised) {
        yield put(logoutAcitons.logoutAction());
      }
    }
  }

  function* watchForActionSaga() {
    if (__CLIENT__) yield takeEvery(START, doActionSaga);
  }

  return {
    constants,
    reducers,
    actions,
    sagas: [watchForActionSaga],
  };
}
