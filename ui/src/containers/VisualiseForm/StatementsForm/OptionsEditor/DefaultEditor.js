import React from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompose';
import { updateModel } from 'ui/redux/modules/models';
import Switch from 'ui/components/Material/Switch';

const DefaultEditorComponent = ({ model, sourceViewHandler, donutHandler }) => (
  <div className="form-group">
    <Switch
      label="View as table"
      id={'DefaultEditorComponent'}
      checked={model.get('sourceView')}
      onChange={sourceViewHandler} />
    {!model.get('sourceView') && <Switch
      label="Donut chart"
      id={'DefaultEditorComponent'}
      checked={model.get('isDonut')}
      onChange={donutHandler} />}
  </div>
);

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
    },
    donutHandler: ({ updateModel: updateModelAction, model }) => {
      updateModelAction({
        schema: 'visualisation',
        id: model.get('_id'),
        path: 'isDonut',
        value: !model.get('isDonut')
      });
    },
  })
)(DefaultEditorComponent);

export default DefaultEditor;
