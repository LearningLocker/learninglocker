import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import Switch from 'ui/components/Material/Switch';
import { updateModel } from 'ui/redux/modules/models';
import VisualiseFilterForm from 'ui/containers/VisualiseFilterForm';
import { STACKABLE_TYPES } from 'ui/utils/constants';

class SeriesEditor extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func
  }

  shouldComponentUpdate = nextProps => !(
    this.props.model.equals(nextProps.model)
  )

  onAddQuery = () => {
    this.props.updateModel({
      schema: 'visualisation',
      id: this.props.model.get('_id'),
      path: 'filters',
      value: this.props.model.get('filters').push(new Map()),
    });
  }

  getStacked = () => this.props.model.get('stacked', true)

  onChangeStackToggle = () => {
    this.props.updateModel({
      schema: 'visualisation',
      id: this.props.model.get('_id'),
      path: 'stacked',
      value: !this.getStacked(),
    });
  }

  canStack = type => STACKABLE_TYPES.includes(type)

  canAddSeries = (type, filters) =>
    filters.count() < 5 &&
    !['STATEMENT', 'COUNTER'].includes(type)

  renderStackToggle = () => (
    <div className="form-group">
      <label htmlFor="toggleInput">
        Stacked/Grouped
      </label>

      <div id="toggleInput">
        <Switch
          checked={!this.getStacked()}
          onChange={this.onChangeStackToggle} />
      </div>
    </div>
  )

  renderAddQueryButton = () => (
    <div className="form-group">
      <button
        className="btn btn-primary btn-sm"
        onClick={this.onAddQuery}>
        <i className="ion ion-plus" />
        Add query
      </button>
    </div>
  )

  render = () => {
    const { model } = this.props;

    return (
      <div>
        {
          this.canAddSeries(model.get('type'), model.get('filters')) &&
          this.renderAddQueryButton()
        }

        {
          this.canStack(model.get('type')) &&
          this.renderStackToggle()
        }
        <VisualiseFilterForm model={model} />
      </div>
    );
  }
}

export default connect(() => ({}), { updateModel })(SeriesEditor);
