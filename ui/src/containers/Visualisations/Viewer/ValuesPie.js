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
import getValueGroupedSeriesResults from './utils/getValueGroupedSeriesResults';
import getValueGroupDictionary from './utils/getValueGroupDictionary';
import renderLines from './utils/renderLines';
import getSortedValueChartEntries from './utils/getSortedValueChartEntries';
import createGroupAxisLabeller from './utils/createGroupAxisLabeller';
import createGroupTooltipLabeller from './utils/createGroupTooltipLabeller';
// @ts-ignore
import styles from './utils/styles.css';
import PieTooltip from './utils/PieTooltip';
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
    const chartDataEntries = getSortedValueChartEntries(groupDictionary, groupedSeriesResults);
    const getGroupAxisLabel = createGroupAxisLabeller(groupDictionary);
    const getGroupTooltipLabel = createGroupTooltipLabeller(groupDictionary);

    return (
      <div className={styles.chart}>
        {({ height, width }) => (
          <PieChart width={width} height={height}>
            <Pie
              data={chartDataEntries}
              nameKey={'groupId'}
              valueKey={getSeriesDataKey(0)}
              fill={config.series[0].colour}
              outerRadius={150}>
            </Pie>
            <Tooltip content={<PieTooltip display={getGroupTooltipLabel} />} />;
          </PieChart>
        )}
      </div>
    );
  }
);
