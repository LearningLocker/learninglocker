import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { updateModel } from 'ui/redux/modules/models';
import DebounceInput from 'react-debounce-input';
import CountEditor from './CountEditor';
import GroupEditor from './GroupEditor';
import BaseAxesEditor from './BaseAxesEditor';

class ColumnAxesEditor extends BaseAxesEditor {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func,
    groupOptions: PropTypes.instanceOf(Map)
  };

  render = () => (
    <div>
      <div className="form-group">
        <label htmlFor="toggleInput" className="clearfix">X Axis</label>
        <div className="form-group">
          <DebounceInput
            id={'xAxisLabel'}
            className="form-control"
            placeholder={`${'x'.toUpperCase()}-Axis`}
            debounceTimeout={377}
            style={{ fontWeight: 'bold' }}
            value={this.getAxesValue('xLabel')}
            onChange={this.handleAxesChange.bind(this, 'xLabel')} />
        </div>
        <div className="form-group">
          <GroupEditor
            group={this.getAxesValue('group')}
            changeGroup={this.changeAxes.bind(this, 'group')}
            groupOptions={this.props.groupOptions} />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="toggleInput" className="clearfix">Y Axis</label>
        <div className="form-group">
          <DebounceInput
            id={'yAxisLabel'}
            className="form-control"
            placeholder={`${'y'.toUpperCase()}-Axis`}
            debounceTimeout={377}
            style={{ fontWeight: 'bold' }}
            value={this.getAxesValue('yLabel')}
            onChange={this.handleAxesChange.bind(this, 'yLabel')} />
        </div>
        <div className="form-group">
          <CountEditor
            type={this.props.model.get('type')}
            value={this.getAxesValue('value')}
            operator={this.getAxesValue('operator')}
            changeValue={this.changeAxes.bind(this, 'value')}
            changeOperator={this.changeAxes.bind(this, 'operator')} />
        </div>
      </div>
    </div>
  );
}

export default connect(() => ({}), { updateModel })(ColumnAxesEditor);
