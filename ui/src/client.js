/**
 * Client entry point
 */
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import Root from 'ui/components/Root';
import createStore from 'ui/redux/create';
import LLApiClient from 'ui/utils/LLApiClient';
import router from 'lib/routes';
import browserPlugin from 'router5/plugins/browser';

const llClient = new LLApiClient();

const dest = document.getElementById('content');
const store = createStore(llClient, router, window.__data);
router.usePlugin(browserPlugin())
      .setDependency('store', store)
      .start();
llClient.setStore(store);

// Global (context) variables that can be easily accessed from any React component
// https://facebook.github.io/react/docs/context.html
const context = {
  router,
  // Enables critical path CSS rendering
  // https://github.com/kriasoft/isomorphic-style-loader
  insertCss: (...styles) => {
    // eslint-disable-next-line no-underscore-dangle
    const removeCss = styles.map(x => x._insertCss());
    return () => { removeCss.forEach(f => f()); };
  },
};

// const { pathname, search, hash } = window.location;
// const location = `${pathname}${search}${hash}`;

const component = <Root store={store} context={context} />;

try {
  ReactDOM.render(component, dest);
} catch (e) {
  console.trace(e);
}

if (process.env.NODE_ENV !== 'production') {
  window.React = React; // enable debugger
}
