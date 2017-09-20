import React, { Component, PropTypes } from 'react';
import { Map, List } from 'immutable';
import { AutoSizer } from 'react-virtualized';
import { ScatterChart, XAxis, YAxis, Tooltip, Scatter, CartesianGrid } from 'recharts';
import NoData from 'ui/components/Graphs/NoData';
import { displayAuto } from 'ui/redux/modules/queryBuilder';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { renderLegend } from 'ui/components/Charts/Chart';
import CustomTooltip from './CustomTooltip';
import styles from './styles.css';

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
    this.props.labels.equals(nextProps.labels)
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

  renderOneSeries = (series, index) =>
    (
      <Scatter
        dataKey={`s${index}`}
        name={this.props.labels.get(index)}
        key={index}
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
      {this.props.results.map(this.renderOneSeries)}
      <CartesianGrid />
      {renderLegend(this.props.labels)}
      <Tooltip
        content={<CustomTooltip
          display={this.displayModelAtPosition(this.getModels())} />}
        cursor={{ strokeDasharray: '3 3' }} />
    </ScatterChart>
  );

  renderChart = () => (
    <div className={styles.chart}>
      <div className={styles.xAxisLabel}>
        <span className={styles.xAxis}>
          {this.props.axesLabels.xLabel || 'X Axis'}
        </span>
      </div>
      <div className={`${styles.barContainer}`}>
        <div className={styles.yAxisLabel}>
          <span className={styles.yAxis}>
            {this.props.axesLabels.yLabel || 'Y Axis'}
          </span>
        </div>
        <div className={styles.chartWrapper}>
          <AutoSizer forceChange={this.props.results}>
            {this.renderScatterChart}
          </AutoSizer>
        </div>
      </div>
    </div>
  )

  render = () => (
    this.hasData() ? <NoData /> : this.renderChart()
  )
}

export default withStyles(styles)(XvsY);
