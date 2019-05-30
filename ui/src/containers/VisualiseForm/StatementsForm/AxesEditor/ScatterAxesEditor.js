import React from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import { VISUALISE_AXES_PREFIX } from 'lib/constants/visualise';
import { updateModel } from 'ui/redux/modules/models';
import DebounceInput from 'react-debounce-input';
import DefinitionTypeSelector from './DefinitionTypeSelector';
import GroupEditor from './GroupEditor';
import CountEditor from './CountEditor';
import QueryEditor from './QueryEditor';
import BaseAxesEditor from './BaseAxesEditor';

export class ScatterAxesEditor extends BaseAxesEditor {
  static propTypes = {
    model: PropTypes.instanceOf(Map), // visualisation
    orgTimezone: PropTypes.string.isRequired,
    updateModel: PropTypes.func
  };

  shouldComponentUpdate = (nextProps) => {
    const prevAxes = this.props.model.filter((item, key) => key.startsWith(VISUALISE_AXES_PREFIX));
    const nextAxes = nextProps.model.filter((item, key) => key.startsWith(VISUALISE_AXES_PREFIX));

    return !prevAxes.equals(nextAxes);
  };

  handleAxesChange = (key, event) => {
    this.changeAxes(key, event.target.value);
  };

  getAxisDefault = (axis, model) => {
    const labelString = axis === 'x' ? model.axesxLabel : model.axesyLabel;
    const defaultLabel = axis === 'x' ? model.getIn(['axesxValue', 'searchString'], 'X-Axis') : model.getIn(['axesyValue', 'searchString'], 'Y-Axis');
    if (labelString && labelString.length) {
      return labelString;
    }
    return defaultLabel;
  };

  renderAxis = axis => (
    <div>
      <div className="form-group">
        <DebounceInput
          id={`${axis}AxisLabel`}
          className="form-control"
          placeholder={this.getAxisDefault(axis, this.props.model)}
          debounceTimeout={377}
          style={{ fontWeight: 'bold' }}
          value={this.getAxesValue(`${axis}Label`, '')}
          onChange={this.handleAxesChange.bind(this, `${axis}Label`)} />
      </div>

      <div className="form-group">
        <CountEditor
          type={this.props.model.get('type')}
          value={this.getAxesValue(`${axis}Value`)}
          operator={this.getAxesValue(`${axis}Operator`)}
          changeValue={this.changeAxes.bind(this, `${axis}Value`)}
          changeOperator={this.changeAxes.bind(this, `${axis}Operator`)} />
      </div>
      <div className="form-group">
        <QueryEditor
          timezone={this.props.model.get('timezone', null)}
          orgTimezone={this.props.orgTimezone}
          query={this.getAxesValue(`${axis}Query`)}
          changeQuery={this.changeAxes.bind(this, `${axis}Query`)}
          componentPath={new List(['visualise', this.props.model.get('_id'), axis])} />
      </div>
    </div>
  );

  render = () => (
    <div>
      <div className="form-group">
        <label htmlFor="toggleInput" className="clearfix">Group by</label>
        <GroupEditor
          group={this.getAxesValue('group')}
          changeGroup={this.changeAxes.bind(this, 'group')} />
      </div>

      <DefinitionTypeSelector
        visualisationModel={this.props.model}
        group={this.getAxesValue('group')}
        onChangeGroup={g => this.changeAxes('group', g)} />

      <hr />
      {this.renderAxis('x')}
      <hr />
      {this.renderAxis('y')}
    </div>
  );
}

export default connect(() => ({}), { updateModel })(ScatterAxesEditor);
