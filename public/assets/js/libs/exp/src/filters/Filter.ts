/// <reference path="../definitions/references.d.ts" />
import React = require('react');
import AgentFilter = require('./AgentFilter');
import VerbFilter = require('./VerbFilter');
import ActivityFilter = require('./ActivityFilter');
import DateFilter = require('./DateFilter');
import OtherFilter = require('./OtherFilter');
import TabPicker = require('../commons/TabPicker');
import AgentService = require('./AgentService');
import VerbService = require('./VerbService');
import ActivityService = require('./ActivityService');
var DOM = React.DOM;

interface Props {
  repo: any
}

class Component extends React.Component<any, any> {
  state = {
    tab: 'Agent'
  }
  handleTabChange(value) {
    this.setState({tab: value});
  }
  render() {
    var filter: any = 'No filter available';

    switch (this.state.tab) {
      case 'Agent': filter = AgentFilter({onSelectionChange: function () {}, service: new AgentService(this.props.repo), match: {}, selections: []}); break;
      case 'Verb': filter = VerbFilter({onSelectionChange: function () {}, service: new VerbService(this.props.repo), match: {}, selections: []}); break;
      case 'Activity': filter = ActivityFilter({onSelectionChange: function () {}, service: new ActivityService(this.props.repo), match: {}, selections: []}); break;
      case 'Dates': filter = DateFilter({since: '', until: '', onSinceChange: function () {}, onUntilChange: function () {}}); break;
      case 'Other': filter = OtherFilter({onChange: function () {}, match: {}}); break;
    }

    return DOM.div({}, [
      TabPicker({onTabChange: this.handleTabChange.bind(this), value: this.state.tab, options: [
        'Agent', 'Verb', 'Activity', 'Dates', 'Other'
      ]}),
      filter
    ]);
  }
}

export = React.createFactory(Component);
