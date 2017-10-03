import React from 'react';
import { compose, withHandlers, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import IntialUploadForm from 'ui/containers/PersonasImports/stages/initialUpload';

const schema = 'personasImport';

const handlers = withHandlers({
  changeTitle: ({ updateModel }) => (event) => {
    const newDescription = event.target.value;

    return updateModel({
      path: ['title'],
      value: newDescription
    });
  },
});

const personasImportForm = ({
  model,
  changeTitle
}) => {
  return (<div>
    <div className="form-group">
      <label htmlFor={`${model.get('_id')}descriptionInput`}>Name</label>
      <input
        id={`${model.get('_id')}descriptionInput`}
        className="form-control"
        placeholder="Short title of this import"
        value={model.get('title', '')}
        onChange={changeTitle} />
    </div>

    <IntialUploadForm
      model={model} />
  </div>
  );
};

export default compose(
  withProps(({ model }) => ({
    schema,
    id: model.get('_id')
  })),
  withModel,
  handlers,
)(personasImportForm);
