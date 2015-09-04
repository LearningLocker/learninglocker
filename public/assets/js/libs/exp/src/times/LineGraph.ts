/// <reference path="../definitions/references.d.ts" />
import React = require('react');
import Chart = require('react-chartjs');
var LineGraph = Chart.Line;
var DOM = React.DOM;

var TRANSPARENT_ORANGE = 'rgba(245,171,53,0.2)';
var OPAQUE_ORANGE = 'rgba(245,171,53,1)';
var OPAQUE_DARK_ORANGE = '#f4783b';

interface Props {
  data: Array<any>,
  interval: string
}

class Component extends React.Component<Props, any> {
  shouldComponentUpdate(next_props: any): boolean {
    return this.props.data !== next_props.data;
  }
  render() {
    var graph_data = {
      labels: this.props.data.map(function (result) {
        var dateStr = function (x) {
          return ('0' + x).split('').slice(-2).join('');
        };
        var date = new Date(result.first);
        var str = '';

        switch (this.props.interval) {
          case 'Hour': str = ' ' + dateStr(date.getHours()) + ':00' + str;
          case 'Day': str = '-' + dateStr(date.getDate()) + str;
          case 'Month': str = '-' + dateStr(date.getMonth() + 1) + str;
          default: str = date.getFullYear() + str;
        }

        return str;
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

    var graph = this.props.data.length === 0 ? 'No data.' : React.createElement(LineGraph, {
      data: graph_data,
      width: '600',
      height: '250',
      redraw: true // https://github.com/jhudson8/react-chartjs/issues/15
    });

    return DOM.div({}, [graph]);
  }
}

export = React.createFactory(Component);