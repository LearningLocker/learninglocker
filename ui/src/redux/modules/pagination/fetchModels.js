import { Map, fromJS, OrderedSet, Iterable, OrderedMap } from 'immutable';
import { createSelector } from 'reselect';
import { map } from 'lodash';
import moment from 'moment';
import { put, call } from 'redux-saga/effects';
import { handleActions } from 'redux-actions';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import * as schemas from 'ui/utils/schemas';
import { normalize, arrayOf } from 'normalizr';
import entityReviver from 'ui/redux/modules/models/entityReviver';
import * as mergeEntitiesDuck from 'ui/redux/modules/models/mergeEntities';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';
import Unauthorised from 'lib/errors/Unauthorised';
import diffEdges from './fetchModelsDiff';


export const FORWARD = 'FORWARD'; // forward pagination direction
export const BACKWARD = 'BACKWARD'; // backward pagination direction

/**
 * REDUCERS
 */

/**
 * SELECTORS
 */
const cacheDuration = moment.duration({ minute: 3 });

const defaultFilter = new Map();
const defaultSort = new Map({ createdAt: -1, _id: 1 });

const paginationSelector = state => state.pagination;

const paginationStateSelector = (
  schema,
  filter = defaultFilter,
  sort = defaultSort
) =>
  createSelector(paginationSelector,
    pagination =>
      pagination.getIn([schema, filter, sort], new Map())
  );

const paginationPageInfoSelector = (schema, filter, sort) =>
  createSelector(paginationStateSelector(schema, filter, sort), pagination =>
    pagination.get('pageInfo', new Map())
  );

const cursorSelector = (schema, filter, sort, direction) =>
  createSelector(paginationPageInfoSelector(schema, filter, sort), (pageInfo) => {
    switch (direction) {
      case FORWARD:
        return fromJS({ after: pageInfo.get('endCursor', null) });
      case BACKWARD:
        return fromJS({ before: pageInfo.get('startCursor', null) });
      default:
        return pageInfo.get('currentCursor');
    }
  });

const requestStateSelector = ({ schema, filter, sort, cursor }) =>
  createSelector(paginationStateSelector(schema, filter, sort), pagination =>
    pagination.getIn([cursor, 'requestState'], false)
  );

const cachedAtSelector = ({ schema, filter, sort, cursor }) =>
  createSelector(paginationStateSelector(schema, filter, sort), pagination =>
    pagination.getIn([cursor, 'cachedAt'], moment(0))
  );

const shouldFetchSelector = ({ schema, filter, sort, cursor }) => (createSelector(
  [
    requestStateSelector({ schema, filter, sort, cursor }),
    cachedAtSelector({ schema, filter, sort, cursor })
  ],
  (requestState, cachedAt) => {
    if (requestState === IN_PROGRESS) {
      return false;
    }

    const cachedFor = moment().diff(cachedAt);
    if (cachedFor < cacheDuration.asMilliseconds()) {
      return false;
    }
    return true;
  })
);

const isLoadingSelector = paginationArgs =>
  createSelector(
    requestStateSelector(paginationArgs),
    requestState => requestState === IN_PROGRESS
  );

const isCompletedSelector = paginationArgs =>
  createSelector(
    requestStateSelector(paginationArgs),
    requestState => requestState === COMPLETED
  );

export const idsByFilterSelector = (schema, filter, sort) =>
  createSelector(
    paginationStateSelector(schema, filter, sort),
    (pagination) => {
      const out =
        pagination
          .get('edges', new OrderedSet())
          .map(item => (item.get('id')))
      ;

      return out;
    }
  );

const hasMoreSelector = (schema, filter, sort, direction = FORWARD) =>
  createSelector(paginationPageInfoSelector(schema, filter, sort), (pageInfo) => {
    switch (direction) {
      case FORWARD:
        return pageInfo.get('hasNextPage', false);
      case BACKWARD:
        return pageInfo.get('hasPreviousPage', false);
      default:
        return false;
    }
  });

export const reduceStart = (state, { schema, filter, sort, cursor }) => (
  state
    .setIn([schema, filter, sort, cursor, 'requestState'], IN_PROGRESS)
    .setIn([schema, filter, sort, 'pageInfo', 'currentCursor'], cursor)
);

export const reduceSuccess = (
  state,
  {
    schema,
    filter,
    sort,
    edges,
    pageInfo,
    cursor, // {before: after:}
    direction
  }
) => {
  const cachedAt = moment();

  const newEdges = new OrderedSet(edges)
    .map(item => item.set('cachedAt', cachedAt));

  const oldEdges = state.getIn([schema, filter, sort, 'edges'], new OrderedSet());
  const cursorKey = cursor !== undefined ? (cursor.get('after') || cursor.get('before')) : undefined;

  const newEdges2 = new OrderedSet(
    diffEdges(
      newEdges,
      oldEdges,
      cursorKey,
      pageInfo,
      direction
    )
  );

  const out = state
    .mergeIn([schema, filter, sort, 'pageInfo'], pageInfo)
    .setIn([schema, filter, sort, cursor, 'cachedAt'], cachedAt)
    .setIn([schema, filter, sort, cursor, 'requestState'], COMPLETED)
    .setIn([schema, filter, sort, 'edges'], newEdges2);

  return out;
};

const fetchModels = createAsyncDuck({
  actionName: 'learninglocker/pagination/FETCH_MODELS',
  failureDelay: 2000,

  reduceStart,

  reduceSuccess,

  reduceFailure: (state, { schema, filter, sort, cursor }) =>
    state.setIn([schema, filter, sort, cursor, 'requestState'], FAILED)
      .setIn([schema, filter, sort, cursor, 'cachedAt'], moment()),

  reduceComplete: (state, { schema, filter, sort, cursor }) =>
    state.setIn([schema, filter, sort, cursor, 'requestState'], null),

  startAction: (
    {
      schema,
      filter = defaultFilter,
      sort = defaultSort,
      direction,
      first,
      last,
      cursor
    }
  ) => ({
    schema,
    filter,
    sort,
    direction,
    first,
    last,
    cursor
  }),

  successAction: ({
    schema,
    filter,
    sort,
    direction,
    ids,
    pageInfo,
    cursor,
    edges
  }) => ({ schema, filter, sort, direction, ids, pageInfo, cursor, edges }),

  failureAction: ({ schema, filter, sort, cursor }) => ({
    schema,
    filter,
    sort,
    cursor
  }),

  completeAction: ({ schema, filter, sort, cursor }) => ({
    schema,
    filter,
    sort,
    cursor
  }),

  checkShouldFire: ({ schema, filter, sort, cursor }, state) =>
    (shouldFetchSelector({ schema, filter, sort, cursor })(state)),

  doAction: function* fetchModelSaga({
    schema,
    filter,
    sort,
    direction,
    cursor,
    llClient,
    first,
    last
  }) {
    const plainFilter = Iterable.isIterable(filter) ? filter.toJS() : filter;
    const plainSort = Iterable.isIterable(sort) ? sort.toJS() : sort;
    const plainCursor = Iterable.isIterable(cursor) ? cursor.toJS() : cursor;

    const schemaClass = schemas[schema];
    const { status, body } = yield call(llClient.getConnection, {
      schema,
      filter: plainFilter,
      sort: plainSort,
      cursor: plainCursor,
      first,
      last
    });

    if (status === 401) {
      throw new Unauthorised('Unauthorised');
    }
    if (status >= 300) {
      throw new Error(body.message || body);
    }

    const models = map(body.edges, 'node');
    const ids = map(models, '_id');
    const edges = map(body.edges, item => (new OrderedMap({ id: item.node._id, cursor: item.cursor })));
    const normalizedModels = normalize(models, arrayOf(schemaClass));
    const entities = entityReviver(normalizedModels);
    const pageInfo = fromJS(body.pageInfo);

    // put all of the models into the master record in the model store
    yield put(mergeEntitiesDuck.actions.mergeEntitiesAction(entities));

    // map the ids against the filter in the pagination store
    return yield { schema, filter, sort, cursor, direction, edges, pageInfo, ids };
  }
});

const fetchAllOutstandingModels = ({
  schema,
  filter,
  sort,
  direction,
  first,
  last,
  cursor,
  fetchModelsStart = fetchModels.actions.start // whilst waiting for https://github.com/facebook/jest/issues/3608 to be fixed
}) => ((dispatch, getState) => {
  const oldState = getState();

  const fetchStateRecurse = (cursor2) => {
    const result = dispatch(
        fetchModelsStart(
          { schema, filter, sort, direction, first, last, cursor: cursor2 }
        )
      );

    const result2 = result.then((newState) => {
      if (!newState) {
        return;
      }

      const oldEdges = oldState.pagination.getIn([schema, filter, sort, 'edges'], new OrderedSet());

      if (direction === FORWARD &&
        !newState.pageInfo.get('hasNextPage')
      ) {
        return;
      }

      if (direction === BACKWARD &&
        !newState.pageInfo.get('hasPreviousPage')
      ) {
        return;
      }

      if (newState.edges.length === 0) {
        return;
      }
      const lastCursor = newState.edges[newState.edges.length - 1].get('cursor');

      if (
        oldEdges.map(item => item.get('cursor'))
          .butLast().contains(lastCursor)
      ) {
        return fetchStateRecurse(new Map({ after: lastCursor }));
      }
    });

    const allPromise = Promise.all([result, result2]);
    return allPromise;
  };

  return fetchStateRecurse(cursor);
});

const fetchMore = ({
  schema,
  filter,
  sort,
  direction = FORWARD,
  first = 10,
  last
}) => (dispatch, getState) => (dispatch(
    fetchModels.actions.start(
      { schema,
        filter,
        sort,
        direction,
        first,
        last,
        cursor: cursorSelector(schema, filter, sort, direction)(getState())
      },
      getState()
    )
  )
);

export const selectors = {
  paginationSelector,
  paginationStateSelector,
  requestStateSelector,
  shouldFetchSelector,
  paginationPageInfoSelector,
  cursorSelector,
  isLoadingSelector,
  isCompletedSelector,
  idsByFilterSelector,
  hasMoreSelector
};

export const reducer = handleActions({
  ...fetchModels.reducers
});
export const actions = { fetchMore, fetchAllOutstandingModels, ...fetchModels.actions };
export const sagas = fetchModels.sagas;
