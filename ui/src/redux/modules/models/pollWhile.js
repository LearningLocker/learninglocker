import { put, call, select, take, fork } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { fetchModel, modelsSchemaIdSelector } from 'ui/redux/modules/models';

export const POLL_WHILE = 'learninglocker/models/POLL_WHILE';

/**
 * REDUCERS
 */

/**
 * SELECTORS
 */

/**
 * ACTIONS
 */
const pollWhile = ({ id, schema, doWhile = () => false }) => ({
  type: POLL_WHILE,
  schema,
  id,
  doWhile
});

/**
 * SAGAS
 */
function* doPoll({ schema, id, doWhile }) {
  let model = yield select(state => modelsSchemaIdSelector(schema, id)(state));
  while (doWhile(model)) {
    yield put(fetchModel({ schema, id, force: true }));
    yield call(delay, 8000);
    model = yield select(state => modelsSchemaIdSelector(schema, id)(state));
  }
}

function* watchForPollSaga() {
  const existingPolls = {};
  while (__CLIENT__) {
    const { schema, id, doWhile } = yield take(POLL_WHILE);
    const existingPoll = existingPolls[schema] && existingPolls[schema][id];
    const model = yield select(state => modelsSchemaIdSelector(schema, id)(state));

    const taskRunning = existingPoll && (existingPoll.isRunning() && !existingPoll.isCancelled());
    const shouldFork = doWhile(model) && !taskRunning;

    if (shouldFork) {
      existingPolls[schema] = existingPolls[schema] || {};
      existingPolls[schema][id] = yield fork(doPoll, { schema, id, doWhile });
    }
  }
}

export const selectors = {};
export const reducers = {};
export const actions = { pollWhile };
export const sagas = [watchForPollSaga];
