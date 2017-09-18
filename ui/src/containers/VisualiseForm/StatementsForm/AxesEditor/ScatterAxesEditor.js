import React, { PropTypes } from 'react';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import { updateModel } from 'ui/redux/modules/models';
import DebounceInput from 'react-debounce-input';
import GroupEditor from './GroupEditor';
import CountEditor from './CountEditor';
import QueryEditor from './QueryEditor';
import BaseAxesEditor from './BaseAxesEditor';

export class ScatterAxesEditor extends BaseAxesEditor {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func
  };

  handleAxesChange = (key, event) => {
    this.changeAxes(key, event.target.value);
  };

  renderAxis = axis => (
    <div>
      <div className="form-group">
        <DebounceInput
          id={`${axis}AxisLabel`}
          className="form-control"
          placeholder={`${axis.toUpperCase()}-Axis`}
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
          query={this.getAxesValue(`${axis}Query`)}
          changeQuery={this.changeAxes.bind(this, `${axis}Query`)}
          componentPath={
            new List(['visualise', this.props.model.get('_id'), axis])
          } />
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
      <hr />
      {this.renderAxis('x')}
      <hr />
      {this.renderAxis('y')}
    </div>
  );
}

export default connect(() => ({}), { updateModel })(ScatterAxesEditor);
