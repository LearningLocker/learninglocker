import createAsyncDuck from 'ui/utils/createAsyncDuck';
import Unauthorised from 'lib/errors/Unauthorised';
import HttpError from 'ui/utils/errors/HttpError';
import { call, select, put } from 'redux-saga/effects';
import { Map } from 'immutable';
import { visualisationWsPipelinesSelector, fetchVisualisation } from '../visualise';

const DELETE_AGGREGATION = 'learninglocker/aggregation/DELETE_AGGREGATION_WS';

export const deleteAggregationDuck = createAsyncDuck({
  actionName: DELETE_AGGREGATION,
  failureDelay: 2000,
  reduceStart: (
    state,
  ) => {
    const out = state;
    return out;
  },

  reduceSuccess: (
  ) => {
    const out = new Map();

    return out;
  },

  reduceComplete: (
  ) => {
    const out = new Map();
    return out;
  },

  // ACTIONS
  startAction: ({
    visualisationId
  }) => {
    const startActionOut = ({
      visualisationId,
    });
    return startActionOut;
  },

  successAction: (args) => {
    const out = args;
    return out;
  },

  doAction: function* doAction({
    visualisationId,
    llClient,
    successAction,
    dispatch
  }) {
    // Get these props from the visualisation

    const state = yield select();
    const result = visualisationWsPipelinesSelector(visualisationId)(state);
    const {
      series,
      timeIntervalSinceToday,
      timeIntervalUnits,
      timeIntervalSincePreviousTimeInterval
    } = result;

    for (let s = 0; s < series.size; s += 1) {
      const pipelines = series.get(s);
      for (let p = 0; p < pipelines.size; p += 1) {
        const { status, body } = yield call(
          llClient.deleteAggregationCache,
          pipelines.get(p),
          timeIntervalSinceToday,
          timeIntervalUnits
        );

        if (status === 401) {
          throw new Unauthorised('Unauthorised');
        }

        if (status >= 300) {
          const errorMessage = body.message || body;
          throw new HttpError(errorMessage, { status });
        }

        yield put(successAction({
          pipeline: pipelines.get(p),
          timeIntervalSinceToday,
          timeIntervalUnits
        }));

        if (timeIntervalSincePreviousTimeInterval) {
          const { status: tiStatus, body: tiBody } = yield call(
            llClient.deleteAggregationCache,
            pipelines.get(p),
            timeIntervalSinceToday,
            timeIntervalUnits,
            timeIntervalSincePreviousTimeInterval
          );

          if (tiStatus === 401) {
            throw new Unauthorised('Unauthorised');
          }

          if (tiStatus >= 300) {
            const errorMessage = tiBody.message || tiBody;
            throw new HttpError(errorMessage, { status: tiStatus });
          }
        }
      }
    }

    yield put(
      fetchVisualisation(visualisationId, !!timeIntervalSincePreviousTimeInterval)
    );


    return yield {
    };
  }
});

export const sagas = deleteAggregationDuck.sagas;
export const reducers = deleteAggregationDuck.reducers;
export const { start } = deleteAggregationDuck.actions;
