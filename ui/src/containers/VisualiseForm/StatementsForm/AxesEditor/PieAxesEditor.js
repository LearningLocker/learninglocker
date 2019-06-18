import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { VISUALISE_AXES_PREFIX } from 'lib/constants/visualise';
import { updateModel } from 'ui/redux/modules/models';
import DefinitionTypeSelector from './DefinitionTypeSelector';
import CountEditor from './CountEditor';
import GroupEditor from './GroupEditor';
import BaseAxesEditor from './BaseAxesEditor';


export class PieAxesEditor extends BaseAxesEditor {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func
  };

  shouldComponentUpdate = (nextProps) => {
    const prevAxes = this.props.model.filter((item, key) => key.startsWith(VISUALISE_AXES_PREFIX));
    const nextAxes = nextProps.model.filter((item, key) => key.startsWith(VISUALISE_AXES_PREFIX));

    return !prevAxes.equals(nextAxes);
  };

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
