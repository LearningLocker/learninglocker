import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import { AutoSizer } from 'react-virtualized';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'recompose';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import NoData from 'ui/components/Graphs/NoData';
import styles from './styles.css';

/**
 * @typedef {{
  *   y: string,
  *   x1: number,
  *   x2: number,
  * }} Item
  */

/**
 * @param {Item[]} data
 * @param {string} topXLabel
 * @param {string} bottomXLabel
 * @param {(v: number) => string} topXFormatter - optional
 * @param {(v: number) => string} bottomXFormatter - optional
 * @param {(v: string) => string} yFormatter - optional
 */
const TooltipContent = ({
  // These props are injected
  data,
  x1Label,
  x2Label,
  topXFormatter = x => x,
  bottomXFormatter = x => x,
  yFormatter = x => x,
  // The rest props are from recharts.Tooltip
  label,
}) => {
  /**
   * @type {Item|{}}
   */
  const item = data.find(d => d.y === label) || {};

  return (
    <div className={styles.customTooltip}>
      <p className={styles.label}>
        {yFormatter(item.y)}
      </p>

      <div className={styles.value}>
        <p>{x1Label} - {topXFormatter(item.x1)}</p>
        <p>{x2Label} - {bottomXFormatter(item.x2)}</p>
      </div>
    </div>
  );
};

const StyledTooltipContent = withStyles(styles)(TooltipContent);

/**
 * @param {Item[]} data
 * @param {string} topXBarColor - e.g. "#123456"
 * @param {string} bottomXBarColor - e.g. "#123456"
 * @param {string} topXLabel
 * @param {string} bottomXLabel
 * @param {(v: any) => any} topXBarTickFormatter - optional
 * @param {(v: any) => any} bottomXBarTickFormatter - optional
 * @param {(v: any) => any} yTickFormatter - optional
 *
 * props for Tooltip
 * @param {(v: number) => string} topXFormatter - optional
 * @param {(v: number) => string} bottomXFormatter - optional
 * @param {(v: string) => string} yFormatter - optional
 */
const renderChart = ({
  data,
  topXBarColor,
  bottomXBarColor,
  topXLabel,
  bottomXLabel,
  topXBarTickFormatter,
  bottomXBarTickFormatter,
  yTickFormatter,
  topXFormatter,
  bottomXFormatter,
  yFormatter,
}) => ({ width, height }) => {
  const chartUuid = uuid.v4();
  /* eslint-disable react/no-danger */
  return (
    <div>
      <style
        dangerouslySetInnerHTML={{ __html: `
          .grid-${chartUuid} .recharts-cartesian-grid-horizontal {
            background-color: 'yellow';
            visibility: hidden !important;
          }
        ` }} />
      <BarChart
        className={`grid-${chartUuid}`}
        data={data}
        width={width}
        height={height}
        layout="vertical" >

        <CartesianGrid strokeDasharray="1 1" />

        <YAxis
          type="category"
          dataKey="y"
          tickFormatter={yTickFormatter}
          width={90} />

        <XAxis
          xAxisId="1"
          orientation="top"
          type="number"
          tickFormatter={topXBarTickFormatter} />

        <XAxis
          xAxisId="2"
          orientation="bottom"
          type="number"
          tickFormatter={bottomXBarTickFormatter} />

        <Bar xAxisId="1" dataKey="x1" fill={topXBarColor} />
        <Bar xAxisId="2" dataKey="x2" fill={bottomXBarColor} />

        <Tooltip
          content={
            <StyledTooltipContent
              data={data}
              x1Label={topXLabel}
              x2Label={bottomXLabel}
              topXFormatter={topXFormatter}
              bottomXFormatter={bottomXFormatter}
              yFormatter={yFormatter} />
          }
          cursor={{ fill: 'grey', fillOpacity: 0.1 }} />
      </BarChart>
    </div>
  );
};

/**
 * @param {Item[]} data
 * @param {string} topXBarColor - e.g. "#123456"
 * @param {string} bottomXBarColor - e.g. "#123456"
 * @param {string} topXLabel
 * @param {string} bottomXLabel
 * @param {string} yLabel
 * @param {(v: any) => any} topXBarTickFormatter - optional
 * @param {(v: any) => any} bottomXBarTickFormatter - optional
 * @param {(v: any) => any} yTickFormatter - optional
 *
 * props for Tooltip
 * @param {(v: number) => string} topXFormatter - optional
 * @param {(v: number) => string} bottomXFormatter - optional
 * @param {(v: string) => string} yFormatter - optional
 *
 */
const BiaxialBarChart = ({
  data,
  topXBarColor,
  bottomXBarColor,
  topXLabel,
  bottomXLabel,
  yLabel,
  topXBarTickFormatter,
  bottomXBarTickFormatter,
  yTickFormatter,
  topXFormatter,
  bottomXFormatter,
  yFormatter,
}) => {
  if (data.length === 0) {
    return <NoData />;
  }
  return (
    <div className={styles.chart}>
      <div className={styles.xAxisLabel}>
        <span className={styles.xAxis}>
          <div
            className={styles.xAxisLabelLegendIcon}
            style={{ backgroundColor: topXBarColor }} />
          {topXLabel}
        </span>
      </div>
      <div className={`${styles.barContainer}`}>
        <span className={styles.yAxis}>
          {yLabel}
        </span>
        <div className={styles.chartWrapper}>
          <AutoSizer>
            {renderChart({
              data,
              topXBarColor,
              bottomXBarColor,
              topXLabel,
              bottomXLabel,
              topXBarTickFormatter,
              bottomXBarTickFormatter,
              yTickFormatter,
              topXFormatter,
              bottomXFormatter,
              yFormatter,
            })}
          </AutoSizer>
        </div>
      </div>
      <div className={styles.xAxisLabel}>
        <span className={styles.xAxis}>
          <div
            className={styles.xAxisLabelLegendIcon}
            style={{ backgroundColor: bottomXBarColor }} />
          {bottomXLabel}
        </span>
      </div>
    </div>
  );
};

BiaxialBarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  topXBarColor: PropTypes.string.isRequired,
  bottomXBarColor: PropTypes.string.isRequired,
  topXLabel: PropTypes.string.isRequired,
  bottomXLabel: PropTypes.string.isRequired,
  yLabel: PropTypes.string.isRequired,
  topXBarTickFormatter: PropTypes.func,
  bottomXBarTickFormatter: PropTypes.func,
  yTickFormatter: PropTypes.func,
  topXFormatter: PropTypes.func,
  bottomXFormatter: PropTypes.func,
  yFormatter: PropTypes.func,
};

export default compose(
  withStyles(styles),
)(BiaxialBarChart);
