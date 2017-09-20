import React from 'react';
import { DatePicker } from 'react-toolbox/lib/date_picker';
import { omitBy, isFunction } from 'lodash';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

export default withStyles(styles)(props =>
  <DatePicker
    theme={omitBy(styles, isFunction)}
    {...props} />
);
