import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { updateModel } from 'ui/redux/modules/models';
import DebounceInput from 'react-debounce-input';
import CountEditor from './CountEditor';
import BaseAxesEditor from './BaseAxesEditor';
import { getLegend } from 'ui/utils/defaultTitles';

export class LineAxesEditor extends BaseAxesEditor {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func
  };

  render = () => (
    <div>
      <div className="form-group">
        <label htmlFor="toggleInput" className="clearfix">Y Axis</label>
        <div className="form-group">
          <div className="form-group">
            <DebounceInput
              id={'yAxisLabel'}
              className="form-control"
              placeholder={getLegend('y', this.props)}
              debounceTimeout={377}
              style={{ fontWeight: 'bold' }}
              value={getLegend('y', this.props)}
              onChange={this.handleAxesChange.bind(this, 'yLabel')} />
          </div>
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
      <div className="form-group">
        <label htmlFor="toggleInput" className="clearfix">X Axis</label>
        <div className="form-group">
          <DebounceInput
            id={'xAxisLabel'}
            className="form-control"
            placeholder={getLegend('x', this.props)}
            debounceTimeout={377}
            style={{ fontWeight: 'bold' }}
            value={getLegend('x', this.props)}
            onChange={this.handleAxesChange.bind(this, 'xLabel')} />
        </div>
      </div>
    </div>
  );
}

export default connect(() => ({}), { updateModel })(LineAxesEditor);
