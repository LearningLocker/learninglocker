import React from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompose';
import { updateModel } from 'ui/redux/modules/models';
import Switch from 'ui/components/Material/Switch';

const DefaultEditorComponent = ({ model, sourceViewHandler }) => (
  <div className="form-group">
    <Switch
      label="View as table"
      id={'DefaultEditorComponent'}
      checked={model.get('sourceView')}
      onChange={sourceViewHandler} />
  </div>
);

const StatementEditor = compose(
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

export default StatementEditor;
