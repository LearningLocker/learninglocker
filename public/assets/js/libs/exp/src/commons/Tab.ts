/// <reference path="../definitions/references.d.ts" />
import React = require('react');
var DOM = React.DOM;

interface Props {
  onClick: () => void,
  text: string,
  active: boolean
}

class Component extends React.Component<Props, any> {
  handleClick() {
    this.props.onClick();
  }
  render() {
    return DOM.li({onClick: this.handleClick.bind(this), role: 'presentation', className: this.props.active ? 'active' : ''}, [DOM.a({}, [this.props.text])]);
  }
}

export = React.createFactory(Component);
