import React from 'react';
import { Tabs } from 'react-toolbox/lib/tabs';
import { omitBy, isFunction } from 'lodash';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

export default withStyles(styles)(({ children, ...props }) =>
  <Tabs
    theme={omitBy(styles, isFunction)}
    {...props}>
    {children}
  </Tabs>
);
