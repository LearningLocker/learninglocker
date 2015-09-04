/// <reference path="../definitions/references.d.ts" />
import React = require('react');
var DOM = React.DOM;

interface Props {
  onClick: () => void,
  icon: string,
  text: string
}

class Component extends React.Component<Props, any> {
  handleClick() {
    this.props.onClick();
  }
  render() {
    return DOM.button({onClick: this.handleClick.bind(this), className: 'btn btn-default'}, [
      DOM.span({className: 'glyphicon glyphicon-'+this.props.icon}, []),
      DOM.span({}, [' '+this.props.text])
    ]);
  }
}

export = React.createFactory(Component);
