/// <reference path="../definitions/references.d.ts" />
import React = require('react');
var DOM = React.DOM;

interface Props {
  onChange: (string) => void,
  label: string,
  value: string
}

class Component extends React.Component<Props, any> {
  handleChange(e) {
    this.props.onChange(e.target.value);
  }
  render() {
    return DOM.span({className: 'input-group col-sm-4', style: {display: 'inline-table'}}, [
      DOM.span({className: 'input-group-addon'}, [this.props.label]),
      DOM.input({onChange: this.handleChange.bind(this), className: 'form-control', placeholder: 'YYYY-MM-DD', value: this.props.value}, [])
    ]);
  }
}

export = React.createFactory(Component);
