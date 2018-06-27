import { FETCH_MODELS } from 'ui/redux/modules/pagination/fetchModels';
import { put, takeEvery, select } from 'redux-saga/effects';
import { includes } from 'lodash';
import { SUPPORTED_SCHEMAS } from 'lib/constants/websocket';
import { Iterable } from 'immutable';
import { registerAction } from 'ui/redux/modules/websocket';


function* fetchModelsSaga({
  schema,
  filter,
  direction,
  cursor,
  first,
  last,
  sort
}) {
  // do the websocket stuff
  const state = yield select();
  if (
    state.auth.get('liveWebsockets', false) === false ||
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
    last
  }));
}

function* fetchModels() {
  if (__CLIENT__) yield takeEvery(FETCH_MODELS, fetchModelsSaga);
}

// eslint-disable-next-line import/prefer-default-export
export const sagas = [fetchModels];
