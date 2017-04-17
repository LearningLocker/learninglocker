/// <reference path="../definitions/references.d.ts" />
import React = require('react');
import brace = require('brace');
import ReactAce = require('react-ace');
var DOM = React.DOM;

require('brace/mode/json');
require('brace/theme/github');

interface Props {
  match: any,
  onChange: (Array<string>) => void
}

class Component extends React.Component<Props, any> {
  render() {
    return DOM.div({className: 'text-left'}, [
      React.createElement(ReactAce, {
        mode: 'json',
        theme: 'github',
        onChange: function () {},
        name: 'UNIQUE_ID_OF_DIV',
        editorProps: {'$blockScrolling': true},
        value: JSON.stringify(this.props.match)
      })
    ]);
  }
}

export = React.createFactory(Component);
