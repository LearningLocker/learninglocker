/// <reference path="../definitions/references.d.ts" />
import React = require('react');
import Textbox = require('../commons/Textbox');
import Repo = require('../commons/AggregationRepo');
import Filter = require('./Filter');
var DOM = React.DOM;

interface State {
  endpoint: string,
  username: string,
  password: string
}

class Component extends React.Component<any, State> {
  state = {
    endpoint: 'http://demo.learninglocker.net',
    username: 'd416e6220812740d3922eb09813ebb4163e8eb3e',
    password: 'bc7e0a2edd5d1969b6d774e679d4eb4e7a35be13'
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
  render() {
    var repo = new Repo(this.state.endpoint, this.state.username, this.state.password);
    return DOM.div({}, [
      DOM.form({}, [
        Textbox({className: '', onChange: this.handleEndpointChange.bind(this), label: 'LL Endpoint', placeholder: 'http://demo.learninglocker.net', value: this.state.endpoint}),
        Textbox({className: '', onChange: this.handleUsernameChange.bind(this), label: 'Client Username', placeholder: 'Your client\'s username', value: this.state.username}),
        Textbox({className: '', onChange: this.handlePasswordChange.bind(this), label: 'Client Password', placeholder: 'Your client\'s password', value: this.state.password}),
      ]),
      Filter({repo: repo})
    ]);
  }
}

export = React.createFactory(Component);
