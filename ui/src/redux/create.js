import { createStore as _createStore, applyMiddleware, compose } from 'redux';
import { router5Middleware } from 'redux-router5';
import clientMiddleware from 'ui/redux/middleware/clientMiddleware';
import thunkMiddleware from 'redux-thunk';
import userMiddleware from 'ui/redux/middleware/userMiddleware';
import rootSaga, { sagaMiddleware } from 'ui/redux/modules/sagas';
import reducer from 'ui/redux/reducer';


export default function createStore(llClient, router, data) {
  const middleware = [
    thunkMiddleware,
    userMiddleware,
    clientMiddleware(llClient),
    sagaMiddleware,
    router5Middleware(router),
  ];

  const composeEnhancers =
    (typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__)
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

  let finalCreateStore;
  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    const { persistState } = require('redux-devtools');

    finalCreateStore = composeEnhancers(
      applyMiddleware(...middleware),
      persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
    )(_createStore);
  } else {
    finalCreateStore = applyMiddleware(...middleware)(_createStore);
  }

  const store = finalCreateStore(reducer, data);
  sagaMiddleware.run(rootSaga);

  return store;
}

// UNICORN
