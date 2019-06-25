import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { updateModel } from 'ui/redux/modules/models';
import CountEditor from './CountEditor';
import BaseAxesEditor from './BaseAxesEditor';

export class CounterAxesEditor extends BaseAxesEditor {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func
  };

  render = () => (
    <div className="form-group">
      <label htmlFor="toggleInput" className="clearfix">Count</label>
      <CountEditor
        type={this.props.model.get('type')}
        value={this.getAxesValue('value')}
        operator={this.getAxesValue('operator')}
        changeValue={this.changeAxes.bind(this, 'value')}
        changeOperator={this.changeAxes.bind(this, 'operator')} />
    </div>
  );
}

export default connect(() => ({}), { updateModel })(CounterAxesEditor);
