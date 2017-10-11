import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { List } from 'immutable';
import reducer, { sagas, alert, getAlertsSelector } from './index.js';

jest.mock('bluebird', () => ({
  delay: () => {}
}));

test('Should have an alert for a period of time', async () => {
  // Setup
  const sagaMiddleware = createSagaMiddleware();

  global.__CLIENT__ = true;

  const store = createStore(
    reducer,
    applyMiddleware(sagaMiddleware)
  );

  sagaMiddleware.run(sagas[0]);

  // Run
  const newState = store.dispatch(alert({
    message: 'Hello world'
  }));

  // Test
  expect(newState.message).toEqual('Hello world');
  expect(store.getState().size).toEqual(0);
});

test('should not show alert for 404 errors', () => {
  const state = {
    alerts: new List([{
      message: 'Not found',
      options: {
        status: 404
      },
    },
    {
      message: 'An error'
    }])
  };

  const result = getAlertsSelector(state);

  expect(result.size).toEqual(1);
  expect(result.get(0).message).toEqual('An error');
});
