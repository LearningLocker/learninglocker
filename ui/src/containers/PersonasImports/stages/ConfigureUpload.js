import React from 'react';
import { compose, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';

import ModelAutoComplete from 'ui/containers/ModelAutoComplete';

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
          console.log('ModelAUtoComplete onChange', event);
        }} />
      <button className="btn btn-primary">Save</button>
      <button className="btn btn-primary">Save As</button>
    </div>
  );
};

const TemplateManager = compose(
)(renderTemplateSelector);

const render = ({ model }) => {

  return (<div>
    <div className="form-group">
      <TemplateManager />
    </div>
    <div className="form-group">
      Hello world
    </div>
  </div>);
};

export default compose(
  withProps(({ model }) => ({
    schema,
    id: model.get('_id')
  })),
  withModel
)(
  render
);
