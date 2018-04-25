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
   * @param {{ display: (groupId: string) => string, payload: PayloadItem[], label: string }} props
   */
  (props) => {
    const { display, payload, label } = props;
    return (
      <div className={styles.customTooltip}>
        <div className={styles.label}>{display(label)}</div>
        {payload.map(({ name, value }) => {
          return <div className={styles.value}>{name} - {value}</div>;
        })}
      </div>
    );
  }
);
