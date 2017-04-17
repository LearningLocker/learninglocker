/// <reference path="../definitions/references.d.ts" />
import React = require('react');
var DOM = React.DOM;

interface Props {
  children: any
}

class Component extends React.Component<Props, any> {
  render() {
    return DOM.span({className: 'btn-group col col-sm-4'}, this.props.children);
  }
}

export = React.createFactory(Component);
