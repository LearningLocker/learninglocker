import React from 'react';
import {
  compose,
  withProps,
  withHandlers
} from 'recompose';
import { withModel } from 'ui/utils/hocs';
import { Map, List } from 'immutable';
import { modelsSchemaIdSelector } from 'ui/redux/selectors';
import { connect } from 'react-redux';
import classNames from 'classnames';
import {
  importPersonas
} from 'ui/redux/modules/persona';
import ValidationList from 'ui/components/ValidationList';
import ColumnHeaderEditor from '../columnHeaderEditor';

const schema = 'personasImport';

const handlers = withHandlers({
  handleImportPersonas: ({
    model,
    importPersonas: doImportPersonas
  }) => () => {
      doImportPersonas({
        id: model.get('_id')
      });
    }
});


export const ConfigureUploadComponent = ({
  model,
  handleImportPersonas,
  disabled = false,
}) =>
  (
    <div>
      <div
        className={classNames({
          'form-group': true,
          'has-error': model.getIn(['errors', 'messages', 'structure'], false)
        })}>
        <ColumnHeaderEditor
          csvHeaders={model.get('csvHeaders', new List())}
          structure={model.get('structure', new Map())}
          model={model}
          disabled={disabled} />

        {model.getIn(['errors', 'messages', 'structure'], false) &&
          (<span className="help-block">
            <ValidationList errors={model.getIn(['errors', 'messages', 'structure'])} />
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
  handlers
)(
  ConfigureUploadComponent
  );
