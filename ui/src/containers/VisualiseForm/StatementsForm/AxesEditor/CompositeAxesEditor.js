import * as React from 'react';
import DebounceInput from 'react-debounce-input';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { updateModel } from 'ui/redux/modules/models';
import { LEADERBOARD } from 'ui/utils/constants';
import BaseAxesEditorHoc from './BaseAxesEditorHoc';
import CountEditor from './CountEditor';
import GroupEditor from './GroupEditor';

const renderBarAxes = props => (<div>
  <div className="form-group">
    <label htmlFor="xAxisLabel" className="clearfix">X Axis</label>
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
    <label htmlFor="yAxisLabel" className="clearfix">Y Axis</label>
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

  <div className="form-group">
    <label htmlFor="xTopAxesLabel" className="clearfix">Top X Axis</label>
    <div className="form-group">
      <DebounceInput
        id="xTopAxesLabel"
        className="form-control"
        placeholder="X-Top-Axis"
        debounceTimeout={377}
        style={{ fontWeight: 'bold' }}
        value={props.getAxesValue('xTopLabel')}
        onChange={props.handleAxesChange.bind(null, 'xTopLabel')} />
    </div>
  </div>
  <div className="form-group">
    <label htmlFor="yRightAxesLabel" className="clearfix">Right Y Axis</label>
    <div className="form-group">
      <DebounceInput
        id="yRightAxesLabel"
        className="form-control"
        placeholder="Y-Right-Axis"
        debounceTimeout={377}
        style={{ fontWeight: 'bold' }}
        value={props.getAxesValue('yRightLabel')}
        onChange={props.handleAxesChange.bind(null, 'yRightLabel')} />
    </div>
    <div className="form-group">
      <CountEditor
        type={LEADERBOARD}
        className="form-control"
        value={props.getAxesValue('yRightValue')}
        operator={props.getAxesValue('yRightOperator')}
        changeValue={props.changeAxes.bind(null, 'yRightValue')}
        changeOperator={props.changeAxes.bind(null, 'yRightOperators')} />
    </div>
  </div>

</div>);

const CompositeAxesEditor = props => renderBarAxes(props);

export default compose(
  connect(() => ({}), { updateModel }),
  BaseAxesEditorHoc
)(CompositeAxesEditor);
