import { withContext, compose } from 'recompose';
import PropTypes from 'prop-types';
import React from 'react';
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
