import React, { Component, PropTypes } from 'react';
import { List } from 'immutable';
import { AutoSizer } from 'react-virtualized';
import Dropdown from 'react-toolbox/lib/dropdown';
import Checkbox from 'react-toolbox/lib/checkbox';
import { BarChart as Chart, XAxis, YAxis, CartesianGrid } from 'recharts';
import ReactEcharts from 'echarts-for-react';
import { compose } from 'recompose';
import { omitBy, isFunction } from 'lodash';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import NoData from 'ui/components/Graphs/NoData';
import { Button } from 'react-toolbox/lib/button';
import {VISUALISATION_COLORS} from 'ui/utils/constants'
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
const theme = omitBy(styles, isFunction);


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

class BoxPlot extends Component {
  static propTypes = {
    results: PropTypes.instanceOf(List),
    labels: PropTypes.instanceOf(List),
    colors: PropTypes.instanceOf(List),
    stacked: PropTypes.bool,
    chartWrapperFn: PropTypes.instanceOf(Function),
  }

  // chartState: [{
  //   barType: 'bar',
  //   smooth: false,
  //   pieType: 'pie',
  // }, {
  //   barType: 'line',
  //   smooth: false,
  //   pieType: 'pie',
  // },{
  //   barType: Line,
  //   smooth: true,
  //   pieType: 'pie',
  // }]
  constructor(props) {
    super(props);
    this.state = {
      barTypes: ['bar', 'line', 'bar', 'line'],
      pieTypes: ['pie', 'pie', 'pie', 'pie'],
      chartType: 'barTypes',
      seriesType: [0, 0, 0],
      dropdownOptions: [
        { value: 'barTypes', label: 'Bar/Line Chart' },
        { value: 'pieTypes', label: 'Pie Chart'},
      ],
      eventFactory: {
        click: this.handleEvent,
      }
    };
  }

  static defaultProps = {
    chartWrapperFn: component => (<AutoSizer>{component}</AutoSizer>)
  }

  handleChange = value => this.setState({ chartType: value });

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

  handleEvent = (e) => {
    this.setState({ seriesType: this.chartTypeToggle(e.seriesIndex, this.state.seriesType) })
  }

  chartTypeToggle = (index, series) => {
    console.log('si', series[index], this.state[this.state.chartType], this.state[this.state.chartType].length -1)
    if (series[index] === this.state[this.state.chartType].length -1){
      series[index] = 0;
    } else {
      series[index] += 1;
    }
    return series;
  }
  handleLegendEvent = (e) => {
    console.log('legend event ', e)
  }

  handleStyle = (index, color) => {
    if (this.state[this.state.chartType][this.state.seriesType[index]] === 'bar' ||
    this.state[this.state.chartType][this.state.seriesType[index]] === 'line'
    ) {
      return { color: VISUALISATION_COLORS[color] };
    }
    return {};
  }

  renderBarChart = model => colors => labels => data => stacked => page => ({ width, height }) => {
    console.log('model => colors => labels => data => stacked => page', model, colors, labels, data, stacked, page)
    const chartUuid = uuid.v4();
    console.log('state', this.state)
    const getOption = () => {
      return {
          legend: {},
          tooltip: {},
          dataset: {
              source: [
                  ['Person', '2015', '2016', '2017'],
                  ['Ian Blackburn', 43.3, 85.8, 93.7],
                  ['Dan Stein', 83.1, 73.4, 55.1],
                  ['Ryan Dein', 86.4, 65.2, 82.5],
                  ['Chris Bishop', 72.4, 53.9, 39.1]
              ]
          },
          xAxis: { type: 'category' },
          yAxis: {},
          series: [
            { type: this.state[this.state.chartType][this.state.seriesType[0]], 
              stack: this.state.stacked,
              itemStyle: this.handleStyle(0, 0)
            },
            { type: this.state[this.state.chartType][this.state.seriesType[1]],
              stack: this.state.stacked,
              itemStyle: this.handleStyle(0, 1)
            },
            { type: this.state[this.state.chartType][this.state.seriesType[2]],
              stack: this.state.stacked,
              itemStyle: this.handleStyle(0, 4) 
            }
          ]
      };
    };
    // use configuration item and data specified to show chart
    /* eslint-disable react/no-danger */
    return (
      <ReactEcharts
        option={getOption()}
        notMerge={true}
        lazyUpdate={true}
        theme={'theme_name'}
        style={{ width, height }}
        onEvents={this.state.eventFactory}
        onChartReady={this.onChartReadyCallback} />

    );
    /* eslint-enable react/no-danger */
  };

//   <Chart
//   className={`grid-${chartUuid}`}
//   data={getChartData(this.getDataChunk(model)(data)(page), this.props.hiddenSeries)}
//   width={width}
//   height={height}
//   layout="vertical">
//   <CartesianGrid strokeDasharray="1 1" />
//   <YAxis
//     dataKey="cellId"
//     tickFormatter={getShortModel(data)}
//     type="category"
//     width={90} />
//   <XAxis type="number" />
//   {renderLegend(labels, this.props.toggleHiddenSeries)}
//   {renderBars(colors)(labels)(stacked)}
//   {renderTooltips(data, this.props.hiddenSeries)}
// </Chart>
  renderResults = model => results => colors => labels => (stacked) => {
    const { activePage } = this.props;
    const data = this.getSortedData(results)(labels);
    const pages = this.getPages(model, data);

 
    console.log('sorted data', data)

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
          <Dropdown
            // theme={omitBy(styles, isFunction)}
            source={this.state.dropdownOptions}
            auto
            theme={theme}
            value={this.state.chartType}
            onChange={this.handleChange} />
            <Checkbox
              theme={theme}
              className="checkBox"
              checked={this.state.stacked}
              label={'Stacked'}
              onChange={() => this.setState({ stacked: !this.state.stacked })} />
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

export default enhance(BoxPlot);
