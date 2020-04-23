import createAsyncDuck from 'ui/utils/createAsyncDuck';
import { IN_PROGRESS } from 'ui/utils/constants';
import Unauthorised from 'lib/errors/Unauthorised';
import HttpError from 'ui/utils/errors/HttpError';
import { call, select } from 'redux-saga/effects';
import { visualisationWsPipelinesSelector } from '../visualise';
// import { defaultMapping } from './fetchAggregation';

const DELETE_AGGREGATION = 'learninglocker/aggregation/DELETE_AGGREGATION_WS';

export const deleteAggregationDuck = createAsyncDuck({
  actionName: DELETE_AGGREGATION,
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
  ) => {
  },

  reduceComplete: (
  ) => {
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

  successAction: () => {
  },

  doAction: function* doAction({ visualisationId, llClient }) {
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

    return yield {
    };
  }
});

export const sagas = deleteAggregationDuck.sagas;
export const { start } = deleteAggregationDuck.actions;
