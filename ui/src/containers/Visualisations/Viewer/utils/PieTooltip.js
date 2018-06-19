// @ts-check
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// @ts-ignore
import styles from './styles.css';

export default withStyles(styles)(
  /**
   * @typedef {Object} PayloadItem
   * @property {string} name
   * @property {number} value
   * @param {{ display: (groupId: string) => string, payload: PayloadItem[], active: boolean }} props
   */
  (props) => {
    const { display, payload, active } = props;
    if (!active) return <noscript />;
    return (
      <div className={styles.customTooltip}>
        <div className={styles.label}>{payload[0].name}</div>
        <div className={styles.value}>{payload[0].value}</div>
      </div>
    );
  }
);
