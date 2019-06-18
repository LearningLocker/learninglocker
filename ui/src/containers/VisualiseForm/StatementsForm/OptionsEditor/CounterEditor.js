import React from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompose';
import { updateModel } from 'ui/redux/modules/models';
import Switch from 'ui/components/Material/Switch';

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


const CounterEditor = compose(
  connect(() => ({}), { updateModel }),
  withHandlers({
    benchmarkingHandler: ({ updateModel: updateModelAction, model }) => () => {
      updateModelAction({
        schema: 'visualisation',
        id: model.get('_id'),
        path: 'benchmarkingEnabled',
        value: !model.get('benchmarkingEnabled')
      });
    }
  })
)(CounterEditorComponent);

export default CounterEditor;
