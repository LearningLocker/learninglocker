import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

const Divider = () => <div className={styles.divider} />;

export default withStyles(styles)(Divider);
