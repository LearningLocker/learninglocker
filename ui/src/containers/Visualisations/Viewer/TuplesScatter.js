// @ts-check
import React from 'react';
import { ScatterChart, XAxis, YAxis, Bar, Legend, Tooltip, CartesianGrid } from 'recharts';
import { union } from 'lodash';
import { AutoSizer } from 'react-virtualized';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import getTupleGroupedSeriesResults from './utils/getTupleGroupedSeriesResults';
import getValueGroupDictionary from './utils/getValueGroupDictionary';
import getTupleTableEntries from './utils/getTupleTableEntries';
import Chart from './utils/Chart';
import renderScatters from './utils/renderScatters';
// @ts-ignore
import styles from './utils/styles.css';

/**
 * @typedef {Object} SeriesConfig
 * @property {string} label
 * @property {string} colour
 * @typedef {Object} GroupConfig
 * @property {string} label
 * @typedef {Object} TupleValueConfig
 * @property {string} label
 * @typedef {Object} Model
 * @property {SeriesConfig[]} series
 * @property {GroupConfig} group
 * @property {TupleValueConfig} firstValue
 * @property {TupleValueConfig} secondValue
 * @typedef {Object} GroupResult
 * @property {string} _id
 * @property {string} model
 * @property {number} count
 */

export default withStyles(styles)(
  /**  @param {{ model: Model, seriesResults: GroupResult[][][] }} props */
  (props) => {
    const { model, seriesResults } = props;
    const groupedSeriesResults = getTupleGroupedSeriesResults(seriesResults);
    const groupDictionary = getValueGroupDictionary(groupedSeriesResults);

    return (
      <Chart xAxisLabel={model.firstValue.label} yAxisLabel={model.secondValue.label}>
        <AutoSizer>
          {({ height, width }) => (
            <ScatterChart
              width={width}
              height={height}
              margin={{ top: 10, right: 12, left: -10, bottom: 2 }}>
              <XAxis dataKey="firstCount" type="number" name={model.firstValue.label} />
              <YAxis dataKey="secondCount" type="number" name={model.secondValue.label} />
              <CartesianGrid />
              <Legend />
              {renderScatters({ model, groupedSeriesResults })}
            </ScatterChart>
          )}
        </AutoSizer>
      </Chart>
    );
  }
);
