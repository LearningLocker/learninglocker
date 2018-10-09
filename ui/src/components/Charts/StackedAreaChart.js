import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip} from 'recharts';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { AutoSizer } from 'react-virtualized';
import NoData from 'ui/components/Graphs/NoData';
import { compose } from 'recompose';
import uuid from 'uuid';
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
const getSortedData = results => labels => sortData(getResultsData(results)(labels));
const chartUuid = uuid.v4();
const renderStackChart = colors => labels => cData => rawResults => ({ width, height }) => { 
    console.log('data', cData, labels, rawResults)
    const data = [
        {name: 'Page A', uv: 4000, pv: 2400, amt: 2400},
        {name: 'Page B', uv: 3000, pv: 1398, amt: 2210},
        {name: 'Page C', uv: 2000, pv: 9800, amt: 2290},
        {name: 'Page D', uv: 2780, pv: 3908, amt: 2000},
        {name: 'Page E', uv: 1890, pv: 4800, amt: 2181},
        {name: 'Page F', uv: 2390, pv: 3800, amt: 2500},
        {name: 'Page G', uv: 3490, pv: 4300, amt: 2100},
  ]
      //   data={getChartData(data, hiddenSeries)}
    return (
  /* eslint-disable react/no-danger */
  <div>
    <style
      dangerouslySetInnerHTML={{ __html: `
        .grid-${chartUuid} .recharts-cartesian-grid-vertical {
          visibility: hidden !important;
        }
      ` }} />
   <AreaChart 
        data={data}
        margin={{top: 10, right: 30, left: 0, bottom: 0}}
        width={width}
        height={height}>
        <CartesianGrid strokeDasharray="3 3"/>
        <XAxis dataKey="name"/>
        <YAxis/>
        <Tooltip/>
        <Area type='monotone' dataKey='uv' stackId="1" stroke='#8884d8' fill='#8884d8' />
        <Area type='monotone' dataKey='pv' stackId="1" stroke='#82ca9d' fill='#82ca9d' />
        <Area type='monotone' dataKey='amt' stackId="1" stroke='#ffc658' fill='#ffc658' />
      </AreaChart>
  </div>
  /* eslint-enable react/no-danger */
);}
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
const renderChartResults = colors => labels => results => rawResults => (
  renderStackChart(colors)(labels)(rawResults)(getSortedData(results)(labels))
);
const renderResults = results => rawResults => model => colors => labels => axesLabels => chartWrapperFn => (
  renderChart(model, renderChartResults(colors)(labels)(results)(rawResults), axesLabels, chartWrapperFn)
);

export default compose(
  withStyles(styles),
  hiddenSeriesState
)(({
  results,
  rawResults,
  labels,
  colors,
  axesLabels,
  chartWrapperFn = component => (<AutoSizer>{component}</AutoSizer>),
  model
}) => (
  hasData(results) ? renderResults(results)(rawResults)(model)(colors)(labels)(axesLabels)(chartWrapperFn) : <NoData />
));
