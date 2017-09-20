import React, { Component, PropTypes } from 'react';
import { List } from 'immutable';
import { AutoSizer } from 'react-virtualized';
import { BarChart as Chart, XAxis, YAxis } from 'recharts';
import { compose } from 'recompose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import NoData from 'ui/components/Graphs/NoData';
import { Button } from 'react-toolbox/lib/button';
import {
  getResultsData,
  getShortModel,
  getChartData,
  getDomain,
  hasData,
  renderTooltips,
  renderBars,
  renderLegend,
  hiddenSeriesState
} from './Chart';
import styles from './styles.css';

const enhance = compose(
  withStyles(styles),
  hiddenSeriesState
);

class BarChart extends Component {
  static propTypes = {
    results: PropTypes.instanceOf(List),
    labels: PropTypes.instanceOf(List),
    colors: PropTypes.instanceOf(List),
    stacked: PropTypes.bool,
    axesLabels: PropTypes.instanceOf(Object),
    chartWrapperFn: PropTypes.instanceOf(Function)
  }

  static defaultProps = {
    chartWrapperFn: component => (<AutoSizer>{component}</AutoSizer>)
  }

  state = {
    activePage: 0,
  }

  displayPrevPage = () => this.setState({ activePage: this.state.activePage - 1 })
  displayNextPage = () => this.setState({ activePage: this.state.activePage + 1 })
  getDataChunk = data => page => data.slice(10 * page, 10 * (page + 1))
  getPages = data => Math.ceil(data.size / 10)
  hasPrevPage = pages => page => pages > 0 && page > 0
  hasNextPage = pages => page => pages > 0 && page < pages - 1
  sortData = data => data.sortBy(e => -e.get('total'))
  getSortedData = results => labels => (
    this.sortData(getResultsData(results)(labels))
  )

  renderPrevButton = () => (
    <span className={styles.prevButton}>
      <Button
        raised
        label="Previous"
        onMouseUp={this.displayPrevPage}
        style={styles.button}
        icon={<i className="icon ion-chevron-left" />} />
    </span>
  )

  renderNextButton = () => (
    <span className={styles.nextButton}>
      <Button
        raised
        label="Next"
        onMouseUp={this.displayNextPage}
        style={styles.button}
        icon={<i className="icon ion-chevron-right" />} />
    </span>
  )

  renderBarChart = colors => labels => data => stacked => page => ({ width, height }) => (
    <Chart
      data={getChartData(this.getDataChunk(data)(page), this.props.hiddenSeries)}
      width={width}
      height={height}
      layout="vertical">
      <YAxis
        dataKey="cellId"
        tickFormatter={getShortModel(data)}
        type="category"
        width={90} />
      <XAxis type="number" domain={getDomain(data)} />
      {renderLegend(labels, this.props.toggleHiddenSeries)}
      {renderBars(colors)(labels)(stacked)}
      {renderTooltips(data, this.props.hiddenSeries)}
    </Chart>
    )

  renderResults = results => colors => labels => (stacked) => {
    const { activePage } = this.state;
    const data = this.getSortedData(results)(labels);
    const pages = this.getPages(data);

    return (
      <div className={`${styles.chart}`}>
        <div className={`${styles.buttons}`}>
          {this.hasPrevPage(pages)(activePage) && this.renderPrevButton()}
          {this.hasNextPage(pages)(activePage) && this.renderNextButton()}
        </div>
        <div className={`${styles.xAxisLabel} ${styles.withPrevNext} clearfix`}>
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
            {this.props.chartWrapperFn((this.renderBarChart(colors)(labels)(data)(stacked)(activePage)))}
          </div>
        </div>
      </div>
    );
  }

  render = () => {
    const { results, labels, stacked, colors } = this.props;
    return (
      hasData(this.props.results)
      ? this.renderResults(results)(colors)(labels)(stacked)
      : <NoData />
    );
  }
}

export default enhance(BarChart);
