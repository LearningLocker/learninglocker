/// <reference path="../definitions/references.d.ts" />
import React = require('react');
var DOM = React.DOM;

interface Props {
  onChange: (string) => void,
  options: Array<string>,
  value: string
}

class Component extends React.Component<Props, any> {
  handleChange(e) {
    this.props.onChange(e.target.value);
  }
  render() {
    return DOM.div({className: 'input-group col col-sm-4', style: {display: 'inline-table'}}, [
      DOM.span({className: 'input-group-addon'}, ['Interval']),
      DOM.select({value: this.props.value, onChange: this.handleChange.bind(this), className: 'form-control'}, this.props.options.map(function (value, index) {
        return DOM.option({value: value}, [value]);
      }.bind(this)))
    ]);
  }
}

export = React.createFactory(Component);
