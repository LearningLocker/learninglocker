import React from 'react';
import { BarChart as Chart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AutoSizer } from 'react-virtualized';
import NoData from 'ui/components/Graphs/NoData';
import { compose } from 'recompose';
import uuid from 'uuid';
import { wrapLabel } from 'ui/utils/defaultTitles';
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
import {
  Chart as StyledChart,
  BarContainer,
  XAxis as StyledXAxis,
  YAxis as StyledYAxis,
  XAxisLabel,
  ChartWrapper
} from './styled';

const sortData = data => data.sortBy(e => e.get('id'));
const getSortedData = results => labels => sortData(getResultsData(results)(labels));
const chartUuid = uuid.v4();
const renderBarChart = colors => (labels, toggleHiddenSeries, hiddenSeries) => stacked => data => ({ width, height }) => (
  /* eslint-disable react/no-danger */
  <div>
    <style
      dangerouslySetInnerHTML={{
        __html: `
        .grid-${chartUuid} .recharts-cartesian-grid-vertical {
          visibility: hidden !important;
        }
      ` }} />
    <Chart
      className={`grid-${chartUuid}`}
      data={getChartData(data, hiddenSeries)}
      width={width}
      height={height}
      layout="horizontal">
      <XAxis type="category" dataKey="cellId" tickFormatter={getShortModel(data)} />
      <YAxis type="number" />
      <CartesianGrid strokeDasharray="1 1" />
      {renderLegend(labels, toggleHiddenSeries)}
      {renderBars(colors)(labels)(stacked)}
      {renderTooltips(data)}
    </Chart>
  </div>
  /* eslint-enable react/no-danger */
);
const renderChart = (model, component, axesLabels, chartWrapperFn) =>
(
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
        {axesLabels.xLabel || model.getIn(['axesgroup', 'searchString'], 'X-Axis')}
      </StyledXAxis>
    </XAxisLabel>
  </StyledChart>
);
const renderChartResults = colors => (labels, toggleHiddenSeries, hiddenSeries) => stacked => results => (
  renderBarChart(colors)(labels, toggleHiddenSeries, hiddenSeries)(stacked)(getSortedData(results)(labels))
);
const renderResults = results => model => colors => (labels, toggleHiddenSeries, hiddenSeries) => stacked => axesLabels => chartWrapperFn => (
  renderChart(model, renderChartResults(colors)(labels, toggleHiddenSeries, hiddenSeries)(stacked)(results), axesLabels, chartWrapperFn)
);

export default compose(hiddenSeriesState)(({
    results,
    labels,
    colors,
    stacked,
    axesLabels,
    chartWrapperFn = component => (<AutoSizer>{component}</AutoSizer>),
    toggleHiddenSeries,
    hiddenSeries,
    model
  }) => (
    hasData(results)
      ? renderResults(results)(model)(colors)(labels, toggleHiddenSeries, hiddenSeries)(stacked)(axesLabels)(chartWrapperFn)
      : <NoData />
  )
);
