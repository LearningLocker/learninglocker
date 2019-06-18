import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  countSelector,
  shouldFetchCountSelector,
  isLoadingCountSelector
} from 'ui/redux/selectors';
import {
  fetchModelsCount,
} from 'ui/redux/actions';

export default (WrappedComponent) => {
  class WithModelCount extends Component {
    componentDidMount = () => {
      this.fetchModelsCount(this.props);
    }
    componentDidUpdate = () => {
      const { schema, filter, shouldFetchCount } = this.props;
      if (shouldFetchCount) {
        this.fetchModelsCount({ schema, filter });
      }
    }
    fetchModelsCount = ({ schema, filter }) =>
      this.props.fetchModelsCount({ schema, filter })
        .catch(() => {})

    render = () => <WrappedComponent {...this.props} />
  }
  return connect((state, { schema, filter }) => ({
    shouldFetchCount: shouldFetchCountSelector(schema, filter)(state),
    modelCount: countSelector(schema, filter)(state),
    isLoadingCount: isLoadingCountSelector(schema, filter)(state)
  }), { fetchModelsCount })(WithModelCount);
};
