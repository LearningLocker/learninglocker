import React from 'react';
import { AutoSizer } from 'react-virtualized';
import { LineChart as Chart, XAxis, YAxis, Line, CartesianGrid } from 'recharts';
import NoData from 'ui/components/Graphs/NoData';
import { compose } from 'recompose';
import { wrapLabel } from 'ui/utils/defaultTitles';
import {
  getResultsData,
  getShortModel,
  getChartData,
  hasData,
  renderTooltips,
  renderLegend,
  hiddenSeriesState
} from './Chart';
import {
  Chart as StyledChart,
  BarContainer,
  XAxis as StyledXAxis,
  YAxis as StyledYAxis,
  XAxisLabel,
  ChartWrapper
} from './styled';

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
  <StyledChart>
    <BarContainer>
      <StyledYAxis>
        {wrapLabel(axesLabels.yLabel || model.getIn(['axesvalue', 'searchString'], 'Y-Axis'))}
      </StyledYAxis>
      <ChartWrapper>
        {chartWrapperFn(component)}
      </ChartWrapper>
    </BarContainer>
    <XAxisLabel>
      <StyledXAxis>
        {axesLabels.xLabel || 'yyyy/mm/dd'}
      </StyledXAxis>
    </XAxisLabel>
  </StyledChart>
);

const renderChartResults = (labels, toggleHiddenSeries, hiddenSeries) => colors => results =>
  renderLineChart(labels, toggleHiddenSeries, hiddenSeries)(colors)(getSortedData(results)(labels));

const renderResults = results => (labels, toggleHiddenSeries, hiddenSeries) => colors => axesLabels => chartWrapperFn => model =>
  renderChart(renderChartResults(labels, toggleHiddenSeries, hiddenSeries)(colors)(results), axesLabels, chartWrapperFn, model);

export default compose(hiddenSeriesState)((
  {
    results,
    labels,
    colors,
    axesLabels,
    chartWrapperFn = component => (<AutoSizer>{component}</AutoSizer>),
    toggleHiddenSeries,
    hiddenSeries,
    model
  }) =>
    (
      hasData(results)
        ? renderResults(results)(labels, toggleHiddenSeries, hiddenSeries)(colors)(axesLabels)(chartWrapperFn)(model)
        : <NoData />
    )
);
