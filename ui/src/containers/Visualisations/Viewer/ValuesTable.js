// @ts-check
import React from 'react';
import { PieChart, Pie, Tooltip } from 'recharts';
import { union } from 'lodash';
import { AutoSizer } from 'react-virtualized';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import getSeriesDataKey from './utils/getSeriesDataKey';
import getValueGroupedSeriesResults from './utils/getValueGroupedSeriesResults';
import getValueGroupDictionary from './utils/getValueGroupDictionary';
import ValuesTooltip from './utils/ValuesTooltip';
import renderLines from './utils/renderLines';
import getSortedValueChartEntries from './utils/getSortedValueChartEntries';
import createGroupAxisLabeller from './utils/createGroupAxisLabeller';
import createGroupTooltipLabeller from './utils/createGroupTooltipLabeller';
// @ts-ignore
import styles from './utils/styles.css';
import keyCodes from 'lib/constants/keyCodes';

/**
 * @typedef {Object} SeriesConfig
 * @property {string} label
 * @property {string} colour
 * @typedef {Object} GroupConfig
 * @property {string} label
 * @typedef {Object} ValueConfig
 * @property {string} label
 * @typedef {Object} Model
 * @property {boolean} stacked
 * @property {SeriesConfig[]} series
 * @property {GroupConfig} group
 * @property {ValueConfig} value
 * @typedef {Object} GroupResult
 * @property {string} _id
 * @property {string} model
 * @property {number} count
 */

export default withStyles(styles)(
  /**  @param {{ model: Model, seriesResults: GroupResult[][] }} props */
  (props) => {
    const { model, seriesResults } = props;
    const groupedSeriesResults = getValueGroupedSeriesResults(seriesResults);
    const groupDictionary = getValueGroupDictionary(groupedSeriesResults);
    const chartDataEntries = getSortedValueChartEntries(groupDictionary, groupedSeriesResults);

    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.td}>{model.group.label}</th>
              {model.series.map((series, index) => {
                return (
                  <th key={index} className={styles.td} style={{ color: series.colour }}>
                    {series.label}
                  </th>
                );
              })}
              <th className={styles.td}>Total</th>
            </tr>
          </thead>
          <tbody>
            {chartDataEntries.map((chartDataEntry, entryIndex) => {
              return (
                <tr key={entryIndex}>
                  <td className={styles.td}>{groupDictionary[chartDataEntry.groupId]}</td>
                  {model.series.map((series, seriesIndex) => {
                    const data = chartDataEntry[getSeriesDataKey(seriesIndex)];
                    return (
                      <td key={seriesIndex} className={styles.td}>
                        {data}
                      </td>
                    );
                  })}
                  <td className={styles.td}>{chartDataEntry.total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
);
