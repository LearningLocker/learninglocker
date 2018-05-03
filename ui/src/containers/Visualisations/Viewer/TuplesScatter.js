// @ts-check
import React from 'react';
import { ScatterChart, XAxis, YAxis, Bar, Legend, Tooltip, CartesianGrid } from 'recharts';
import { union } from 'lodash';
import { AutoSizer } from 'react-virtualized';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'recompose';
// @ts-ignore
import { withStatementsVisualisation } from 'ui/utils/hocs';
import getTupleGroupedSeriesResults from './utils/getTupleGroupedSeriesResults';
import getTupleTableEntries from './utils/getTupleTableEntries';
import Chart from './utils/Chart';
import renderScatters from './utils/renderScatters';
import TuplesTooltip from './utils/TuplesTooltip';
// @ts-ignore
import styles from './utils/styles.css';
import getTupleNameDictionary from './utils/getTupleNameDictionary';
import getTupleDataKey from './utils/getTupleDataKey';

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
  /**  @param {{ model: Model, seriesResults: GroupResult[][][] }} props */
  (props) => {
    const { model, seriesResults } = props;
    const config = model.config;
    const groupedSeriesResults = getTupleGroupedSeriesResults(seriesResults);
    const nameDictionary = getTupleNameDictionary(groupedSeriesResults);
    const displayTooltipGroupNames = (firstCount, secondCount) => {
      const names = nameDictionary[getTupleDataKey(firstCount, secondCount)];
      const first10Names = names.slice(0, 10).join(', ');
      if (names.length > 10) {
        return `${first10Names}, more...`;
      } else {
        return first10Names;
      }
    };

    return (
      <Chart xAxisLabel={config.firstValue.label} yAxisLabel={config.secondValue.label}>
        <AutoSizer>
          {({ height, width }) => (
            <ScatterChart
              width={width}
              height={height}
              margin={{ top: 10, right: 12, left: -10, bottom: 2 }}>
              <XAxis dataKey="firstCount" type="number" name={config.firstValue.label} />
              <YAxis dataKey="secondCount" type="number" name={config.secondValue.label} />
              {renderScatters({ config, groupedSeriesResults })}
              <CartesianGrid />
              <Legend />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={<TuplesTooltip display={displayTooltipGroupNames} />} />
            </ScatterChart>
          )}
        </AutoSizer>
      </Chart>
    );
  }
);
