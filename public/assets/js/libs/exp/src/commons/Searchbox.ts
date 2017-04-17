/// <reference path="../definitions/references.d.ts" />
import React = require('react');
var DOM = React.DOM;

interface Props {
  onChange: (string) => void,
  value: string
}

class Component extends React.Component<Props, any> {
  handleChange(e) {
    this.props.onChange(e.target.value);
  }
  render() {
    return DOM.input({
      onChange: this.handleChange.bind(this),
      className: 'form-control',
      placeholder: 'Search',
      value: this.props.value
    }, []);
  }
}

export = React.createFactory(Component);
