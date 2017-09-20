import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import Switch from 'ui/components/Material/Switch';
import { updateModel } from 'ui/redux/modules/models';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import VisualiseFilterForm from 'ui/containers/VisualiseFilterForm';
import { STACKED_TYPES } from 'ui/utils/constants';
import styles from '../visualiseform.css';

class SeriesEditor extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func
  }

  state = {
    openModalStep: null,
  }

  shouldComponentUpdate = nextProps => !(
    this.props.model.equals(nextProps.model)
  )

  onAddQuery = () => {
    const { model } = this.props;
    const queries = model.get('filters');
    const modelId = model.get('_id');
    const newQueries = queries.push(new Map());
    this.props.updateModel({
      schema: 'visualisation',
      id: modelId,
      path: 'filters',
      value: newQueries
    });
  }

  getAttr = attr => defaultValue =>
    this.props.model.get(attr, defaultValue)

  getStacked = () =>
    this.getAttr('stacked')(true)

  onChangeAttr = attr => event =>
    this.changeAttr(attr)(event.target.value)

  getModelId = () =>
    this.props.model.get('_id')

  changeAttr = attr => newValue =>
    this.props.updateModel({
      schema: 'visualisation',
      id: this.getModelId(),
      path: attr,
      value: newValue
    })

  toggleStacked = () =>
    this.changeAttr('stacked')(!this.getStacked())

  canStack = type =>
    STACKED_TYPES.indexOf(type) !== -1

  canAddSeries = () => filters => filters.count() < 5

  renderStackToggle = () => (
    <div className="form-group">
      <label htmlFor="toggleInput">Stacked/Grouped</label>
      <div id="toggleInput">
        <Switch
          checked={!this.getStacked()}
          onChange={this.toggleStacked} />
      </div>
    </div>
  )

  renderSeriesAdder = () => (
    <div className="form-group">
      <button
        className="btn btn-primary btn-sm"
        onClick={this.onAddQuery}>
        <i className="ion ion-plus" /> Add query
      </button>
    </div>
  )

  render = () => {
    const { model } = this.props;

    return (
      <div>
        {
          this.canAddSeries(model.get('type'))(model.get('filters')) &&
          this.renderSeriesAdder()
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

export default withStyles(styles)(connect(() => ({}), { updateModel })(SeriesEditor));
