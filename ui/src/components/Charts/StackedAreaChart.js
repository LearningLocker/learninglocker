import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip} from 'recharts';
import { toJS } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { AutoSizer } from 'react-virtualized';
import NoData from 'ui/components/Graphs/NoData';
import { compose } from 'recompose';
import uuid from 'uuid';
import {
  getStackResultsData,
  getShortModel,
  getChartData,
  hasData,
  getSeriesLabels,
  renderTooltips,
  renderBars,
  renderLegend,
  hiddenSeriesState
} from './Chart';
import styles from './styles.css';

const sortData = data => data.sortBy(e => e.get('id'));

const renderAreas = (labels, colors) => labels.map((label, i) => {
  console.log('area', label, i, colors.get(i))
return <Area type="monotone" dataKey={label} stackId={i} stroke={colors.get(i)} fill={colors.get(i)} />
});

const getSortedData = results => labels => sortData(getStackResultsData(results)(labels));
// const getSortedData = results => labels => serializeForStack(sortData(getResultsData(results)(labels)), labels);
const chartUuid = uuid.v4();


const renderStackChart = (labels, toggleHiddenSeries, hiddenSeries) => colors => data => ({ width, height }) => (
  <AreaChart
    data={getChartData(data, hiddenSeries)}
    width={width}
    height={height}
    margin={{ top: 10, right: 35, left: -20, bottom: 5 }}>
    <XAxis type="category" dataKey="cellId" tickFormatter={getShortModel(data)} />
    <YAxis type="number" />
    <CartesianGrid strokeDasharray="1 1" />
    {renderLegend(labels, toggleHiddenSeries)}
    {renderAreas(getSeriesLabels(labels), colors)}
    {renderTooltips(data)}
  </AreaChart>
  );

const renderChart = (model, component, axesLabels, chartWrapperFn) =>
(
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
        {axesLabels.xLabel || model.getIn(['axesgroup', 'searchString'], 'X-Axis')}
      </span>
    </div>
  </div>
);

const renderChartResults = (labels, toggleHiddenSeries, hiddenSeries) => colors => results =>
  renderStackChart(labels, toggleHiddenSeries, hiddenSeries)(colors)(getSortedData(results)(labels));

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
