import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  pollWhile
} from 'ui/redux/actions';

export default (WrappedComponent) => {
  class WithPolling extends Component {
    componentDidMount = () => {
      this.pollWhile(this.props);
    };

    componentDidUpdate = () => {
      this.pollWhile(this.props);
    };

    pollWhile = ({ schema, id, doWhile }) => {
      if (doWhile) {
        this.props.pollWhile({ schema, id, doWhile });
      }
    };

    render = () => (
      <WrappedComponent {...this.props} />
    )
  }
  return connect(() => ({}), { pollWhile })(WithPolling);
};
