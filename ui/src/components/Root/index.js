import { withContext, compose } from 'recompose';
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
      insertCss: React.PropTypes.func,
      router: React.PropTypes.object
    },
    ({ context }) => context
  )
)(component);
