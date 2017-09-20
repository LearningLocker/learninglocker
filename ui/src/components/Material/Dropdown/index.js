import React from 'react';
import Dropdown from 'react-toolbox/lib/dropdown';
import { omitBy, isFunction } from 'lodash';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

export default withStyles(styles)(props =>
  <Dropdown
    theme={omitBy(styles, isFunction)}
    {...props} />
);
