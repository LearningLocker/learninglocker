/// <reference path="../definitions/references.d.ts" />
import React = require('react');
import Chart = require('react-chartjs');
var BarChart = Chart.Bar;
var DOM = React.DOM;

var TRANSPARENT_ORANGE = 'rgba(245,171,53,0.2)';
var OPAQUE_ORANGE = 'rgba(245,171,53,1)';
var OPAQUE_DARK_ORANGE = '#f4783b';
var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface Props {
  data: Array<any>,
  interval: string
}

class Component extends React.Component<Props, any> {
  shouldComponentUpdate(next_props: Props): boolean {
    return this.props.data !== next_props.data;
  }
  render() {
    var graph_data = {
      labels: this.props.data.map(function (result) {
        switch (this.props.interval) {
          case 'Day-of-week': return DAYS[result._id - 1];
          case 'Month-of-year': return MONTHS[result._id - 1];
          case 'Results-tens': return '' + (result._id * 10) + '-' + ((result._id + 1) * 10) + '%';
          default: return result._id;
        }
      }.bind(this)),
      datasets: [{
        label: "Number of statements",
        fillColor: TRANSPARENT_ORANGE,
        strokeColor: OPAQUE_ORANGE,
        pointColor: OPAQUE_ORANGE,
        pointStrokeColor: OPAQUE_DARK_ORANGE,
        pointHighlightFill: "#fff",
        pointHighlightStroke: OPAQUE_DARK_ORANGE,
        data: this.props.data.map(function (result) {
          return result.count;
        })
      }]
    };

    var graph = this.props.data.length === 0 ? 'No data.' : React.createElement(BarChart, {
      data: graph_data,
      width: '600',
      height: '250',
      redraw: true // https://github.com/jhudson8/react-chartjs/issues/15
    });

    return DOM.div({}, [graph]);
  }
}

export = React.createFactory(Component);