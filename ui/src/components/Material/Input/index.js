import React from 'react';
import Input from 'react-toolbox/lib/input';
import { omitBy, isFunction } from 'lodash';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

export default withStyles(styles)(props =>
  <Input
    theme={omitBy(styles, isFunction)}
    {...props} />
);
