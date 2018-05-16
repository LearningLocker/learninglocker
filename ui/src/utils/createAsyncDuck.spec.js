import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { LOGOUT } from 'ui/redux/modules/auth/logout';
import Unauthorised from 'lib/errors/Unauthorised';
import HttpError from 'ui/utils/errors/HttpError';
import createAsyncDuck from './createAsyncDuck';

test('createAsyncDuck should logout on HttpError error', async () => {
  global.__CLIENT__ = true;

  const logout = jest.fn();
  const logoutPromise = new Promise((resolve) => {
    logout.mockImplementation(
      () => { resolve(); }
    );
  });

  const sagaMiddleware = createSagaMiddleware();
  const mockStore = createStore((data, action) => {
    switch (action.type) {
      case '@@redux/INIT':
        return data;
      case LOGOUT:
        logout();
        return;
      default:
        return;
    }
  }, applyMiddleware(sagaMiddleware));

  const createAsyncDuckSaga = createAsyncDuck({
    actionName: 'testAction',
    doAction: () => {
      throw new HttpError('Unauthorised', {
        status: 401
      });
    },
    failureDelay: 0,
  }).sagas[0];

  sagaMiddleware.run(createAsyncDuckSaga);

  try {
    await new Promise((reslove, reject) => {
      mockStore.dispatch({
        type: 'testAction',
        reslove,
        reject,
      });
    });
  } catch (err) { // eslint-disable-line no-empty

  }

  await logoutPromise;

  await expect(logout).toHaveBeenCalled();
});


test('createAsyncDuck should logout on Unauthorised error', async () => {
  global.__CLIENT__ = true;

  const logout = jest.fn();
  const logoutPromise = new Promise((resolve) => {
    logout.mockImplementation(
      () => { resolve(); }
    );
  });

  const sagaMiddleware = createSagaMiddleware();
  const mockStore = createStore((data, action) => {
    switch (action.type) {
      case '@@redux/INIT':
        return data;
      case LOGOUT:
        logout();
        return;
      default:
        return;
    }
  }, applyMiddleware(sagaMiddleware));

  const createAsyncDuckSaga = createAsyncDuck({
    actionName: 'testAction',
    doAction: () => {
      throw new Unauthorised();
    },
    failureDelay: 0,
  }).sagas[0];

  sagaMiddleware.run(createAsyncDuckSaga);

  try {
    await new Promise((reslove, reject) => {
      mockStore.dispatch({
        type: 'testAction',
        reslove,
        reject,
      });
    });
  } catch (err) { // eslint-disable-line no-empty

  }

  await logoutPromise;

  await expect(logout).toHaveBeenCalled();
});

