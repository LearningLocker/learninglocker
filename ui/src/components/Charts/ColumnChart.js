import React from 'react';
import { BarChart as Chart, XAxis, YAxis } from 'recharts';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { AutoSizer } from 'react-virtualized';
import NoData from 'ui/components/Graphs/NoData';
import { compose } from 'recompose';
import {
  getResultsData,
  getShortModel,
  getChartData,
  hasData,
  renderTooltips,
  renderBars,
  renderLegend,
  hiddenSeriesState
} from './Chart';
import styles from './styles.css';

const sortData = data => data.sortBy(e => e.get('id'));

const getSortedData = results => labels =>
  sortData(getResultsData(results)(labels));

const renderBarChart = colors => (labels, toggleHiddenSeries, hiddenSeries) => stacked => data => ({ width, height }) => (
  <Chart
    data={getChartData(data, hiddenSeries)}
    width={width}
    height={height}
    layout="horizontal">
    <XAxis type="category" dataKey="cellId" tickFormatter={getShortModel(data)} />
    <YAxis type="number" />
    {renderLegend(labels, toggleHiddenSeries)}
    {renderBars(colors)(labels)(stacked)}
    {renderTooltips(data)}
  </Chart>
);
const renderChart = (component, axesLabels, chartWrapperFn) => (
  <div className={styles.chart}>
    <div className={styles.xAxisLabel}>
      <span className={styles.xAxis}>
        {axesLabels.xLabel || 'X Axis'}
      </span>
    </div>
    <div className={`${styles.barContainer}`}>
      <div className={styles.yAxisLabel}>
        <span className={styles.yAxis}>
          {axesLabels.yLabel || 'Y Axis'}
        </span>
      </div>
      <div className={styles.chartWrapper}>
        {chartWrapperFn(component)}
      </div>
    </div>
  </div>
);

const renderChartResults = colors => (labels, toggleHiddenSeries, hiddenSeries) => stacked => results => (
  renderBarChart(colors)(labels, toggleHiddenSeries, hiddenSeries)(stacked)(getSortedData(results)(labels))
);
const renderResults = results => colors => (labels, toggleHiddenSeries, hiddenSeries) => stacked => axesLabels => chartWrapperFn => (
  renderChart(renderChartResults(colors)(labels, toggleHiddenSeries, hiddenSeries)(stacked)(results), axesLabels, chartWrapperFn)
);

export default compose(
  withStyles(styles),
  hiddenSeriesState
)(({
  results,
  labels,
  colors,
  stacked,
  axesLabels,
  chartWrapperFn = component => (<AutoSizer>{component}</AutoSizer>),
  toggleHiddenSeries,
  hiddenSeries
}) => (
  hasData(results) ? renderResults(results)(colors)(labels, toggleHiddenSeries, hiddenSeries)(stacked)(axesLabels)(chartWrapperFn) : <NoData />
));
