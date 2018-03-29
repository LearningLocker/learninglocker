import React, { Component, PropTypes } from 'react';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import { compose, withProps } from 'recompose';
import {
  visualisationResultsSelector,
  visualisationShouldFetchSelector,
  visualisationFetchStateSelector,
  fetchVisualisation
} from 'ui/redux/modules/visualise';
import { unflattenAxes } from 'lib/helpers/visualisation';
import { IN_PROGRESS, VISUALISATION_COLORS } from 'ui/utils/constants';
import { getFormattedResults } from 'ui/utils/visualisationResults';
import withModel from 'ui/utils/hocs/withModel';
import Spinner from 'ui/components/Spinner';

const withStatementsVisualisation = (WrappedComponent) => {
  class WithStatementsVisualisation extends Component {
    static propTypes = {
      id: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
      schema: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
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

    componentDidMount = () => {
      this.fetchIfRequired(this.props);
    }

    componentWillReceiveProps = (nextProps) => {
      this.fetchIfRequired(nextProps);
    }

    shouldComponentUpdate = ({ results, model, fetchState }) => !(
      this.props.results.equals(results) &&
      this.props.model.equals(model) &&
      this.props.fetchState === fetchState
    );

    fetchIfRequired = (props) => {
      if (props.shouldFetch) {
        props.fetchVisualisation(props.id);
      }
    }

    isLoading = () => this.props.fetchState === IN_PROGRESS || !this.props.fetchState;

    renderPreview = () => (
      <WrappedComponent model={this.props.model} results={this.props.results} />
    );

    renderSpinner = () => (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
        }}>

        <Spinner />
      </div>
    )

    render = () => (
      <div style={{ height: '100%' }}>
        {this.isLoading() ? this.renderSpinner() : this.renderPreview()}
      </div>
    );
  }
  return connect((state, { id }) => ({
    results: visualisationResultsSelector(id)(state),
    shouldFetch: visualisationShouldFetchSelector(id)(state),
    fetchState: visualisationFetchStateSelector(id)(state)
  }),
    { fetchVisualisation })(WithStatementsVisualisation);
};

export default compose(
  withProps(() => ({
    schema: 'visualisation',
  })),
  withModel,
  withStatementsVisualisation,
);
