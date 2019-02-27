import React from 'react';
import Switch from 'ui/components/Material/Switch';
import { updateModel } from 'ui/redux/modules/models';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompose';

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
    sourceViewHandler: ({ updateModel: updateModelAction, model }) => () => {
      updateModelAction({
        schema: 'visualisation',
        id: model.get('_id'),
        path: 'sourceView',
        value: !model.get('sourceView')
      });
    }
  })
)(XvsYOptionsEditorComponent);

export default XvsYOptionsEditor;
