import { fromJS, Map, OrderedMap } from 'immutable';
import { createSelector } from 'reselect';
import { call, fork, put, select, take } from 'redux-saga/effects';
import { END, eventChannel } from 'redux-saga';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import { COMPLETED, FAILED, IN_PROGRESS } from 'ui/utils/constants';
import { getAppDataSelector } from 'ui/redux/modules/app';
import {
  websocketSelector,
  setWebsocketAction,
  websocketClosedAction
} from 'ui/redux/modules/aggregationWs/websocket';
import Cookies from 'js-cookie';
import { get, pickBy } from 'lodash';
import { testCookieName } from 'ui/utils/auth';
import { AGGREGATION_PROCESSOR_REGISTER } from 'lib/constants/aggregationProcessor';
import { v4 } from 'uuid';

export function defaultMapping(results) {
  return new Map({
    result: results && new OrderedMap(results.map(v => fromJS([v._id, v]))),
  });
}

const aggregationSelector = state => state.aggregationWs;

const aggregationRequestStateSelector = (pipeline, timeInterval) => createSelector(
  aggregationSelector,
  aggregations => aggregations.getIn(
    [
      new Map({
        pipeline,
        timeIntervalSinceToday: get(timeInterval, 'timeIntervalSinceToday'),
        timeIntervalUnits: get(timeInterval, 'timeIntervalUnits'),
        ...(get(timeInterval, 'timeIntervalSincePreviousTimeInterval')
            ? {
              timeIntervalSincePreviousTimeInterval: get(timeInterval, 'timeIntervalSincePreviousTimeInterval')
            }
            : {}
        )
      }),
      'requestState'
    ]
  )
);

const aggregationShouldFetchSelector = (pipeline, timeInterval) => createSelector(
  aggregationRequestStateSelector(pipeline, timeInterval),
  requestState => (
      requestState !== IN_PROGRESS &&
      requestState !== COMPLETED &&
      requestState !== FAILED
    )
);

const fetchAggregation = createAsyncDuck({
  actionName: 'learninglocker/aggregation/FETCH_AGGREGATION_WS',
  failureDelay: 2000,

  reduceStart: (
    state,
    {
      pipeline,
      timeIntervalSinceToday,
      timeIntervalUnits,
      timeIntervalSincePreviousTimeInterval
    }
  ) => state.setIn(
    [
      new Map({
        pipeline,
        timeIntervalSinceToday,
        timeIntervalUnits,
        ...(timeIntervalSincePreviousTimeInterval ? { timeIntervalSincePreviousTimeInterval } : {})
      }),
      'requestState'
    ],
    IN_PROGRESS
  ),

  reduceSuccess: (
    state,
    {
      pipeline,
      timeIntervalSinceToday,
      timeIntervalUnits,
      timeIntervalSincePreviousTimeInterval,
      result
    }
  ) => {
    if (!pipeline) {
      return state;
    }

    const x = state
      .setIn([new Map({
        pipeline,
        timeIntervalSinceToday,
        timeIntervalUnits,
        ...(timeIntervalSincePreviousTimeInterval ? { timeIntervalSincePreviousTimeInterval } : {}),
      }), 'requestState'], COMPLETED);

    if (result.get('result') === null) {
      return x;
    }

    return x.setIn([new Map({
      pipeline,
      timeIntervalSinceToday,
      timeIntervalUnits,
      ...(timeIntervalSincePreviousTimeInterval ? { timeIntervalSincePreviousTimeInterval } : {}),
    }), 'result'], result.getIn(['result']));
  },

  reduceFailure: (state, {
    pipeline,
    timeIntervalSinceToday,
    timeIntervalUnits,
    timeIntervalSincePreviousTimeInterval,
    err
  }) => state
    .setIn([new Map({
      pipeline,
      timeIntervalSinceToday,
      timeIntervalUnits,
      ...(timeIntervalSincePreviousTimeInterval ? { timeIntervalSincePreviousTimeInterval } : {})
    }), 'requestState'], FAILED)
    .setIn([new Map({
      pipeline,
      timeIntervalSinceToday,
      timeIntervalUnits,
      ...(timeIntervalSincePreviousTimeInterval ? { timeIntervalSincePreviousTimeInterval } : {})
    }), 'error'], err),

  reduceComplete: (
    state,
    {
      pipeline,
      timeIntervalSinceToday,
      timeIntervalUnits,
      timeIntervalSincePreviousTimeInterval
    }
  ) => state.setIn(
    [
      new Map({
        pipeline,
        timeIntervalSinceToday,
        timeIntervalUnits,
        ...(timeIntervalSincePreviousTimeInterval ? { timeIntervalSincePreviousTimeInterval } : {})
      }),
      'requestState'
    ],
    COMPLETED
  ),

  startAction: ({
    pipeline,
    mapping = defaultMapping,
    timeIntervalSinceToday,
    timeIntervalUnits,
    timeIntervalSincePreviousTimeInterval
  }) => ({
    pipeline,
    mapping,
    timeIntervalSinceToday,
    timeIntervalUnits,
    timeIntervalSincePreviousTimeInterval
  }),

  successAction: (args) => {
    if (!args) {
      return {};
    }

    const {
      pipeline,
      timeIntervalSinceToday,
      timeIntervalUnits,
      timeIntervalSincePreviousTimeInterval,
      result,
      sinceAt,
    } = args;

    return ({
      pipeline,
      timeIntervalSinceToday,
      timeIntervalUnits,
      timeIntervalSincePreviousTimeInterval,
      result,
      sinceAt,
    });
  },

  failureAction: args => args,

  completeAction: args => args,

  checkShouldFire: (
    {
      pipeline,
      timeIntervalSinceToday,
      timeIntervalUnits,
      timeIntervalSincePreviousTimeInterval
    },
    state
  ) => aggregationShouldFetchSelector(
    pipeline,
    {
      timeIntervalSinceToday,
      timeIntervalUnits,
      timeIntervalSincePreviousTimeInterval
    }
  )(state),

  doAction: function* fetchAggregationSaga({
    pipeline,
    llClient,
    timeIntervalSinceToday,
    timeIntervalUnits,
    timeIntervalSincePreviousTimeInterval,
    successAction,
    mapping,
  }) {
    let id;
    const state = yield select();
    const websocketPromise = websocketSelector(state);
    let websocket;
    const uuid = v4();

    if (!websocketPromise) {
      let resolveWs;
      const wsPromise = new Promise((reslove) => { resolveWs = reslove; });
      yield put(setWebsocketAction({ websocket: wsPromise }));

      const { body } = yield call(
        llClient.aggregateWs,
        pipeline,
        timeIntervalSinceToday,
        timeIntervalUnits,
        timeIntervalSincePreviousTimeInterval
      );

      const wsUrl = getAppDataSelector('WS_URL')(state);
      websocket = new WebSocket(`${wsUrl}/websocket`);
      yield put(setWebsocketAction({ websocket }));
      id = body._id;

      yield put(successAction({
        pipeline,
        timeIntervalSinceToday,
        timeIntervalUnits,
        timeIntervalSincePreviousTimeInterval,
        result: mapping(body.results),
      }));

      yield new Promise((resolve) => {
        websocket.addEventListener('open', () => {
          resolve();
        });
      });
      resolveWs(websocket);
    } else {
      // websocket = yield call(websocketPromise);
      websocket = yield websocketPromise;
    }

    // Send the auth details
    const cookies = Cookies.get();
    const filteredCookies = pickBy(cookies, (value, cookieName) => testCookieName(cookieName));

    const createChannel = () => eventChannel((emitter) => {
      websocket.addEventListener('message', (message) => {
        const data = JSON.parse(message.data);
        if (data.uuid !== uuid) {
          // This message is not for us.
          return;
        }
        const result = mapping(data.results);

        // put into the state
        emitter(successAction({
          pipeline,
          timeIntervalSinceToday,
          timeIntervalUnits,
          timeIntervalSincePreviousTimeInterval,
          result
        }));
      });

      websocket.addEventListener('close', () => {
        emitter(websocketClosedAction());
        emitter(END);
      });

      websocket.addEventListener('error', (err) => {
        console.error('Websocket error', err);
        emitter(END);
      });

      websocket.send(JSON.stringify({
        type: AGGREGATION_PROCESSOR_REGISTER,
        auth: filteredCookies,
        organisationId: state.router.route.params.organisationId,
        aggregationProcessorId: id,
        uuid,
        query: {
          pipeline,
          timeIntervalSinceToday,
          timeIntervalUnits,
          timeIntervalSincePreviousTimeInterval
        }
      }));

      return () => {
        websocket.close();
      };
    });

    function* listenToWs() {
      const channel = yield call(createChannel);
      while (true) {
        const action = yield take(channel);
        yield put(action);
      }
    }
    yield fork(listenToWs);

    return;
  }
});

export const selectors = {
  aggregationRequestStateSelector,
  aggregationShouldFetchSelector
};

export const reducers = fetchAggregation.reducers;
export const actions = fetchAggregation.actions;
export const sagas = [...fetchAggregation.sagas];
