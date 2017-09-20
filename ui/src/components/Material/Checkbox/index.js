import React from 'react';
import Checkbox from 'react-toolbox/lib/checkbox';
import { omitBy, isFunction } from 'lodash';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

export default withStyles(styles)((props) => {
  const theme = omitBy(styles, isFunction);

  return (
    <Checkbox
      theme={theme}
      {...props} />
  );
});
