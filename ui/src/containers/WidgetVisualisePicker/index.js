import { Map, fromJS } from 'immutable';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Portal from 'react-portal';
import { withProps, compose } from 'recompose';
import { createDefaultTitleWithIcon, createDefaultTitle } from 'ui/utils/defaultTitles';
import ModelAutoComplete from 'ui/containers/ModelAutoComplete';
import uuid from 'uuid';
import { withModels } from 'ui/utils/hocs';

const schema = 'visualisation';

class WidgetVisualisePicker extends Component {
  static propTypes = {
    isOpened: PropTypes.bool,
    onClickClose: PropTypes.func,
    onChangeTitle: PropTypes.func,
    onChangeVisualisation: PropTypes.func
  };

  static defaultProps = {
    isOpened: false,
    model: new Map()
  };

  getTitle = (props, defaultValue) => props.model.getIn(['title'], defaultValue);

  getVisualisationId = () => this.props.model.get('visualisation')

  onClickVisualisation = (visualisation) => {
    if (!visualisation) {
      return this.props.onChangeVisualisation(
        null,
        (this.props.model.get('title') || 'No visualisation')
      );
    }
    const out = this.props.onChangeVisualisation(
      visualisation.get('_id'),
      (visualisation.get('description', ''))
    );
    return out;
  }

  onChangeTitle = e => this.props.onChangeTitle(e.target.value);

  onClickClose = (e) => {
    e.preventDefault();
    this.props.onClickClose();
  };

  searchStringToFilter = (searchString) => {
    switch (searchString) {
      case '':
        return new Map();
      default:
        return fromJS({ description: { $regex: searchString, $options: 'i' } });
    }
  };

  renderTitle = () => {
    const htmlFor = uuid.v4();
    return (
      <div className="form-group" style={{ width: '100%' }}>
        <label htmlFor={htmlFor} className="clearfix">Widget Title</label>
        <input
          id={htmlFor}
          className="form-control"
          placeholder={'Title'}
          value={this.getTitle(this.props, 'Title')}
          onChange={this.onChangeTitle} />
      </div>
    );
  };

  renderVisualisations = () => {
    const htmlFor = uuid.v4();
    return (
      <div className="form-group" style={{ width: '100%' }}>
        <label htmlFor={htmlFor} className="clearfix">Visualisation</label>
        <div id={htmlFor}>
          <ModelAutoComplete
            schema={schema}
            id={this.getVisualisationId()}
            displayCount={3}
            parseOption={model => createDefaultTitleWithIcon(model)}
            parseOptionString={model => model.get('description') || createDefaultTitle(model)}
            parseOptionTooltip={model => model.get('description') || createDefaultTitle(model)}
            onChange={this.onClickVisualisation}
            searchStringToFilter={this.searchStringToFilter}
            canEdit={() => false}
            fields={['description']} />
        </div>
      </div>
    );
  };

  render = () => {
    const { isOpened } = this.props;
    return (
      <Portal isOpened={isOpened}>
        <span>
          <div className="modal animated fast fadeIn">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header modal-header-bg">
                  <button
                    type="button"
                    className="close"
                    aria-label="Close"
                    onClick={this.onClickClose}>
                    <span aria-hidden="true">×</span>
                  </button>
                  <h4 className="modal-title">Edit Widget</h4>
                </div>
                <div
                  className="modal-body clearfix"
                  style={{
                    maxHeight: '500px',
                    overflow: 'visible',
                    padding: '20px',
                    minWidth: '350px'
                  }}>
                  {this.renderTitle()}
                  {this.renderVisualisations()}
                </div>
              </div>
            </div>
            <div className="modal-backdrop" onClick={this.onClickClose} />
          </div>
        </span>
      </Portal>
    );
  };
}

export default compose(withProps({ schema }), withModels)(
  WidgetVisualisePicker
);
