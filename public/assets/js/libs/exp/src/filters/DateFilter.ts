/// <reference path="../definitions/references.d.ts" />
import React = require('react');
import DatePicker = require('../commons/DatePicker');
var DOM = React.DOM;

interface Props {
  since: string,
  until: string,
  onSinceChange: (string) => void,
  onUntilChange: (string) => void
}

class Component extends React.Component<Props, any> {
  handleSinceChange(value) {
    this.props.onSinceChange(value);
  }
  handleUntilChange(value) {
    this.props.onUntilChange(value);
  }
  render() {
    return DOM.div({}, [
      DatePicker({onChange: this.handleSinceChange.bind(this), label: 'Since', value: this.props.since}),
      DatePicker({onChange: this.handleUntilChange.bind(this), label: 'Until', value: this.props.until})
    ]);
  }
}

export = React.createFactory(Component);
