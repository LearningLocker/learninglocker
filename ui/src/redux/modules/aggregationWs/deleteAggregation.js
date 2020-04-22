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
    visualisationId
    // pipeline,
    // mapping = defaultMapping,
    // timeIntervalSinceToday,
    // timeIntervalUnits,
    // timeIntervalSincePreviousTimeInterval
  }) => {
    console.log('001');
    const startActionOut = ({
      visualisationId,
      // pipeline,
      // mapping,
      // timeIntervalSinceToday,
      // timeIntervalUnits,
      // timeIntervalSincePreviousTimeInterval
    });
    return startActionOut;
  },

  successAction: () => {
    console.log('successAction');
  },

  doAction: function* doAction({ visualisationId, llClient }) {
    console.log('002.1');
    // Get these props from the visualisation

    const state = yield select();
    console.log('002.1.1', state, visualisationId);
    const result = visualisationWsPipelinesSelector(visualisationId)(state);
    console.log('002.2 doAction', result);

    // const {
    //   pipeline,
    //   timeIntervalSinceToday,
    //   timeIntervalUnits,
    //   timeIntervalSincePreviousTimeInterval
    // }

    console.log('002.3');
    const { status, body } = yield call(
      llClient.deleteAggregationCache,
      {
        visualisationId
      },
    );
    console.log('002.4');

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

export const sagas = deleteAggregationDuck.sagas;
export const { start } = deleteAggregationDuck.actions;
