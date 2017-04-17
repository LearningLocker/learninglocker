/// <reference path="../definitions/references.d.ts" />
import React = require('react');
var DOM = React.DOM;

interface Props {
  onChange: (string) => void,
  value: string,
  checked: boolean
}

class Component extends React.Component<Props, any> {
  handleChange(e) {
    this.props.onChange(e.target.checked);
  }
  render() {
    return DOM.input({
      onChange: this.handleChange.bind(this),
      checked: this.props.checked,
      type: 'checkbox'
    }, [DOM.span({className: 'wrap'}, [' ' + this.props.value])]);
  }
}

export = React.createFactory(Component);
