/// <reference path="../definitions/references.d.ts" />
import React = require('react');
import Tab = require('../commons/Tab');
var DOM = React.DOM;

interface Props {
  onTabChange: (string) => void,
  options: Array<string>,
  value: string
}

class Component extends React.Component<Props, any> {
  handleTabChange(tab) {
    return function () {
      this.props.onTabChange(tab);
    }.bind(this);
  }
  render() {
    return DOM.ul({className: 'nav nav-tabs'}, this.props.options.map(function (option) {
      return Tab({onClick: this.handleTabChange(option), active: this.props.value === option, text: option});
    }.bind(this)));
  }
}

export = React.createFactory(Component);
