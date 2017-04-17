/// <reference path="../definitions/references.d.ts" />
import React = require('react');
import Textbox = require('../commons/Textbox');
import Repo = require('../commons/AggregationRepo');
import Graph = require('./Graph');
import Service = require('./Service');
var DOM = React.DOM;

interface State {
  endpoint: string,
  username: string,
  password: string,
  match: string
}

class Component extends React.Component<any, State> {
  state = {
    endpoint: 'http://demo.learninglocker.net',
    username: 'd416e6220812740d3922eb09813ebb4163e8eb3e',
    password: 'bc7e0a2edd5d1969b6d774e679d4eb4e7a35be13',
    match: JSON.stringify({})
  };
  handleEndpointChange(value: string) {
    this.state.endpoint = value;
    this.setState(this.state);
  }
  handleUsernameChange(value: string) {
    this.state.username = value;
    this.setState(this.state);
  }
  handlePasswordChange(value: string) {
    this.state.password = value;
    this.setState(this.state);
  }
  handleMatchChange(value: string) {
    this.state.match = value;
    this.setState(this.state);
  }
  render() {
    var repo = new Repo(this.state.endpoint, this.state.username, this.state.password);
    var service = new Service(repo);

    return DOM.div({}, [
      DOM.form({}, [
        Textbox({onChange: this.handleEndpointChange.bind(this), label: 'LL Endpoint', placeholder: 'http://demo.learninglocker.net', value: this.state.endpoint}),
        Textbox({onChange: this.handleUsernameChange.bind(this), label: 'Client Username', placeholder: 'Your client\'s username', value: this.state.username}),
        Textbox({onChange: this.handlePasswordChange.bind(this), label: 'Client Password', placeholder: 'Your client\'s password', value: this.state.password}),
        Textbox({onChange: this.handleMatchChange.bind(this), label: 'Match', placeholder: 'Your MongoAggregationMatch pipe', value: this.state.match}),
      ]),
      Graph({service: service, match: this.state.match})
    ]);
  }
}

export = React.createFactory(Component);
