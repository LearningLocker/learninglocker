// @ts-check
import React from 'react';
import { LineChart, XAxis, YAxis, Bar, Legend, Tooltip } from 'recharts';
import { union } from 'lodash';
import { AutoSizer } from 'react-virtualized';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// @ts-ignore
import styles from './styles.css';

/**
 * @typedef {Object} AutoSizerProps
 * @property {number} height
 * @property {number} width
 */

const render = withStyles(styles)(
  /**  @param {{ xAxisLabel: string, yAxisLabel: string, children: (props: AutoSizerProps) => React.Element }} props */
  (props) => {
    const { xAxisLabel, yAxisLabel, children } = props;
    return (
      <div className={styles.chart}>
        <div className={styles.xAxisLabel}>
          <span className={styles.xAxis}>
            {xAxisLabel || 'X Axis'}
          </span>
        </div>
        <div className={`${styles.barContainer}`}>
          <div className={styles.yAxisLabel}>
            <span className={styles.yAxis}>
              {yAxisLabel || 'Y Axis'}
            </span>
          </div>
          <div className={styles.chartWrapper}>
            <AutoSizer>
              {children}
            </AutoSizer>
          </div>
        </div>
      </div>
    );
  }
);

export default render;
