import { Map, Iterable } from 'immutable';
import { createSelector } from 'reselect';
import { call } from 'redux-saga/effects';
import moment from 'moment';
import { handleActions } from 'redux-actions';
import createAsyncDuck from 'ui/utils/createAsyncDuck';

export const IN_PROGRESS = 'IN_PROGRESS';
export const COMPLETED = 'COMPLETED';
export const FAILED = 'FAILED';

/**
 * REDUCERS
 */

/**
 * SELECTORS
 */
const cacheDuration = moment.duration({ minute: 3 });

const paginationSelector = state => state.pagination;

const countStateSelector = (schema, filter = new Map()) => createSelector(
  [paginationSelector],
  pagination => pagination.getIn([schema, filter, 'countState'], new Map())
);

const countSelector = (schema, filter = new Map()) => createSelector(
  [paginationSelector],
  pagination => pagination.getIn([schema, filter, 'totalCount'])
);

const cachedAtSelector = ({ schema, filter = new Map() }) => createSelector(
  [paginationSelector],
  pagination => pagination.getIn([schema, filter, 'countCachedAt'], moment(0))
);

const shouldFetchCountSelector = (schema, filter) => createSelector(
  [countStateSelector(schema, filter), cachedAtSelector({ schema, filter })],
  (countState, cachedAt) => {
    if (countState === IN_PROGRESS) return false;
    const cachedFor = moment().diff(cachedAt);
    if (cachedFor < cacheDuration.asMilliseconds()) return false;
    return true;
  }
);

const isLoadingCountSelector = (schema, filter) => createSelector(
  [countStateSelector(schema, filter)],
  countState => (countState === IN_PROGRESS)
);

const fetchModelsCount = createAsyncDuck({
  actionName: 'learninglocker/pagination/FETCH_MODELS_COUNT',
  failureDelay: 2000,

  reduceStart: (state, action) => {
    const { schema, filter } = action;
    return state.setIn([schema, filter, 'countState'], 'IN_PROGRESS');
  },
  reduceSuccess: (state, action) => {
    const { schema, filter, count } = action;
    return state
      .setIn([schema, filter, 'countState'], 'COMPLETED')
      .setIn([schema, filter, 'countCachedAt'], moment())
      .setIn([schema, filter, 'totalCount'], count);
  },
  reduceFailure: (state, action) => {
    const { schema, filter } = action;
    return state.setIn([schema, filter, 'countState'], 'FAILED');
  },
  reduceComplete: (state, action) => {
    const { schema, filter } = action;
    return state.setIn([schema, filter, 'countState'], null);
  },

  startAction: ({ schema, filter = new Map() }) =>
    ({ schema, filter }),
  successAction: ({ schema, filter, count }) =>
    ({ schema, filter, count }),
  failureAction: ({ schema, filter }) =>
    ({ schema, filter }),
  completeAction: ({ schema, filter }) =>
    ({ schema, filter }),
  checkShouldFire: ({ schema, filter }, state) =>
    shouldFetchCountSelector(schema, filter)(state),

  doAction: function* fetchModelCountSaga(
    { schema, filter, llClient }
  ) {
    const plainFilter = Iterable.isIterable(filter) ? filter.toJS() : filter;
    const { status, body } = yield call(llClient.countModels, schema, plainFilter);
    if (status >= 300) throw new Error(body.message || body);

    return yield ({ schema, filter, count: body.count });
  }
});

export const selectors = {
  countStateSelector,
  countSelector,
  shouldFetchCountSelector,
  isLoadingCountSelector
};

export const reducer = handleActions({
  ...fetchModelsCount.reducers
});
export const actions = fetchModelsCount.actions;
export const sagas = fetchModelsCount.sagas;
