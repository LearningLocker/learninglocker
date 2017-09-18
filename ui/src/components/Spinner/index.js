import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

const spinner = () => (
  <div className={styles.spinner} />
);

export default withStyles(styles)(spinner);
