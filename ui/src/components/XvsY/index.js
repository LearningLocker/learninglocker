import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import { AutoSizer } from 'react-virtualized';
import { shorten, wrapLabel } from 'ui/utils/defaultTitles';

import {
  ScatterChart,
  XAxis,
  YAxis,
  Tooltip,
  Scatter,
  CartesianGrid
} from 'recharts';
import styled from 'styled-components';
import NoData from 'ui/components/Graphs/NoData';
import { displayAuto } from 'ui/redux/modules/queryBuilder';
import { renderLegend } from 'ui/components/Charts/Chart';
import CustomTooltip from './CustomTooltip';

const Chart = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;

  .desc {
    margin: 0;
    color: #999;
  }

  svg g text {
    font-size: 12px;
  }
`;

const StyledXAxis = styled.span`
  display: inline-block;
  white-space: nowrap;
`;

const StyledYAxis = styled.span`
  display: inline-block;
  writing-mode: vertical-rl;
  transform: rotate(-180deg);
  margin: auto 0;
  margin-left: 15px;
  white-space: pre-wrap;
`;

const XAxisLabel = styled.div`
  text-align: right;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
  position: static;
  margin-right: 15px;
  margin-bottom: 10px;
`;

const BarContainer = styled.div`
  display: flex;
  flex-grow: 1;
`;

const ChartWrapper = styled.div`
  flex-grow: 1;
  flex-shrink: 0;
`;

class XvsY extends Component {
  static propTypes = {
    results: PropTypes.instanceOf(List),
    labels: PropTypes.instanceOf(List),
    colors: PropTypes.instanceOf(List),
    axesLabels: PropTypes.shape({
      xLabel: PropTypes.string,
      yLabel: PropTypes.string,
    }),
  }

  static defaultProps = {
    results: new List()
  }

  shouldComponentUpdate = nextProps => !(
    this.props.results.equals(nextProps.results) &&
    this.props.axesLabels.xLabel === nextProps.axesLabels.xLabel &&
    this.props.axesLabels.yLabel === nextProps.axesLabels.yLabel &&
    this.props.colors.equals(nextProps.colors) &&
    this.props.labels.equals(nextProps.labels) &&
    this.props.trendLines === nextProps.trendLines
  )

  getLargestSeriesSize = () => (
    this.props.results.map(this.getLargestAxisSize).max()
  )

  getLargestAxisSize = axes => (
    axes.map(axis => (Map.isMap(axis) ? axis.size : 0)).max()
  )

  mergeValuesToEntry = (xValues, yValues) => (
    xValues.mergeDeep(yValues)
  )

  mapSeriesToGraphSeries = (xValues, yValues) => {
    const mergedValues = this.mergeValuesToEntry(
      xValues.map(this.mapEntryToGraphEntry('x')),
      yValues.map(this.mapEntryToGraphEntry('y')),
    );

    const out =
      mergedValues.map(entry => ({
        _id: entry.get('_id'),
        model: entry.get('model'),
        x: entry.get('x', 0),
        y: entry.get('y', 0),
      })).valueSeq().toJS();

    return out;
  }

  mapEntryToGraphEntry = axis => entry => new Map({
    _id: entry.get('_id'),
    model: entry.get('model'),
    [axis]: entry.get('count', 0),
  })

  getSeriesData = series => (
    this.mapSeriesToGraphSeries(
      series.get(0, new Map()),
      series.get(1, new Map())
    )
  );

  getEntryPosition = entry => new Map({ x: entry.x, y: entry.y })

  getModelsOfEntries = entries => (
    entries.reduce((results, entry) => (
      results.update(this.getEntryPosition(entry), new List(), models => (
        models.push(displayAuto(entry.model))
      ))
    ), new Map())
  )

  getModelsOfSeries = seriess => (
    seriess.reduce((results, series) => (
      results.mergeWith(
        (prev, next) => prev.concat(next),
        this.getModelsOfEntries(series)
      )
    ), new Map())
  )

  getModels = () => (
    this.getModelsOfSeries(this.props.results.map(this.getSeriesData))
  )

  hasData = () => this.getLargestSeriesSize() < 1

  displayModelAtPosition = models => (x, y) => (
    models.get(new Map({ x, y }), new List())
  );

  renderOneSeries = ({ trendLines }) => (series, index) =>
    (
      <Scatter
        dataKey={`Series ${index + 1}`}
        name={this.props.labels.get(index)}
        key={index}
        line={trendLines}
        lineType="fitting"
        data={this.getSeriesData(series)}
        fill={this.props.colors.get(index)} />
    );

  renderScatterChart = ({ width, height }) => (
    <ScatterChart
      width={width}
      height={height}
      margin={{ top: 10, right: 12, left: -10, bottom: 2 }}>
      <XAxis dataKey="x" type="number" name={this.props.axesLabels.xLabel || 'X Axis'} />
      <YAxis dataKey="y" type="number" name={this.props.axesLabels.yLabel || 'Y AXis'} />
      {this.props.results.map(this.renderOneSeries({ trendLines: this.props.trendLines }))}
      <CartesianGrid />
      {renderLegend(this.props.labels)}
      <Tooltip
        content={<CustomTooltip
          display={this.displayModelAtPosition(this.getModels())} />}
        cursor={{ strokeDasharray: '3 3' }} />
    </ScatterChart>
  )

  renderChart = () => (
    <Chart>
      <BarContainer>
        <StyledYAxis>
          {wrapLabel(this.props.model.get('axesyLabel') || this.props.model.getIn(['axesyValue', 'searchString'], 'Y-Axis'))}
        </StyledYAxis>
        <ChartWrapper>
          <AutoSizer forceChange={this.props.results}>
            {this.renderScatterChart}
          </AutoSizer>
        </ChartWrapper>
      </BarContainer>
      <XAxisLabel>
        <StyledXAxis>
          {this.props.model.get('axesxLabel') || shorten(this.props.model.getIn(['axesxValue', 'searchString'], 'X-Axis'))}
        </StyledXAxis>
      </XAxisLabel>
    </Chart>
  );

  render = () => (
    this.hasData() ? <NoData /> : this.renderChart()
  )
}

export default XvsY;
