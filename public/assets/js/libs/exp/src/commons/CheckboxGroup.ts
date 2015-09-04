/// <reference path="../definitions/references.d.ts" />
import React = require('react');
import Checkbox = require('../commons/Checkbox');
var DOM = React.DOM;
var LIMIT = 12;

interface Props {
  onSelection: (string, boolean) => void,
  onUnselection: (string, boolean) => void,
  selections: Array<string>,
  unselections: Array<string>
}

class Component extends React.Component<Props, any> {
  handleSelection(value) {
    return function () {
      this.props.onSelection(value);
    }.bind(this);
  }
  handleUnselection(value) {
    return function () {
      this.props.onUnselection(value);
    }.bind(this);
  }
  render() {
    var selections = this.props.selections.slice(0, LIMIT).map(function (option) {
      return DOM.div({className: 'col col-sm-4 col-xs-6'}, [
        Checkbox({onChange: this.handleSelection(option), value: option, checked: true})
      ]);
    }.bind(this));
    var limit = this.props.selections.length > LIMIT ? 0 : LIMIT - this.props.selections.length;
    var unselections = this.props.unselections.slice(0, limit).map(function (option) {
      return DOM.div({className: 'col col-sm-4 col-xs-6'}, [
        Checkbox({onChange: this.handleUnselection(option), value: option, checked: false})
      ]);
    }.bind(this));
    var boxes = selections.concat(unselections);
    var view = boxes.length > 0 ? boxes : 'No data.';

    return DOM.div({className: 'row ' + (boxes.length > 0 ? 'text-left': 'text-center')}, view);
  }
}

export = React.createFactory(Component);
