/**
 * This hoc is used to allow test rendering of components that use isomorphic-style-loader
 * e.g. withStyles(<Component />)
 * it should not be used outside of tests
 */
import { withContext } from 'recompose';
import { PropTypes } from 'react';

const withInsertCSS = withContext(
  { insertCss: PropTypes.func },
  () => ({ insertCss: () => ({}) }),
);

export default withInsertCSS;
