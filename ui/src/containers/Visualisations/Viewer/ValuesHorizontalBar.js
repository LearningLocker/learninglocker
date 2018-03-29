// @ts-check
import React from 'react';
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
import { Button } from 'react-toolbox/lib/button';
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
    const chartDataEntries = getSortedValueChartEntries(groupDictionary, groupedSeriesResults);
    const getGroupAxisLabel = createGroupAxisLabeller(groupDictionary);
    const getGroupTooltipLabel = createGroupTooltipLabeller(groupDictionary);
    const minValue = 0;
    const maxValue = 100;

    return (
      <div className={styles.chart}>
        <div className={`${styles.buttons}`}>
          <span className={styles.prevButton}>
            <Button
              raised
              label="Previous"
              onMouseUp={() => null}
              style={styles.button}
              icon={<i className="icon ion-chevron-left" />} />
          </span>
          <span className={styles.nextButton}>
            <Button
              raised
              label="Next"
              onMouseUp={() => null}
              style={styles.button}
              icon={<i className="icon ion-chevron-right" />} />
          </span>
        </div>
        <Chart xAxisLabel={model.value.label} yAxisLabel={model.group.label}>
          <AutoSizer>
            {({ height, width }) => (
              <BarChart layout="vertical" data={chartDataEntries} width={width} height={height}>
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

export default render;
