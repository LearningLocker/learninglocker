import React from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers, withProps } from 'recompose';
import {
  withModel,
  withPolling
} from 'ui/utils/hocs';
import { List } from 'immutable';
import moment from 'moment';
import { formatUrl } from 'ui/utils/LLApiClient';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import {
  STAGE_UPLOAD,
  STAGE_CONFIGURE_FIELDS,
  STAGE_IMPORTED,
  STAGE_PROCESSING
} from 'lib/constants/personasImport';
import ConfigureUpload from './stages/ConfigureUpload';
import InitialUploadForm from './stages/InitialUpload';

const schema = 'personasImport';

const handlers = withHandlers({
  changeTitle: ({ updateModel }) => (event) => {
    const newDescription = event.target.value;

    return updateModel({
      path: ['title'],
      value: newDescription
    });
  }
});

export const PersonasImportFormComponent = ({
  model,
  changeTitle,
  organisationId
}) => {
  const errorSize = model.get('importErrors', new List()).size;

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

    {model.get('importStage') === STAGE_UPLOAD && <InitialUploadForm
      className="initialUpload"
      model={model} />
    }
    {model.get('importStage') === STAGE_CONFIGURE_FIELDS &&
      <ConfigureUpload
        className="configureUpload"
        model={model} />
    }
    {model.get('importStage') === STAGE_PROCESSING || model.get('importStage') === STAGE_IMPORTED &&
      <div className="stageImported">
        <ConfigureUpload
          className="configureUpload"
          model={model}
          disabled />
        <blockquote>
          <h4>Imported on {moment(model.get('importedAt')).format('ddd DD MMM YYYY h:mm:ss')}</h4>
          <p>
            <b>Merged: {model.getIn(['result', 'merged'], 0)} personas<br /></b>
            <b>Created: {model.getIn(['result', 'created'])} new personas<br /></b>
            {errorSize > 0 && <b style={{ color: 'red' }}>
              Errored: {errorSize} {errorSize === 1 && <span>row</span>} {errorSize > 1 && <span>rows</span>}&nbsp;
              <a
                href={formatUrl(`/organisation/${organisationId}/importpersonaserror/${model.get('_id')}.csv`)}
                target="_blank"
                rel="noreferrer noopener"
                className="btn btn-primary">Download csv with errors</a>
            </b>}
          </p>
        </blockquote>
      </div>
    }
  </div>
  );
};

const PersonasImportForm = compose(
  withProps(({ model }) => ({
    schema,
    id: model.get('_id'),
    doWhile: m => m.get('importStage') === STAGE_PROCESSING,
  })),
  withModel,
  withPolling,
  handlers,
  connect(state => ({
    organisationId: activeOrgIdSelector(state)
  }))
)(PersonasImportFormComponent);

export default PersonasImportForm;
