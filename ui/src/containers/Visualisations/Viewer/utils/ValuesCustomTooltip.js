// @ts-check
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// @ts-ignore
import styles from './styles.css';

const ValuesCustomTooltop = withStyles(styles)(
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
        <p className={styles.label}>{`${display(label)}`}</p>
        <div className={styles.value}>
          {payload.map(({ name, value }) => {
            return <div>{name} - {value}</div>;
          })}
        </div>
      </div>
    );
  }
);

export default ValuesCustomTooltop;
