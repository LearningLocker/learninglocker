import React from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompose';
import { updateModel } from 'ui/redux/modules/models';
import Switch from 'ui/components/Material/Switch';
import { XVSY, FIVE, TEN, FIFTEEN, TWENTY, LEADERBOARD } from 'ui/utils/constants';

const XvsYOptionsEditorComponent = ({ model, trendLinesHandler }) => (<div>

  <Switch
    checked={model.get('trendLines')}
    label="Trend Lines"
    onChange={trendLinesHandler} />

</div>);

export const XvsYOptionsEditor = compose(
  connect(() => ({}), { updateModel }),
  withHandlers({
    trendLinesHandler: ({ updateModel: updateModelAction, model }) => (value) => {
      updateModelAction({
        schema: 'visualisation',
        id: model.get('_id'),
        path: 'trendLines',
        value
      });
    }
  })
)(XvsYOptionsEditorComponent);

const BarEditorComponent = ({ model, barChartGroupingLimitHandler }) => (
  <div>
    <select
      id={'brap'}
      className={'options-menu'}
      value={model.get('barChartGroupingLimit')}
      onChange={barChartGroupingLimitHandler}>
      <option value={FIVE}>Top 5</option>
      <option value={TEN}>Top 10</option>
      <option value={FIFTEEN}>Top 15</option>
      <option value={TWENTY}>Top 20</option>
    </select>
    <select className={"options-menu"}>
      <option value={'Length'}>Length of string</option>
      <option value={'Length2'}>Really long</option>
      <option value={'Length3'}>Unnecesarily and annoyingly long</option>
    </select>
  </div>
);

const BarEditor = compose(
  connect(() => ({}), { updateModel }),
  withHandlers({
    barChartGroupingLimitHandler: ({ updateModel: updateModelAction, model }) => (event) => {
      updateModelAction({
        schema: 'visualisation',
        id: model.get('_id'),
        path: 'barChartGroupingLimit',
        value: parseInt(event.target.value)
      });
    }
  })
)(BarEditorComponent);

// onChange={this.onChangeAttr.bind(null, 'previewPeriod')}
const OptionsEditor = ({ model }) => (
  <div>
    {model.get('type') === XVSY && <XvsYOptionsEditor model={model} />}
    {(model.get('type') === LEADERBOARD) && <BarEditor model={model} />}
  </div>
  );


export default OptionsEditor;
