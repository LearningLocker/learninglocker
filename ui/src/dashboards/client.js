/**
 * THIS IS THE ENTRY POINT FOR THE CLIENT, JUST LIKE server.js IS THE ENTRY POINT FOR THE SERVER.
 */
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { decodeLoginTokenAction } from 'ui/redux/modules/auth';
import createStore from 'ui/redux/create';
import LLApiClient from 'ui/helpers/LLApiClient';
import getRoutes from 'ui/dashboards/routes';

const llClient = new LLApiClient();

const dest = document.getElementById('content');
const store = createStore(browserHistory, llClient, window.__data);

const token = window.token;
if (token) {
  store.dispatch(decodeLoginTokenAction(token));
}

const component = (
  <Router>
    {getRoutes(store)}
  </Router>
);

try {
  ReactDOM.render(
    <Provider store={store} key="provider">
      { component }
    </Provider>,
    dest
  );
} catch (e) {
  console.trace(e);
}

if (process.env.NODE_ENV !== 'production') {
  window.React = React; // enable debugger
  if (!dest || !dest.firstChild || !dest.firstChild.attributes || !dest.firstChild.attributes['data-react-checksum']) {
    console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.');
  }
}

if (__DEVTOOLS__ && !window.devToolsExtension) {
  const DevTools = require('./containers/DevTools/DevTools');

  ReactDOM.render(
    <Provider store={store} key="provider">
      <div>
        {component}
        <DevTools />
      </div>
    </Provider>,
    dest
  );
}
