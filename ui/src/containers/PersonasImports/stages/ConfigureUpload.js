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

import ModelAutoComplete from 'ui/containers/ModelAutoComplete';
import ColumnHeaderEditor from 'ui/containers/PersonasImports/columnHeaderEditor';
import {
  importPersonas
} from 'ui/redux/modules/persona';
import ValidationList from 'ui/components/ValidationList';

const schema = 'personasImport';
const templateSchema = 'personasImportTemplate';

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

const renderTemplateSelector = ({
  templateId = null,
}) =>
  (
    <div>
      <ModelAutoComplete
        schema={templateSchema}
        id={templateId}
        parseOption={model => model.get('name')}
        parseOptionTooltip={model => model.get('name')}
        onChange={(event) => {
          console.log('ModelAutoComplete onChange', event);
        }} />
      <button className="btn btn-primary">Save</button>
      <button className="btn btn-primary">Save As</button>
    </div>
  );

const TemplateManager = compose(
)(renderTemplateSelector);

const render = ({
  model,
  handleImportPersonas
}) =>
  (
    <div>
      <div className="form-group">
        <TemplateManager />
      </div>
      <div
        className={classNames({
          'form-group': true,
          'has-error': model.getIn(['errors', 'messages', 'structure'], false)
        })}>
        <ColumnHeaderEditor
          csvHeaders={model.get('csvHeaders', new List())}
          structure={model.get('structure', new Map())}
          model={model} />

        {model.getIn(['errors', 'messages', 'structure'], false) &&
          (<span className="help-block">
            <ValidationList errors={model.getIn(['errors', 'messages', 'structure'])} />
          </span>)
        }
      </div>
      <div className="form-group">
        <button
          className="btn btn-primary pull-right"
          onClick={handleImportPersonas}>
          Import Personas
          </button>
      </div>
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
  render
);
