/// <reference path="../definitions/references.d.ts" />
import React = require('react');
var DOM = React.DOM;

interface Props {
  onChange: (string) => void,
  label: string,
  placeholder: string,
  value: string
}

class Component extends React.Component<Props, any> {
  handleChange(e) {
    this.props.onChange(e.target.value);
  }
  render() {
    return DOM.div({className: 'input-group'}, [
      DOM.span({className: 'input-group-addon'}, [this.props.label]),
      DOM.input({onChange: this.handleChange.bind(this), className: 'form-control', placeholder: this.props.placeholder, value: this.props.value}, [])
    ]);
  }
}

export = React.createFactory(Component);
