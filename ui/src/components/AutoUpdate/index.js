import React, { Component, PropTypes } from 'react';

export default class AutoUpdate extends Component {
  static propTypes = {
    interval: PropTypes.number,
    children: PropTypes.node
  }
  static defaultProps = {
    interval: 5000
  }

  componentDidMount = () => {
    this.ticker = setInterval(this.invalidate, this.props.interval);
  }

  componentWillUnmount = () => {
    if (this.ticker) clearInterval(this.ticker);
  }

  invalidate = () => {
    this.forceUpdate();
  }

  render = () => <span>{this.props.children}</span>
}
