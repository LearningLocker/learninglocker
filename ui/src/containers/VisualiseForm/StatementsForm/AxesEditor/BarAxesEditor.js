import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { VISUALISE_AXES_PREFIX } from 'lib/constants/visualise';
import { updateModel } from 'ui/redux/modules/models';
import DebounceInput from 'react-debounce-input';
import DefinitionTypeSelector from './DefinitionTypeSelector';
import CountEditor from './CountEditor';
import GroupEditor from './GroupEditor';
import BaseAxesEditor from './BaseAxesEditor';

export class BarAxesEditor extends BaseAxesEditor {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func
  };

  shouldComponentUpdate = (nextProps) => {
    const prevAxes = this.props.model.filter((_, key) => key.startsWith(VISUALISE_AXES_PREFIX));
    const nextAxes = nextProps.model.filter((_, key) => key.startsWith(VISUALISE_AXES_PREFIX));

    return !prevAxes.equals(nextAxes);
  };

  render = () => (
    <div>
      <div className="form-group">
        <label htmlFor="toggleInput" className="clearfix">X Axis</label>
        <div className="form-group">
          <DebounceInput
            id={'xAxisLabel'}
            className="form-control"
            placeholder={this.props.model.getIn(['axesvalue', 'searchString'], 'X-Axis')}
            debounceTimeout={377}
            style={{ fontWeight: 'bold' }}
            value={this.props.model.get('axesxLabel')}
            onChange={this.handleAxesChange.bind(this, 'xLabel')} />
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
        <label htmlFor="toggleInput" className="clearfix">Y Axis</label>
        <div className="form-group">
          <DebounceInput
            id={'yAxisLabel'}
            className="form-control"
            placeholder={this.props.model.getIn(['axesgroup', 'searchString'], 'Y-Axis')}
            debounceTimeout={377}
            style={{ fontWeight: 'bold' }}
            value={this.props.model.get('axesyLabel')}
            onChange={this.handleAxesChange.bind(this, 'yLabel')} />
        </div>
        <div className="form-group">
          <GroupEditor
            group={this.getAxesValue('group')}
            changeGroup={this.changeAxes.bind(this, 'group')} />
        </div>
      </div>

      <DefinitionTypeSelector
        visualisationModel={this.props.model}
        group={this.getAxesValue('group')}
        onChangeGroup={g => this.changeAxes('group', g)} />
    </div>
  );
}

export default connect(() => ({}), { updateModel })(BarAxesEditor);
