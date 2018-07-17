import React from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompose';
import { updateModel } from 'ui/redux/modules/models';
import Switch from 'ui/components/Material/Switch';
import { XVSY, FIVE, TEN, FIFTEEN, TWENTY, LEADERBOARD, COUNTER } from 'ui/utils/constants';
import { setInMetadata } from 'ui/redux/modules/metadata';

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
      id={'barEditorComponent'}
      className={'options-menu'}
      value={model.get('barChartGroupingLimit')}
      onChange={barChartGroupingLimitHandler}>
      <option value={FIVE}>Show 5</option>
      <option value={TEN}>Show 10</option>
      <option value={FIFTEEN}>Show 15</option>
      <option value={TWENTY}>Show 20</option>
    </select>
  </div>
);

const CounterEditorComponent = ({ model, benchmarkingHandler }) => (
  <div className="form-group">
    <label htmlFor="toggleInput">Enable Benchmarking</label>
    <div id="toggleInput">
      <Switch
        id={'counterEditorComponent'}
        checked={model.get('benchmarkingEnabled')}
        onChange={benchmarkingHandler} />
    </div>
  </div>
);

const BarEditor = compose(
  connect(() => ({}), { updateModel, setInMetadata }),
  withHandlers({
    barChartGroupingLimitHandler: ({ updateModel: updateModelAction, model, setInMetadata: setInMetadataAction }) => (event) => {
      console.log('model', model);
      updateModelAction({
        schema: 'visualisation',
        id: model.get('_id'),
        path: 'barChartGroupingLimit',
        value: parseInt(event.target.value)
      });

      setInMetadataAction({
        schema: 'visualisation',
        id: model.get('_id'),
        path: ['activePage'],
        value: 0
      });
    }
  })
)(BarEditorComponent);

const CounterEditor = compose(
  connect(() => ({}), { updateModel }),
  withHandlers({
    benchmarkingHandler: ({ updateModel: updateModelAction, model }) => {
      updateModelAction({
        schema: 'visualisation',
        id: model.get('_id'),
        path: 'benchmarkingEnabled',
        value: !model.get('benchmarkingEnabled')
      });
    }
  })
)(CounterEditorComponent);

const OptionsEditor = ({ model }) => (
  <div>
    {model.get('type') === XVSY && <XvsYOptionsEditor model={model} />}
    {(model.get('type') === LEADERBOARD) && <BarEditor model={model} />}
    {(model.get('type') === COUNTER) && <CounterEditor model={model} />}
  </div>
);


export default OptionsEditor;
