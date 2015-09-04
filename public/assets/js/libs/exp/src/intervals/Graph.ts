/// <reference path="../definitions/references.d.ts" />
import React = require('react');
import BarChart = require('./BarChart');
import DatePicker = require('../commons/DatePicker');
import IntervalPicker = require('../commons/IntervalPicker');
import Button = require('../commons/Button');
var DOM = React.DOM;

interface Props {
  match: string,
  service: any
}

interface State {
  since: string,
  until: string,
  interval: string,
  data: Array<any>
}

var getInitialState = function (): State {
  var since = new Date();
  if (since.getMonth() < 1) {
    since.setMonth(11);
  } else {
    since.setMonth(since.getMonth() - 1);
  }

  return {
    since: since.toISOString(),
    until: (new Date()).toISOString(),
    interval: 'Hour-of-day',
    data: []
  };
}

class Component extends React.Component<Props, State> {
  state = getInitialState();
  handleSinceChange(value) {
    this.state.since = value;
    this.setState(this.state);
  }
  handleUntilChange(value) {
    this.state.until = value;
    this.setState(this.state);
  }
  handleIntervalChange(value) {
    this.state.interval = value;
    this.setState(this.state);
  }
  handleDataChange() {
    var data = this.props.service.getResult();
    if (data.length > 102) {
      alert('Too many columns ('+data.length+')');
      return;
    }

    this.state.data = data;
    this.setState(this.state);
  }
  handleUpdate(event) {
    try {
      this.props.service.update(JSON.parse(this.props.match), this.state.since, this.state.until, this.state.interval);
    } catch (ex) {
      console.error(ex); // Provides a stack trace.
      alert(ex); // Provides a message to the user.
    }

    if (event) event.preventDefault();
  }
  componentDidMount() {
    this.props.service.addChangeListener(this.handleDataChange.bind(this));
    this.handleUpdate(null);
  }
  componentWillUnmount() {
    this.props.service.removeChangeListener(this.handleDataChange.bind(this));
  }
  render() {
    return DOM.form({onSubmit: this.handleUpdate.bind(this)}, [
      DatePicker({onChange: this.handleSinceChange.bind(this), label: 'Since', value: this.state.since}),
      DatePicker({onChange: this.handleUntilChange.bind(this), label: 'Until', value: this.state.until}),
      IntervalPicker({onChange: this.handleIntervalChange.bind(this), options: [
        'Hour-of-day',
        'Day-of-week',
        'Day-of-month',
        'Week-of-year',
        'Month-of-year',
        'Results-tens',
        'Results-ones',
        'Verbs',
        'Actors',
        'Activities'
      ], value: this.state.interval}),
      Button({onClick: function () {}, type: 'submit', icon: 'refresh', text: 'Update Graph'}),
      BarChart({data: this.state.data, interval: this.state.interval})
    ]);
  }
}

export = React.createFactory(Component);
