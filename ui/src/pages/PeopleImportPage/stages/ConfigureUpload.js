import React from 'react';
import {
  compose,
  withProps,
  withHandlers,
  withState
} from 'recompose';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { modelsSchemaIdSelector } from 'ui/redux/selectors';
import { withModel } from 'ui/utils/hocs';
import { importPersonas } from 'ui/redux/modules/persona';
import ValidationList from 'ui/components/ValidationList';
import ColumnHeaderEditor from './ColumnHeaderEditor';

const schema = 'personasImport';

const disabledState = withState('disabled', 'setDisabled', ({ disabled }) => disabled);

const handlers = withHandlers({
  handleImportPersonas: ({
    model,
    importPersonas: doImportPersonas,
    setDisabled
  }) => () => {
    setDisabled(true);
    doImportPersonas({
      id: model.get('_id')
    });
  }
});


export const ConfigureUploadComponent = ({
  model, // personasImports model
  handleImportPersonas,
  disabled = false,
}) => {
  const errors = model.getIn(['errors', 'messages', 'structure']);
  return (
    <div>
      <div
        className={classNames({
          'form-group': true,
          'has-error': model.getIn(['errors', 'messages', 'structure'], false)
        })}>
        <ColumnHeaderEditor
          model={model}
          disabled={disabled} />

        {errors !== undefined &&
          (<span className="help-block">
            <ValidationList errors={errors} />
          </span>)
        }
      </div>
      {!disabled &&
        <div className="form-group">
          <button
            className="btn btn-primary pull-right"
            onClick={handleImportPersonas}>
            Import Personas
            </button>
        </div>
      }
    </div>
  );
};

export default compose(
  withProps(({ model }) => ({
    schema,
    id: model.get('_id')
  })),
  withModel,
  connect(
    (state, { schema: connectSchema, id }) => ({
      model: modelsSchemaIdSelector(connectSchema, id, { deep: true })(state)
    }),
    { importPersonas }
  ),
  disabledState,
  handlers
)(
  ConfigureUploadComponent
  );
