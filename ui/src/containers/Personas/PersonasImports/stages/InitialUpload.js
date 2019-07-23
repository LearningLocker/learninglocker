import React from 'react';
import {
  compose,
  withHandlers,
  withState,
} from 'recompose';
import { connect } from 'react-redux';
import {
  uploadPersonas,
  requestStateSelector
} from 'ui/redux/modules/persona';
import ProgressBar from 'ui/containers/ProgressBar';

const IN_PROGRESS = 'IN_PROGRESS';
const COMPLETED = 'COMPLETED';
const FAILED = 'FAILED';

const fileState = withState('file', 'setFile', {});


export const UploadButtonComponent = ({
  requestState,
  onSubmit,
  disabled = false
}) => {
  switch (requestState) {
    case IN_PROGRESS:
      return (
        <button
          onClick={onSubmit}
          className="btn btn-primary pull-right">
          <i className="icon ion-gear-a animated rotate infinite" style={({ display: 'block' })} />
        </button>);
    case COMPLETED:
      return (
        <button
          onClick={onSubmit}
          disabled
          className="btn btn-primary pull-right">
          <i className="icon animated fadeIn ion-checkmark" />
        </button>
      );
    case FAILED:
      return (
        <button
          onClick={onSubmit}
          className="btn btn-primary pull-right">
          <i className="icon animated fadeIn ion-sad" /> Retry
        </button>);
    default: {
      return (
        <button
          onClick={onSubmit}
          className="btn btn-primary pull-right"
          disabled={disabled}>
          <i className="icon ion-upload" /> Upload
        </button>
      );
    }
  }
};
const UploadButton =
  compose(
    connect((state, { id }) => ({
      requestState: requestStateSelector({ id })(state)
    }), {})
  )(UploadButtonComponent);

// ---------------------------

const handlers = withHandlers({
  onSubmit: ({
    model,
    file,
    uploadPersonas: doUploadPersonas
  }) => (event) => {
    if (event) event.preventDefault();

    doUploadPersonas({
      id: model.get('_id'),
      file
    });
  },
  handleFileChange: ({
    setFile,
    setDisableUpload
  }) => (event) => {
    const name = event.target.files[0].name;
    const handle = event.target.files[0];

    setDisableUpload(false);

    setFile({
      name,
      handle
    });
  }
});

export const InitialUploadComponent = ({
  model,
  onSubmit,
  handleFileChange,
  file,
  disableUpload
}) =>
  (<div>
    <form className="form-group" onSubmit={onSubmit} encType="multipart/form-data">
      <label htmlFor={`${model.get('_id')}-file-selector`} className="btn btn-primary">
        <input
          id={`${model.get('_id')}-file-selector`}
          style={{ display: 'none' }}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="form-control"
          placeholder="Upload the csv" />

        <strong>Choose CSV</strong>
      </label><span> {(file && file.name) || ''}</span>
      <br />
      <div>
        <ProgressBar
          model={model}
          schema={'importcsv'} />
      </div>
    </form>
    <div className="form-group">
      <UploadButton
        onSubmit={onSubmit}
        id={model.get('_id')}
        disabled={disableUpload} />
    </div>
    <div className="form-group">
      {model.get('stage')}
    </div>
  </div>
  );

const InitialUploadForm = compose(
  fileState,
  connect(
    state => ({
      requestState: requestStateSelector(state),
    }),
    { uploadPersonas }
  ),
  withState('disableUpload', 'setDisableUpload', true),
  handlers,
)(InitialUploadComponent);

export default InitialUploadForm;
