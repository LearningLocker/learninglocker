import React, { Component } from 'react';
import Promise from 'bluebird';

Promise.config({ cancellation: true });

export default ({ loader, preview = null }) => class asyncComponent extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount = () => {
    this.blueBirdLoader = Promise.resolve(loader);
    this.blueBirdLoader.then((loadedComponent) => {
      this.setState({ component: loadedComponent.default || loadedComponent });
    });
  }

  componentWillUnmount() {
    this.blueBirdLoader.cancel();
  }

  render = () => {
    if (this.state.component) {
      return <this.state.component {...this.props} />;
    }
    return preview;
  }
};
