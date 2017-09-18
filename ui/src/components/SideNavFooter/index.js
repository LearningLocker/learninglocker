import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './sidenavfooter.css';

const component = () => (
  <div className={styles['sidenav-footer']}>
    <a href="https://ht2ltd.zendesk.com/hc/en-us/categories/115000129989-Learning-Locker">Help centre</a>
    <div>Powered by</div>
    <a href="http://learninglocker.net" target="_blank" rel="noopener noreferrer">Learning Locker Cloud</a>
  </div>
);

export default withStyles(styles)(component);
