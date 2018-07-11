import React from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompose';
import { updateModel } from 'ui/redux/modules/models';
import Switch from 'ui/components/Material/Switch';

const OptionsEditor = ({ model, trendLinesHandler }) => (<div>
  <div className="form-group">
    <Switch
      checked={model.get('trendLines')}
      label="Trend Lines"
      onChange={trendLinesHandler} />
  </div>
</div>);

export default compose(
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
)(
  OptionsEditor
);
