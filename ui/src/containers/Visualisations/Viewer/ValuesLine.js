// @ts-check
import React from 'react';
import { LineChart, XAxis, YAxis, Bar, Legend, Tooltip } from 'recharts';
import { union } from 'lodash';
import { AutoSizer } from 'react-virtualized';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'recompose';
// @ts-ignore
import { withStatementsVisualisation } from 'ui/utils/hocs';
import getSeriesDataKey from './utils/getSeriesDataKey';
import getValueGroupedSeriesResults from './utils/getValueGroupedSeriesResults';
import getValueGroupDictionary from './utils/getValueGroupDictionary';
import renderLines from './utils/renderLines';
import ValuesTooltip from './utils/ValuesTooltip';
import getValueChartEntries from './utils/getValueChartEntries';
import createGroupAxisLabeller from './utils/createGroupAxisLabeller';
import createGroupTooltipLabeller from './utils/createGroupTooltipLabeller';
import Chart from './utils/Chart';
// @ts-ignore
import styles from './utils/styles.css';
import migrateValuesModel from '../utils/migrateValuesModel';

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
  /**  @param {{ model: Model, results: GroupResult[][] }} props */
  (props) => {
    const { model, results } = props;
    const newModel = migrateValuesModel(model);
    const config = newModel.config;
    const groupedSeriesResults = getValueGroupedSeriesResults(results);
    const groupDictionary = getValueGroupDictionary(groupedSeriesResults);
    const chartDataEntries = getValueChartEntries(groupDictionary, groupedSeriesResults);
    const getGroupAxisLabel = createGroupAxisLabeller(groupDictionary);
    const getGroupTooltipLabel = createGroupTooltipLabeller(groupDictionary);

    return (
      <div className={styles.chart}>
        <Chart xAxisLabel={config.group.label} yAxisLabel={config.value.label}>
          {({ height, width }) => (
            <LineChart layout="horizontal" data={chartDataEntries} width={width} height={height}>
              <XAxis type="category" dataKey="groupId" tickFormatter={getGroupAxisLabel} />
              <YAxis type="number" />
              <Legend />
              {renderLines({ config })}
              <Tooltip content={<ValuesTooltip display={getGroupTooltipLabel} />} />;
            </LineChart>
          )}
        </Chart>
      </div>
    );
  }
);
