import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { updateModel } from 'ui/redux/modules/models';
import CountEditor from './CountEditor';
import GroupEditor from './GroupEditor';
import BaseAxesEditor from './BaseAxesEditor';


export class PieAxesEditor extends BaseAxesEditor {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func
  };

  render = () => (
    <div>
      <div className="form-group">
        <label htmlFor="toggleInput" className="clearfix">Group by</label>
        <GroupEditor
          group={this.getAxesValue('group')}
          changeGroup={this.changeAxes.bind(this, 'group')} />
      </div>
      <div className="form-group">
        <label htmlFor="toggleInput" className="clearfix">Count</label>
        <CountEditor
          type={this.props.model.get('type')}
          value={this.getAxesValue('value')}
          operator={this.getAxesValue('operator')}
          changeValue={this.changeAxes.bind(this, 'value')}
          changeOperator={this.changeAxes.bind(this, 'operator')} />
      </div>
    </div>
  );
}

export default connect(() => ({}), { updateModel })(PieAxesEditor);
