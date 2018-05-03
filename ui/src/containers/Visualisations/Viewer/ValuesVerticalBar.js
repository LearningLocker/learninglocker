// @ts-check
import React from 'react';
import { BarChart, XAxis, YAxis, Bar, Legend, Tooltip } from 'recharts';
import { union } from 'lodash';
import { AutoSizer } from 'react-virtualized';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'recompose';
// @ts-ignore
import { withStatementsVisualisation } from 'ui/utils/hocs';
import getSeriesDataKey from './utils/getSeriesDataKey';
import getValueGroupedSeriesResults from './utils/getValueGroupedSeriesResults';
import getValueGroupDictionary from './utils/getValueGroupDictionary';
import renderBars from './utils/renderBars';
import ValuesTooltip from './utils/ValuesTooltip';
import Chart from './utils/Chart';
import getValueChartEntries from './utils/getValueChartEntries';
import createGroupAxisLabeller from './utils/createGroupAxisLabeller';
import createGroupTooltipLabeller from './utils/createGroupTooltipLabeller';
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
 * @typedef {Object} Config
 * @property {boolean} stacked
 * @property {SeriesConfig[]} series
 * @property {GroupConfig} group
 * @property {ValueConfig} value
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
  /**  @param {{ model: Model, seriesResults: GroupResult[][] }} props */
  (props) => {
    const { model, seriesResults } = props;
    const config = model.config;
    const groupedSeriesResults = getValueGroupedSeriesResults(seriesResults);
    const groupDictionary = getValueGroupDictionary(groupedSeriesResults);
    const chartDataEntries = getValueChartEntries(groupDictionary, groupedSeriesResults);
    const getGroupAxisLabel = createGroupAxisLabeller(groupDictionary);
    const getGroupTooltipLabel = createGroupTooltipLabeller(groupDictionary);
    const minValue = 0;
    const maxValue = 100;

    return (
      <div className={styles.chart}>
        <Chart xAxisLabel={config.group.label} yAxisLabel={config.value.label}>
          <AutoSizer>
            {({ height, width }) => (
              <BarChart layout="horizontal" data={chartDataEntries} width={width} height={height}>
                <XAxis type="category" dataKey="groupId" tickFormatter={getGroupAxisLabel} />
                <YAxis type="number" domain={[minValue, maxValue]} />
                <Legend />
                {renderBars({ config })}
                <Tooltip content={<ValuesTooltip display={getGroupTooltipLabel} />} />;
              </BarChart>
            )}
          </AutoSizer>
        </Chart>
      </div>
    );
  }
);
