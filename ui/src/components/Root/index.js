import { withContext, compose } from 'recompose';
import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import App from 'ui/containers/App';

const component = ({ store }) => (
  <Provider store={store}>
    <App />
  </Provider>
);

export default compose(
  withContext(
    {
      insertCss: PropTypes.func,
      router: PropTypes.object
    },
    ({ context }) => context
  )
)(component);
