import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './smallspinner.css';

const component = () => <div className={styles.spinner} />;

export default withStyles(styles)(component);
