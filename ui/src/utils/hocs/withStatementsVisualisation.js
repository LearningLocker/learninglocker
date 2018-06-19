import React, { Component, PropTypes } from 'react';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import {
  visualisationResultsSelector,
  visualisationShouldFetchSelector,
  visualisationFetchStateSelector,
  fetchVisualisation
} from 'ui/redux/modules/visualise';
import { IN_PROGRESS } from 'ui/utils/constants';
import Spinner from 'ui/components/Spinner';

export default (WrappedComponent) => {
  class WithStatementsVisualisation extends Component {
    static propTypes = {
      model: PropTypes.instanceOf(Map),
      results: PropTypes.instanceOf(List),
      shouldFetch: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
      fetchState: PropTypes.string,
      fetchVisualisation: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
    }

    static defaultProps = {
      model: new Map(),
      results: new List(),
      shouldFetch: false,
      fetchState: IN_PROGRESS,
    }

    componentDidMount() {
      this.fetchIfRequired(this.props);
    }

    componentWillReceiveProps(nextProps) {
      this.fetchIfRequired(nextProps);
    }

    shouldComponentUpdate({ results, model, fetchState }) {
      return !(
        this.props.results.equals(results) &&
        this.props.model.equals(model) &&
        this.props.fetchState === fetchState
      );
    }

    fetchIfRequired(props) {
      if (props.shouldFetch) {
        const id = props.model.get('_id');
        props.fetchVisualisation(id);
      }
    }

    renderPreview() {
      const model = this.props.model;
      const results = this.props.results.toJS();
      return <WrappedComponent model={model} results={results} />;
    }

    renderSpinner() {
      return (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
          <Spinner />
        </div>
      );
    }

    render() {
      const isLoading = this.props.fetchState === IN_PROGRESS || !this.props.fetchState;
      return (
        <div style={{ height: '100%' }}>
          {isLoading ? this.renderSpinner() : this.renderPreview()}
        </div>
      );
    }
  }
  return connect((state, { model }) => {
    const id = model.get('_id');
    return {
      results: visualisationResultsSelector(id)(state),
      shouldFetch: visualisationShouldFetchSelector(id)(state),
      fetchState: visualisationFetchStateSelector(id)(state),
    };
  }, { fetchVisualisation })(WithStatementsVisualisation);
};
