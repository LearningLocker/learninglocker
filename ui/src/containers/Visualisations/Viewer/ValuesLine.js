// @ts-check
import React from 'react';
import { LineChart, XAxis, YAxis, Bar, Legend, Tooltip } from 'recharts';
import { union } from 'lodash';
import { AutoSizer } from 'react-virtualized';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import getSeriesDataKey from './utils/getSeriesDataKey';
import getValueGroupedSeriesResults from './utils/getValueGroupedSeriesResults';
import getValueGroupDictionary from './utils/getValueGroupDictionary';
import renderLines from './utils/renderLines';
import ValuesCustomTooltip from './utils/ValuesCustomTooltip';
import getValueChartEntries from './utils/getValueChartEntries';
import createGroupAxisLabeller from './utils/createGroupAxisLabeller';
import createGroupTooltipLabeller from './utils/createGroupTooltipLabeller';
import Chart from './utils/Chart';
// @ts-ignore
import styles from './utils/styles.css';

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

const render = withStyles(styles)(
  /**  @param {{ model: Model, seriesResults: GroupResult[][] }} props */
  (props) => {
    const { model, seriesResults } = props;
    const groupedSeriesResults = getValueGroupedSeriesResults(seriesResults);
    const groupDictionary = getValueGroupDictionary(groupedSeriesResults);
    const chartDataEntries = getValueChartEntries(groupDictionary, groupedSeriesResults);
    const getGroupAxisLabel = createGroupAxisLabeller(groupDictionary);
    const getGroupTooltipLabel = createGroupTooltipLabeller(groupDictionary);

    return (
      <div className={styles.chart}>
        <Chart xAxisLabel={model.group.label} yAxisLabel={model.value.label}>
          <AutoSizer>
            {({ height, width }) => (
              <LineChart layout="horizontal" data={chartDataEntries} width={width} height={height}>
                <XAxis type="category" dataKey="groupId" tickFormatter={getGroupAxisLabel} />
                <YAxis type="number" />
                <Legend />
                {renderLines({ model })}
                <Tooltip content={<ValuesCustomTooltip display={getGroupTooltipLabel} />} />;
              </LineChart>
            )}
          </AutoSizer>
        </Chart>
      </div>
    );
  }
);

export default render;
