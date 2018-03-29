// @ts-check
import React from 'react';
import { LineChart, XAxis, YAxis, Bar, Legend, Tooltip } from 'recharts';
import { union } from 'lodash';
import { AutoSizer } from 'react-virtualized';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// @ts-ignore
import styles from './styles.css';

const render = withStyles(styles)(
  /**  @param {{ xAxisLabel: string, yAxisLabel: string, children: React.Element }} props */
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
            {children}
          </div>
        </div>
      </div>
    );
  }
);

export default render;
