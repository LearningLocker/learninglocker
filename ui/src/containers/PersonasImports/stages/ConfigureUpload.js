import React from 'react';
import { compose, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import { Map, List } from 'immutable';
import { modelsSchemaIdSelector } from 'ui/redux/selectors';
import { connect } from 'react-redux';

import ModelAutoComplete from 'ui/containers/ModelAutoComplete';
import ColumnHeaderEditor from 'ui/containers/PersonasImports/columnHeaderEditor';

const schema = 'personasImport';
const templateSchema = 'personasImportTemplate';

const renderTemplateSelector = ({
  templateId = null,
}) => {

  return (
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
};

const TemplateManager = compose(
)(renderTemplateSelector);

const render = ({ model }) =>
  (
    <div>
      <div className="form-group">
        <TemplateManager />
      </div>
      <div className="form-group">
        <ColumnHeaderEditor
          csvHeaders={model.get('csvHeaders', new List())}
          structure={model.get('structure', new Map())}
          model={model} />
      </div>
      <div className="form-group">
        <button className="btn btn-primary pull-right">Import Personas</button>
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
    {}
  ),
)(
  render
);
