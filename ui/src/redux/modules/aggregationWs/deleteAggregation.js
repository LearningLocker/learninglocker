import createAsyncDuck from 'ui/utils/createAsyncDuck';
import { IN_PROGRESS } from 'ui/utils/constants';
import Unauthorised from 'lib/errors/Unauthorised';
import HttpError from 'ui/utils/errors/HttpError';
import { call } from 'redux-saga/effects';
import { defaultMapping } from './fetchAggregation';

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
    // state,
    // {
      // pipeline,
      // timeIntervalSinceToday,
      // timeIntervalUnits,
      // timeIntervalSincePreviousTimeInterval,
      // result
    // }
  ) => {
    console.log('Reduce Success');
  },

  reduceComplete: (
    // state,
    // {
      // pipeline,
      // timeIntervalSinceToday,
      // timeIntervalUnits,
      // timeIntervalSincePreviousTimeInterval
    // }
  ) => {
    console.log('Reduce Complete');
  },

  // ACTIONS
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

  successAction: () => {
    console.log('successAction');
  },

  doAction: function* doAction({ userId, organisationId, llClient }) {
    const { status, body } = yield call(
      llClient.deleteAggregationCache,
      {
        userId,
        organisationId,
      },
    );

    if (status === 401) {
      throw new Unauthorised('Unauthorised');
    }

    if (status >= 300) {
      const errorMessage = body.message || body;
      throw new HttpError(errorMessage, { status });
    }

    return yield {
      body
    };
  }

});

