// @ts-check
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { round } from 'lodash';
// @ts-ignore
import styles from './styles.css';

export default withStyles(styles)(
  /**
   * @typedef {Object} PayloadItem
   * @property {string} name
   * @property {number} value
   * @param {{ display: (firstCount: number, secondCount: number) => string, payload: PayloadItem[], label: string, active: boolean }} props
   */
  (props) => {
    const { active, display, payload, label } = props;

    if (!active) return <noscript />;
    const firstLabel = payload[0].name;
    const secondLabel = payload[1].name;
    const firstCount = payload[0].value;
    const secondCount = payload[1].value;

    return (
      <div className={styles.customTooltip}>
        <div className={styles.label}>
          {display(firstCount, secondCount)}
        </div>
        <div className={styles.value}>
          {`${firstLabel}`}: {round(firstCount, 2)}
        </div>
        <div className={styles.value}>
          {`${secondLabel}`}: {round(secondCount, 2)}
        </div>
      </div>
    );
  }
);
