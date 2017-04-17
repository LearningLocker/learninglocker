/// <reference path="../definitions/references.d.ts" />
import React = require('react');
import Searchbox = require('../commons/Searchbox');
import CheckboxGroup = require('../commons/CheckboxGroup');
import Button = require('../commons/Button');
var DOM = React.DOM;

interface Props {
  service: any,
  match: any,
  selections: Array<string>,
  onSelectionChange: (Array<string>) => void
}

interface State {
  search: string,
  selections: Array<string>,
  unselections: Array<string>
}

class Component extends React.Component<Props, State> {
  state = {
    selections: [],
    unselections: [],
    search: ''
  };
  handleSearchChange(value) {
    this.setState({search: value});
    this.handleUpdate()
  }
  handleSelectAll() {
    this.setState({selections: this.state.selections.concat(this.state.unselections), unselections: []});
  }
  handleUnselectAll() {
    this.setState({unselections: this.state.selections.concat(this.state.unselections), selections: []});
  }
  handleSelection(value) {
    var unselections = this.state.unselections.concat([value]);
    var selections = this.removeArrIndex(this.state.selections, this.state.selections.indexOf(value));
    this.setState({selections: selections, unselections: unselections});
  }
  handleUnselection(value) {
    var selections = this.state.selections.concat([value]);
    var unselections = this.removeArrIndex(this.state.unselections, this.state.unselections.indexOf(value));
    this.setState({selections: selections, unselections: unselections});
  }
  removeArrIndex(arr, index) {
    var before = arr.slice(0, index);
    var after = arr.slice(index + 1);
    return before.concat(after);
  }
  handleDataChange() {
    var data = this.props.service.getResult().map(function (verb) {
      var name = '';
      var languages = Object.keys(verb.display || {});

      if (languages.length > 0) {
        name = verb.display[languages[0]];
      }

      return (name || 'Unknown') + ' (' + verb._id + ')';
    });
    var selections = this.props.selections.filter(function (selection) {
      return selection.indexOf(this.state.search) !== -1;
    }.bind(this));

    this.setState({unselections: data, selections: selections});
  }
  handleUpdate() {
    try {
      this.props.service.update(this.props.match, this.state.search);
    } catch (ex) {
      console.error(ex); // Provides a stack trace.
      alert(ex); // Provides a message to the user.
    }
  }
  componentDidMount() {
    this.props.service.addChangeListener(this.handleDataChange.bind(this));
    this.handleUpdate();
  }
  componentWillUnmount() {
    this.props.service.removeChangeListener(this.handleDataChange.bind(this));
  }
  render() {
    return DOM.div({}, [
      DOM.div({className: 'input-group'}, [
        DOM.div({className: 'input-group-addon'}, [
          Searchbox({onChange: this.handleSearchChange.bind(this), value: this.state.search})
        ]),
        DOM.div({className: 'btn-group input-group-addon'}, [
          Button({onClick: this.handleSelectAll.bind(this), icon: '', text: 'Select all'}),
          Button({onClick: this.handleUnselectAll.bind(this), icon: '', text: 'Unselect all'})
        ])
      ]),
      CheckboxGroup({
        onSelection: this.handleSelection.bind(this),
        onUnselection: this.handleUnselection.bind(this),
        selections: this.state.selections,
        unselections: this.state.unselections
      })
    ]);
  }
}

export = React.createFactory(Component);
