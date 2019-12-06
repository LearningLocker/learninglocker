import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  modelsByFilterSelector,
  isLoadingSelector,
  hasMoreSelector,
  shouldFetchSelector
} from 'ui/redux/selectors';
import {
  fetchModels,
  fetchAllOutstandingModels,
  fetchMore,
  addModel,
  deleteModel,
  updateModel,
  saveModel,
} from 'ui/redux/actions';
import areEqualProps from './areEqualProps';

export default (WrappedComponent) => {
  class WithModels extends Component {
    componentDidMount = () => this.fetchModels(this.props);

    shouldComponentUpdate = nextProps => !areEqualProps(this.props, nextProps);

    componentDidUpdate = () => {
      if (this.props.shouldFetch) {
        this.fetchModels(this.props);
      }
    }

    fetchModels = ({ schema, filter, sort, first }) => {
      if (filter) {
        this.props.fetchAllOutstandingModels({ schema, filter, sort, first })
          .catch((err) => {
            console.error(err);
          });
      }
    }
    addModel = (args) => {
      const { schema } = this.props;
      return this.props.addModel({ ...args, schema });
    }
    saveModel = ({ attrs }) => {
      const { schema, id } = this.props;
      return this.props.saveModel({ schema, id, props: attrs });
    }
    updateModel = ({ path, value }) => {
      const { schema, id } = this.props;
      return this.props.updateModel({ schema, id, path, value });
    }
    deleteModel = ({ id }) => {
      const { schema } = this.props;
      return this.props.deleteModel({ schema, id });
    }
    fetchMore = (args) => {
      const { schema, filter, sort, first } = this.props;
      return this.props.fetchMore({ schema, filter, sort, first, ...args });
    }
    render = () =>
      (<WrappedComponent
        {...this.props}
        fetchMore={this.fetchMore}
        addModel={this.addModel}
        deleteModel={this.deleteModel}
        updateModel={this.updateModel} />
      )
  }
  return connect((state, { schema, filter, sort, cursor }) => (
    {
      models: modelsByFilterSelector(schema, filter, sort)(state),
      isLoading: isLoadingSelector({ schema, filter, sort, cursor })(state),
      shouldFetch: shouldFetchSelector({ schema, filter, sort, cursor })(state),
      hasMore: hasMoreSelector(schema, filter, sort)(state)
    }
  ), { fetchModels, fetchMore, addModel, deleteModel, updateModel, saveModel, fetchAllOutstandingModels })(WithModels);
};
