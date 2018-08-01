import React from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompose';
import { updateModel } from 'ui/redux/modules/models';
import Switch from 'ui/components/Material/Switch';
import { XVSY, FIVE, TEN, FIFTEEN, TWENTY, LEADERBOARD, COUNTER, STATEMENTS, PIE, FREQUENCY } from 'ui/utils/constants';
import { setInMetadata } from 'ui/redux/modules/metadata';

const DefaultEditorComponent = ({ model, sourceViewHandler }) => (
  <div className="form-group">
    <Switch
      label="View as table"
      id={'DefaultEditorComponent'}
      checked={model.get('sourceView')}
      onChange={sourceViewHandler} />
  </div>
);

const XvsYOptionsEditorComponent = ({ model, trendLinesHandler, sourceViewHandler }) => (
  <div className="form-group">
    <Switch
      label="View as table"
      id={'XvsYOptionsEditorComponent'}
      checked={model.get('sourceView')}
      onChange={sourceViewHandler} />
    {!model.get('sourceView') && <Switch
      checked={model.get('trendLines')}
      label="Trend Lines"
      onChange={trendLinesHandler} />}
  </div>);

const BarEditorComponent = ({ model, sourceViewHandler, barChartGroupingLimitHandler }) => (
  <div className="form-group">
    <Switch
      label="View as table"
      id={'BarEditorComponent'}
      checked={model.get('sourceView')}
      onChange={sourceViewHandler} />
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
    },
    sourceViewHandler: ({ updateModel: updateModelAction, model }) => {
      updateModelAction({
        schema: 'visualisation',
        id: model.get('_id'),
        path: 'sourceView',
        value: !model.get('sourceView')
      });
    }
  })
)(XvsYOptionsEditorComponent);

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
    },
    sourceViewHandler: ({ updateModel: updateModelAction, model }) => {
      updateModelAction({
        schema: 'visualisation',
        id: model.get('_id'),
        path: 'sourceView',
        value: !model.get('sourceView')
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

const DefaultEditor = compose(
  connect(() => ({}), { updateModel }),
  withHandlers({
    sourceViewHandler: ({ updateModel: updateModelAction, model }) => {
      updateModelAction({
        schema: 'visualisation',
        id: model.get('_id'),
        path: 'sourceView',
        value: !model.get('sourceView')
      });
    }
  })
)(DefaultEditorComponent);

const OptionsEditor = ({ model }) => (
  <div>
    {model.get('type') === XVSY && <XvsYOptionsEditor model={model} />}
    {(model.get('type') === LEADERBOARD) && <BarEditor model={model} />}
    {(model.get('type') === COUNTER) && <CounterEditor model={model} />}
    {(model.get('type') === STATEMENTS) && <DefaultEditor model={model} />}
    {(model.get('type') === PIE) && <DefaultEditor model={model} />}
    {(model.get('type') === FREQUENCY) && <DefaultEditor model={model} />}
  </div>
);

export default OptionsEditor;
