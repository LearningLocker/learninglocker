import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { AutoSizer } from 'react-virtualized';
import { BarChart as Chart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { compose } from 'recompose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import NoData from 'ui/components/Graphs/NoData';
import { Button } from 'react-toolbox/lib/button';
import uuid from 'uuid';
import { connect } from 'react-redux';
import { getMetadataSelector, setInMetadata } from 'ui/redux/modules/metadata';
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


const enhance = compose(
  withStyles(styles),
  hiddenSeriesState,
  connect((state, { model }) =>
    ({
      activePage: getMetadataSelector({
        schema: 'visualisation',
        id: model.get('_id')
      })(state).get('activePage', 0)
    }), { setInMetadata })
);

class BarChart extends Component {
  static propTypes = {
    results: PropTypes.instanceOf(List),
    labels: PropTypes.instanceOf(List),
    colors: PropTypes.instanceOf(List),
    stacked: PropTypes.bool,
    chartWrapperFn: PropTypes.instanceOf(Function),
  }

  static defaultProps = {
    chartWrapperFn: component => (<AutoSizer>{component}</AutoSizer>)
  }

  displayPrevPage = () => this.props.setInMetadata({
    schema: 'visualisation',
    id: this.props.model.get('_id'),
    path: ['activePage'],
    value: this.props.activePage - 1
  });

  displayNextPage = () => this.props.setInMetadata({
    schema: 'visualisation',
    id: this.props.model.get('_id'),
    path: ['activePage'],
    value: this.props.activePage + 1
  });

  getDataChunk = model => data => page => data.slice(model.get('barChartGroupingLimit') * page, model.get('barChartGroupingLimit') * (page + 1))
  getPages = (model, data) => Math.ceil(data.size / (model.get('barChartGroupingLimit') + 1));
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

  renderBarChart = model => colors => labels => data => stacked => page => ({ width, height }) => {
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
        <Chart
          className={`grid-${chartUuid}`}
          data={getChartData(this.getDataChunk(model)(data)(page), this.props.hiddenSeries)}
          width={width}
          height={height}
          layout="vertical">
          <CartesianGrid strokeDasharray="1 1" />
          <YAxis
            dataKey="cellId"
            tickFormatter={getShortModel(data)}
            type="category"
            width={90} />
          <XAxis type="number" />
          {renderLegend(labels, this.props.toggleHiddenSeries)}
          {renderBars(colors)(labels)(stacked)}
          {renderTooltips(data, this.props.hiddenSeries)}
        </Chart>
      </div>
    );
    /* eslint-enable react/no-danger */
  };

  renderResults = model => results => colors => labels => (stacked) => {
    const { activePage } = this.props;
    const data = this.getSortedData(results)(labels);
    const pages = this.getPages(model, data);

    return (
      <div className={`${styles.chart}`}>
        <div className={`${styles.buttons}`}>
          {this.hasPrevPage(pages)(activePage) && this.renderPrevButton()}
          {this.hasNextPage(pages)(activePage) && this.renderNextButton()}
        </div>
        <div className={`${styles.withPrevNext} clearfix`} />
        <div className={`${styles.barContainer}`}>
          <span className={styles.yAxis}>
            {this.props.model.get('axesyLabel') || this.props.model.getIn(['axesgroup', 'searchString'], 'Y-Axis')}
          </span>
          <div className={styles.chartWrapper}>
            {this.props.chartWrapperFn((this.renderBarChart(model)(colors)(labels)(data)(stacked)(activePage)))}
          </div>
        </div>
        <div className={styles.xAxisLabel}>
          <span className={styles.xAxis}>
            {this.props.model.get('axesxLabel') || this.props.model.getIn(['axesvalue', 'searchString'], 'X-Axis')}
          </span>
        </div>
      </div>
    );
  }

  render = () => {
    const { results, labels, stacked, colors, model } = this.props;
    return (
      hasData(this.props.results)
      ? this.renderResults(model)(results)(colors)(labels)(stacked)
      : <NoData />
    );
  }
}

export default enhance(BarChart);
