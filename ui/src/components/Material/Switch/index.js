import React from 'react';
import Switch from 'react-toolbox/lib/switch';
import { omitBy, isFunction } from 'lodash';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

export default withStyles(styles)(props =>
  <Switch
    theme={omitBy(styles, isFunction)}
    {...props} />
);
