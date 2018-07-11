import * as React from 'react';
import DebounceInput from 'react-debounce-input';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { updateModel } from 'ui/redux/modules/models';
import { LEADERBOARD } from 'ui/utils/constants';
import BaseAxesEditorHoc from './BaseAxesEditorHoc';
import CountEditor from './CountEditor';
import GroupEditor from './GroupEditor';

const renderBarAxes = (props) => {
  console.log('004', props.model);
  console.log('005 props.getAxesValue', props.getAxesValue('value'));
  return (<div>
    <div className="form-group">
      <label htmlFor="toggleInput" className="clearfix">X Axis</label>
      <div className="form-group">
        <DebounceInput
          id={'xAxisLabel'}
          className="form-control"
          placeholder={`${'x'.toUpperCase()}-Axis`}
          debounceTimeout={377}
          style={{ fontWeight: 'bold' }}
          value={props.getAxesValue('xLabel')}
          onChange={props.handleAxesChange.bind(null, 'xLabel')} />
      </div>
      <div className="form-group">
        <CountEditor
          type={/* props.model.get('type')*/ LEADERBOARD}
          value={props.getAxesValue('value')}
          operator={props.getAxesValue('operator')}
          changeValue={props.changeAxes.bind(null, 'value')}
          changeOperator={props.changeAxes.bind(null, 'operator')} />
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
          value={props.getAxesValue('yLabel')}
          onChange={props.handleAxesChange.bind(null, 'yLabel')} />
      </div>
      <div className="form-group">
        <GroupEditor
          group={props.getAxesValue('group')}
          changeGroup={props.changeAxes.bind(null, 'group')} />
      </div>
    </div>
  </div>);
};

const CompositeAxesEditor = props => renderBarAxes(props);

export default compose(
  connect(() => ({}), { updateModel }),
  BaseAxesEditorHoc
)(CompositeAxesEditor);
