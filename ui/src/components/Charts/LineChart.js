import React from 'react';
import { AutoSizer } from 'react-virtualized';
import { LineChart as Chart, XAxis, YAxis, Line, CartesianGrid } from 'recharts';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import NoData from 'ui/components/Graphs/NoData';
import { compose } from 'recompose';
import {
  getResultsData,
  getShortModel,
  getChartData,
  hasData,
  renderTooltips,
  renderLegend,
  hiddenSeriesState
} from './Chart';
import styles from './styles.css';

const sortData = data =>
  data.sortBy(e => e.get('id'));

const getSortedData = results => labels =>
  sortData(getResultsData(results)(labels));

const renderLine = colors => (label, i) => (
  <Line
    key={i + 1}
    dataKey={`Series ${i + 1}`}
    type="monotone"
    dot={false}
    stroke={colors.get(i)}
    name={label} />
);

const renderLines = labels => colors =>
  labels.map(renderLine(colors)).valueSeq();

const renderLineChart = (labels, toggleHiddenSeries, hiddenSeries) => colors => data => ({ width, height }) => (
  <Chart
    data={getChartData(data, hiddenSeries)}
    width={width}
    height={height}
    margin={{ top: 10, right: 35, left: -20, bottom: 5 }}>
    <XAxis type="category" dataKey="cellId" tickFormatter={getShortModel(data)} />
    <YAxis type="number" />
    <CartesianGrid strokeDasharray="1 1" />
    {renderLegend(labels, toggleHiddenSeries)}
    {renderLines(labels)(colors)}
    {renderTooltips(data)}
  </Chart>
  );

const renderChart = (component, axesLabels, chartWrapperFn, model) => (
  <div className={styles.chart}>
    <div className={`${styles.barContainer}`}>
      <span className={styles.yAxis}>
        {axesLabels.yLabel || model.getIn(['axesvalue', 'searchString'], 'Y-Axis')}
      </span>
      <div className={styles.chartWrapper}>
        {chartWrapperFn(component)}
      </div>
    </div>
    <div className={styles.xAxisLabel}>
      <span className={styles.xAxis}>
        {axesLabels.xLabel || 'yyyy/mm/dd'}
      </span>
    </div>
  </div>
);

const renderChartResults = (labels, toggleHiddenSeries, hiddenSeries) => colors => results =>
  renderLineChart(labels, toggleHiddenSeries, hiddenSeries)(colors)(getSortedData(results)(labels));

const renderResults = results => (labels, toggleHiddenSeries, hiddenSeries) => colors => axesLabels => chartWrapperFn => model =>
  renderChart(renderChartResults(labels, toggleHiddenSeries, hiddenSeries)(colors)(results), axesLabels, chartWrapperFn, model);

export default compose(
  withStyles(styles),
  hiddenSeriesState
)(({
  results,
  labels,
  colors,
  axesLabels,
  chartWrapperFn = component => (<AutoSizer>{component}</AutoSizer>),
  toggleHiddenSeries,
  hiddenSeries,
  model
}) =>
  (hasData(results) ? renderResults(results)(labels, toggleHiddenSeries, hiddenSeries)(colors)(axesLabels)(chartWrapperFn)(model) : <NoData />)
);
