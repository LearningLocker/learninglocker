// @ts-check
import React from 'react';
import { compose, withState } from 'recompose';
import { BarChart, XAxis, YAxis, Bar, Legend, Tooltip } from 'recharts';
import { union } from 'lodash';
import { AutoSizer } from 'react-virtualized';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import getSeriesDataKey from './utils/getSeriesDataKey';
import getValueGroupedSeriesResults from './utils/getValueGroupedSeriesResults';
import getValueGroupDictionary from './utils/getValueGroupDictionary';
import renderBars from './utils/renderBars';
import ValuesCustomTooltip from './utils/ValuesCustomTooltip';
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

const groupsPerPage = 10;

export default compose(
  withStyles(styles),
  withState('page', 'setPage', 0)
)(
  /**  @param {{ model: Model, seriesResults: GroupResult[][], page: number, setPage: (page: number) => void }} props */
  (props) => {
    const { model, seriesResults, page, setPage } = props;
    const groupedSeriesResults = getValueGroupedSeriesResults(seriesResults);
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
        <Chart xAxisLabel={model.value.label} yAxisLabel={model.group.label}>
          <AutoSizer>
            {({ height, width }) => (
              <BarChart layout="vertical" data={chartPageDataEntries} width={width} height={height}>
                <YAxis type="category" dataKey="groupId" tickFormatter={getGroupAxisLabel} width={90} />
                <XAxis type="number" domain={[minValue, maxValue]} />
                <Legend />
                {renderBars({ model })}
                <Tooltip content={<ValuesCustomTooltip display={getGroupTooltipLabel} />} />;
              </BarChart>
            )}
          </AutoSizer>
        </Chart>
      </div>
    );
  }
);
