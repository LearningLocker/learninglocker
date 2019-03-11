import {
  FETCH_MODELS,
} from 'ui/redux/modules/pagination/fetchModels';
import {
  put,
  takeEvery,
  select,
  take
} from 'redux-saga/effects';
import { includes } from 'lodash';
import { SUPPORTED_SCHEMAS } from 'lib/constants/websocket';
import { Iterable } from 'immutable';
import { registerAction } from 'ui/redux/modules/websocket';
import { loggedInUserSelector } from 'ui/redux/modules/auth';

const shouldLiveUpdateSelector = ({ schema }) => (state) => {
  const out = loggedInUserSelector(state).getIn(
    ['liveUpdatesOverrides', schema],
    loggedInUserSelector(state).get('liveUpdates', true));
  return out;
};

function* fetchModelsSaga({
  schema,
  filter,
  direction,
  cursor,
  first,
  last,
  sort,
}) {
  // do the websocket stuff
  const state = yield select();

  // user needs to be loaded
  while (loggedInUserSelector(state).size === 0) {
    yield take(`${FETCH_MODELS}_SUCCESS`);
  }

  if (
    loggedInUserSelector(state).get('liveWebsockets', false) === false ||
    !(includes(SUPPORTED_SCHEMAS, schema))
  ) {
    return;
  }

  const plainFilter = Iterable.isIterable(filter) ? filter.toJS() : filter;
  const plainSort = Iterable.isIterable(sort) ? sort.toJS() : sort;
  const plainCursor = Iterable.isIterable(cursor) ? cursor.toJS() : cursor;

  yield put(registerAction({
    schema,
    filter: plainFilter,
    sort: plainSort,
    cursor: plainCursor,
    direction,
    first,
    last: last || (!shouldLiveUpdateSelector({ schema })(state) && -1)
  }));
}

function* fetchModels() {
  if (__CLIENT__) yield takeEvery(FETCH_MODELS, fetchModelsSaga);
}

// eslint-disable-next-line import/prefer-default-export
export const sagas = [fetchModels];
