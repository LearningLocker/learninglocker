import React from 'react';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import { omitBy, isFunction } from 'lodash';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

export default withStyles(styles)(props =>
  <ProgressBar
    theme={omitBy(styles, isFunction)}
    {...props} />
);
