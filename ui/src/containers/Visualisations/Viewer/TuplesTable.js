// @ts-check
import React from 'react';
import { PieChart, Pie, Tooltip } from 'recharts';
import { union } from 'lodash';
import { AutoSizer } from 'react-virtualized';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'recompose';
// @ts-ignore
import { withStatementsVisualisation } from 'ui/utils/hocs';
import getSeriesDataKey from './utils/getSeriesDataKey';
import getTupleGroupedSeriesResults from './utils/getTupleGroupedSeriesResults';
import getValueGroupDictionary from './utils/getValueGroupDictionary';
import ValuesTooltip from './utils/ValuesTooltip';
import renderLines from './utils/renderLines';
import getTupleTableEntries from './utils/getTupleTableEntries';
import createGroupAxisLabeller from './utils/createGroupAxisLabeller';
import createGroupTooltipLabeller from './utils/createGroupTooltipLabeller';
// @ts-ignore
import styles from './utils/styles.css';
import keyCodes from 'lib/constants/keyCodes';
import migrateTuplesModel from '../utils/migrateTuplesModel';

/**
 * @typedef {Object} SeriesConfig
 * @property {string} label
 * @property {string} colour
 * @typedef {Object} GroupConfig
 * @property {string} label
 * @typedef {Object} TupleValueConfig
 * @property {string} label
 * @typedef {Object} Config
 * @property {SeriesConfig[]} series
 * @property {GroupConfig} group
 * @property {TupleValueConfig} firstValue
 * @property {TupleValueConfig} secondValue
 * @typedef {Object} Model
 * @property {Config} config
 * @typedef {Object} GroupResult
 * @property {string} _id
 * @property {string} model
 * @property {number} count
 */

export default compose(
  withStyles(styles),
  withStatementsVisualisation,
)(
  /**  @param {{ model: Model, results: GroupResult[][][] }} props */
  (props) => {
    const { model, results } = props;
    const newModel = migrateTuplesModel(model);
    const config = newModel.config;
    const groupedSeriesResults = getTupleGroupedSeriesResults(results);
    const groupDictionary = getValueGroupDictionary(groupedSeriesResults);
    const tableDataEntries = getTupleTableEntries(groupDictionary, groupedSeriesResults);

    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.td}></th>
              {config.series.map((series, index) => {
                return (
                  <th key={index} colSpan="2" className={styles.td} style={{ color: series.colour }}>
                    {series.label}
                  </th>
                );
              })}
            </tr>
            <tr>
              <th className={styles.td}>{config.group.label}</th>
              {config.series.map((series, seriesIndex) => {
                return [
                  <th key={`${seriesIndex}-1`} className={styles.td} style={{ color: series.colour }}>
                    {config.firstValue.label}
                  </th>,
                  <th key={`${seriesIndex}-2`} className={styles.td} style={{ color: series.colour }}>
                    {config.secondValue.label}
                  </th>,
                ];
              })}
            </tr>
          </thead>
          <tbody>
            {tableDataEntries.map((tableDataEntry, entryIndex) => {
              return (
                <tr key={entryIndex}>
                  <td className={styles.td}>{groupDictionary[tableDataEntry.groupId]}</td>
                  {config.series.map((series, seriesIndex) => {
                    const data = tableDataEntry.seriesResults[seriesIndex];
                    return [
                      <td key={`${seriesIndex}-1`} className={styles.td}>
                        {data.firstCount}
                      </td>,
                      <td key={`${seriesIndex}-2`} className={styles.td}>
                        {data.secondCount}
                      </td>,
                    ];
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
);
