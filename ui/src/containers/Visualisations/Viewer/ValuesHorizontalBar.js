// @ts-check
import React from 'react';
import { compose, withState } from 'recompose';
import { BarChart, XAxis, YAxis, Bar, Legend, Tooltip } from 'recharts';
import { union } from 'lodash';
import { AutoSizer } from 'react-virtualized';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// @ts-ignore
import { withStatementsVisualisation } from 'ui/utils/hocs';
import getSeriesDataKey from './utils/getSeriesDataKey';
import getValueGroupedSeriesResults from './utils/getValueGroupedSeriesResults';
import getValueGroupDictionary from './utils/getValueGroupDictionary';
import renderBars from './utils/renderBars';
import ValuesTooltip from './utils/ValuesTooltip';
import getSortedValueChartEntries from './utils/getSortedValueChartEntries';
import createGroupAxisLabeller from './utils/createGroupAxisLabeller';
import createGroupTooltipLabeller from './utils/createGroupTooltipLabeller';
// @ts-ignore
import PreviousTextIconButton from 'ui/components/TextIconButton/PreviousTextIconButton';
// @ts-ignore
import NextTextIconButton from 'ui/components/TextIconButton/NextTextIconButton';
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

const groupsPerPage = 10;

export default compose(
  withStyles(styles),
  withStatementsVisualisation,
  withState('page', 'setPage', 0),
)(
  /**  @param {{ model: Model, results: GroupResult[][], page: number, setPage: (page: number) => void }} props */
  (props) => {
    const { model, results, page, setPage } = props;
    const newModel = migrateValuesModel(model);
    const config = newModel.config;
    const groupedSeriesResults = getValueGroupedSeriesResults(results);
    const groupDictionary = getValueGroupDictionary(groupedSeriesResults);
    const chartDataEntries = getSortedValueChartEntries(groupDictionary, groupedSeriesResults);
    const chartPageDataEntries = chartDataEntries.slice(page * groupsPerPage);
    const getGroupAxisLabel = createGroupAxisLabeller(groupDictionary);
    const getGroupTooltipLabel = createGroupTooltipLabeller(groupDictionary);
    const hasPrevPage = page !== 0;
    const hasNextPage = chartDataEntries.length > ((page + 1) * groupsPerPage);
    const minValue = 0;
    const maxValue = 100;

    return (
      <div className={styles.chart}>
        <div className={`${styles.buttons}`}>
          {hasPrevPage && (
            <PreviousTextIconButton onClick={() => { setPage(page - 1); }} />
          )}
          {hasNextPage && (
            <span className={styles.nextButton}>
              <NextTextIconButton onClick={() => { setPage(page + 1); }} />
            </span>
          )}
        </div>
        <Chart xAxisLabel={config.value.label} yAxisLabel={config.group.label}>
          {({ height, width }) => (
            <BarChart layout="vertical" data={chartPageDataEntries} width={width} height={height}>
              <YAxis type="category" dataKey="groupId" tickFormatter={getGroupAxisLabel} width={90} />
              <XAxis type="number" domain={[minValue, maxValue]} />
              <Legend />
              {renderBars({ config })}
              <Tooltip content={<ValuesTooltip display={getGroupTooltipLabel} />} />;
            </BarChart>
          )}
        </Chart>
      </div>
    );
  }
);
