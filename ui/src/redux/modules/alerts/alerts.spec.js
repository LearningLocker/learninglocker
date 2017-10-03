import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import reducer, { sagas, alert } from './index.js';

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
