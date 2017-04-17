/// <reference path="../../libs/exp/src/definitions/references.d.ts" />
import React = require('react');
import Repo = require('../../libs/exp/src/commons/AggregationRepo');
import IntervalsGraph = require('../../libs/exp/src/intervals/Graph');
import IntervalsService = require('../../libs/exp/src/intervals/Service');
import TimesGraph = require('../../libs/exp/src/times/Graph');
import TimesService = require('../../libs/exp/src/times/Service');
var DOM = React.DOM;

interface Props {
  endpoint: string,
  username: string,
  password: string,
  match: string
}

class Component extends React.Component<Props, any> {
  render() {
    var repo = new Repo(this.props.endpoint, this.props.username, this.props.password);
    var intervals_service = new IntervalsService(repo);
    var times_service = new TimesService(repo);

    return DOM.div({}, [
      IntervalsGraph({service: intervals_service, match: this.props.match}),
      TimesGraph({service: times_service, match: this.props.match})
    ]);
  }
}

var Factory = React.createFactory(Component);
var Export = function (element, props) {
  return React.render(Factory(props), element);
};
export = window.ReportGraphs = Export;

// cd public/assets/js/reports/reports;
// npm install; tsc Graphs.ts --outDir tmp --module commonjs -t ES5; browserify tmp/reports/reports/Graphs.js -o Graphs.bundle.js;
// Condition on line 2006 of ../node_modules/chart.js/Chart.js needs changing to `false` so that AMD isn't used.
