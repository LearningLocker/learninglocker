import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  modelsSchemaIdSelector,
  isLoadingModelSelector
} from 'ui/redux/selectors';
import {
  fetchModel,
  saveModel,
  updateModel,
  deleteModel,
  pollWhile
} from 'ui/redux/actions';
import {
  getMetadataSelector,
  setInMetadata,
  deleteInMetadata,
} from 'ui/redux/modules/metadata';

export default (WrappedComponent) => {
  class WithModel extends Component {
    componentWillMount = () => {
      const { schema, id, doWhile } = this.props;
      this.fetchModel({ schema, id });
      this.pollWhile({ schema, id, doWhile });
    }
    componentWillReceiveProps = ({ schema, id, doWhile }) => {
      this.fetchModel({ schema, id });
      this.pollWhile({ schema, id, doWhile });
    }
    fetchModel = ({ schema, id }) => {
      this.props.fetchModel({ schema, id }).catch(err => console.error(schema, id, err.message));
    }
    pollWhile = ({ schema, id, doWhile }) => {
      if (doWhile) {
        this.props.pollWhile({ schema, id, doWhile });
      }
    }
    deleteModel = () => {
      const { schema, id } = this.props;
      return this.props.deleteModel({ schema, id });
    }
    saveModel = ({ attrs }) => {
      const { schema, id } = this.props;
      return this.props.saveModel({ schema, id, props: attrs });
    }
    updateModel = ({ path, value }) => {
      const { schema, id } = this.props;
      return this.props.updateModel({ schema, id, path, value });
    }
    setMetadata = (key, value) => {
      const { schema, id } = this.props;
      return this.props.setInMetadata({ schema, id, path: [key], value });
    }
    deleteMetadata = (key) => {
      const { schema, id } = this.props;
      return this.props.deleteInMetadata({ schema, id, path: [key] });
    }

    getMetadata = (key, defaultValue) =>
      this.props.metadata.get(key, defaultValue)

    hasMetadata = key =>
      this.props.metadata.has(key)

    render = () => (
      <WrappedComponent
        {...this.props}
        hasMetadata={this.hasMetadata}
        deleteMetadata={this.deleteMetadata}
        setMetadata={this.setMetadata}
        getMetadata={this.getMetadata}
        deleteModel={this.deleteModel}
        updateModel={this.updateModel}
        saveModel={this.saveModel} />
    )
  }
  return connect((state, { schema, id }) => ({
    metadata: getMetadataSelector({ schema, id })(state),
    model: modelsSchemaIdSelector(schema, id)(state),
    isLoadingModel: isLoadingModelSelector({ schema, id })(state)
  }), {
    fetchModel, updateModel, deleteModel, saveModel, pollWhile, setInMetadata, deleteInMetadata
  })(WithModel);
};
