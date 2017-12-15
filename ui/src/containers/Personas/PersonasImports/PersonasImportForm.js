import React from 'react';
import { compose, withHandlers, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import IntialUploadForm from 'ui/containers/Personas/PersonasImports/stages/InitialUpload';
import ConfigureUpload from 'ui/containers/Personas/PersonasImports/stages/ConfigureUpload';
import moment from 'moment';

import {
  STAGE_UPLOAD,
  STAGE_CONFIGURE_FIELDS,
  STAGE_IMPORTED
} from 'lib/constants/personasImport';

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

export const PersonasImportFormComponent = ({
  model,
  changeTitle
}) =>
  (<div>
    <div className="form-group">
      <label htmlFor={`${model.get('_id')}descriptionInput`}>Name</label>
      <input
        id={`${model.get('_id')}descriptionInput`}
        className="form-control"
        placeholder="Short title of this import"
        value={model.get('title', '')}
        onChange={changeTitle} />
    </div>

    {model.get('importStage') === STAGE_UPLOAD && <IntialUploadForm
      className="initialUpload"
      model={model} />
    }
    {model.get('importStage') === STAGE_CONFIGURE_FIELDS &&
      <ConfigureUpload
        className="configureUpload"
        model={model} />
    }
    {model.get('importStage') === STAGE_IMPORTED &&
      <div className="stageImported">
        <ConfigureUpload
          className="configureUpload"
          model={model}
          disabled="true" />
        <blockquote>
          <h4>Imported on {moment(model.get('importedAt')).format('ddd DD MMM YYYY h:mm:ss')}</h4>
          <p>
            <b>Merged: {model.getIn(['result', 'merged'], 0)} personas<br /></b>
            <b>Created: {model.getIn(['result', 'created'])} new components</b>
          </p>
        </blockquote>
      </div>
    }
  </div>
  );

const PersonasImportForm = compose(
  withProps(({ model }) => ({
    schema,
    id: model.get('_id')
  })),
  withModel,
  handlers,
)(PersonasImportFormComponent);

export default PersonasImportForm;
