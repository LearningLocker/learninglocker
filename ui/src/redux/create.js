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

  let finalCreateStore;
  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    const { persistState } = require('redux-devtools');
    const DevTools = require('../containers/DevTools/DevTools');

    finalCreateStore = compose(
      applyMiddleware(...middleware),
      window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(),
      persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
    )(_createStore);
  } else {
    finalCreateStore = applyMiddleware(...middleware)(_createStore);
  }

  const store = finalCreateStore(reducer, data);
  sagaMiddleware.run(rootSaga);

  return store;
}
