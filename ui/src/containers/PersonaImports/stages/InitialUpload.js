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
const SUCCESS = 'SUCCESS';
const FAILED = 'FAILED';

const fileState = withState('file', 'setFile', {});


const renderUploadButton = ({
  requestState,
  onSubmit,
}) => {
  switch (requestState) {
    case IN_PROGRESS:
      return (
        <button
          onClick={onSubmit}
          className="btn btn-primary">
          <i className="icon ion-gear-a animated rotate infinite" style={({ display: 'block' })} />
        </button>);
    case SUCCESS:
      return (
        <button
          onClick={onSubmit}
          disabled="true"
          className="btn btn-primary">
          <i className="icon animated fadeIn ion-checkmark" />
        </button>
      );
    case FAILED:
      return (
        <button
          onClick={onSubmit}
          className="btn btn-primary">
          <i className="icon animated fadeIn ion-sad" /> Retry
        </button>);
    default: {
      return (
        <button
          onClick={onSubmit}
          className="btn btn-primary">
          <i className="icon ion-upload" style={({ display: 'block' })} /> Upload
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
  )(renderUploadButton);

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
  handleFileChange: ({ setFile }) => (event) => {
    const name = event.target.files[0].name;
    const handle = event.target.files[0];

    setFile({
      name,
      handle
    });
  }
});

const intialUploadFormRender = ({
  model,
  onSubmit,
  handleFileChange,
  file
}) => {
  return (<div>
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

        <strong>Upload personas CSV</strong>
      </label><span> { file.name || ''}</span>
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
        id={model.get('_id')} />
    </div>
    <div className="form-group">
      {model.get('stage')}
    </div>
  </div>);
};

export default compose(
  fileState,
  connect(
    state => ({
      requestState: requestStateSelector(state),
    }),
    { uploadPersonas }
  ),
  handlers,
)(intialUploadFormRender);
