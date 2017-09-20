import React, { Component, PropTypes } from 'react';
import Portal from 'react-portal';
import { connect } from 'react-redux';
import { loggedInUserId } from 'ui/redux/modules/auth';
import {
  uploadPeople,
  uploadStateSelector,
  uploadMessageSelector,
  uploadErrorSelector,
  importModelSelector,
  IN_PROGRESS,
  SUCCESS,
  FAILED
} from 'ui/redux/modules/people';
import { Map } from 'immutable';
import { fetchModels } from 'ui/redux/modules/pagination';
import { modelsSchemaIdSelector, modelsWorker } from 'ui/redux/modules/models';
import ProgressBar from 'ui/containers/ProgressBar';
import { PROGRESS_MODELS } from '../../utils/constants';

const filter = new Map({});
const importSchema = 'importcsv';
const progressModel = PROGRESS_MODELS[importSchema];

const schema = 'persona';

class PeopleImport extends Component {

  static propTypes = {
    isOpened: PropTypes.bool,
    onClickClose: PropTypes.func,
    userId: PropTypes.string,
    message: PropTypes.string,
    error: PropTypes.string,
    uploadPeople: PropTypes.func,
    model: PropTypes.instanceOf(Map),
    uploadState: PropTypes.string,
    modelsWorker: PropTypes.func,
    fetchModels: PropTypes.func
  }

  static defaultProps = {
    isOpened: false,
    upload: new Map(),
    model: new Map()
  }

  constructor(props) {
    super(props);

    this.state = {
      fileName: '',
      fileHandle: null,
      progressMessage: '',
      showUpload: 'block',
      showFile: 'none',
      uploadComplete: 'none'
    };
  }

  componentWillMount = () => {
    this.props.fetchModels({ schema: 'importcsv', filter });
  }

  componentWillReceiveProps = () => {
    const { model } = this.props;

    this.props.fetchModels({ schema, filter });
    this.props.fetchModels({ schema: 'importcsv', filter });
    this.props.modelsWorker('importcsv', model, progressModel, true);
  }

  handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (this.state.fileHandle) {
      this.props.uploadPeople(this.state.fileHandle, this.props.userId);
      this.resetForm();
    }
  }

  handleFile = (e) => {
    this.setState({ fileName: e.target.files[0].name });
    this.setState({ fileHandle: e.target.files[0] });
  }

  resetForm = () => {
    this.setState({ fileName: '' });
    this.setState({ fileHandle: null });
  }

  onClickClose = () => {
    this.resetForm();
    this.props.onClickClose();
  }

  renderButtonContent = () => {
    const { uploadState, model } = this.props;

    switch (uploadState) {
      case IN_PROGRESS: return <i className="fa fa-cog fa-spin fa-fw" />;
      case SUCCESS: return <i className="icon animated fadeIn ion-checkmark" />;
      case FAILED: return <i className="icon animated fadeIn ion-sad" />;
      default: {
        if (!progressModel) return <i className="ion ion-upload" />;
        const statusObject = progressModel.statusObject;
        const inProgress = progressModel.inProgress;
        const workerStatus = model.get(statusObject, new Map({}));
        return workerStatus.get(inProgress, false) ? <i className="fa fa-cog fa-spin fa-fw" /> : <i className="ion ion-upload" />;
      }
    }
  }

  renderResult = () => {
    const { uploadState, error, message } = this.props;

    switch (uploadState) {
      case IN_PROGRESS: return <div>Scanning file ....</div>;
      case SUCCESS: return <div>{message}</div>;
      case FAILED: return (
        <div className="alert alert-danger" role="alert">
          <span className="sr-only">Error:</span> {error}
        </div>
      );
      default: return <div />;
    }
  }

  render = () => {
    const { isOpened, model } = this.props;
    const { fileName } = this.state;

    return (
      <Portal isOpened={isOpened}>
        <span>
          <div className="modal animated fast fadeIn">
            <div className="modal-dialog">
              <div className="modal-content">

                <div className="modal-header modal-header-bg">
                  <button type="button" className="close" aria-label="Close" onClick={this.onClickClose}><span aria-hidden="true">&times;</span></button>
                  <h4 className="modal-title">Import people</h4>
                </div>
                <div className="modal-body clearfix" style={{ maxHeight: '500px', overflow: 'auto' }}>
                  <div className="row">
                    <div className="col-md-12">
                      <form onSubmit={this.handleSubmit} encType="multipart/form-data">
                        <label className="btn btn-primary" htmlFor="my-file-selector">
                          <input id="my-file-selector" name="users" type="file" accept=".csv" onChange={this.handleFile} style={{ display: 'none' }} />
                          <strong>Upload CSV file</strong>
                        </label><span> {fileName || ''}</span>
                      </form>
                      <br />
                      <div>
                        <ProgressBar model={model} schema={'importcsv'} />
                        {this.renderResult()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <div className="col-xs-1">
                    <a onClick={this.handleSubmit} className="btn btn-primary">{this.renderButtonContent()}</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop" onClick={this.onClickClose} />
          </div>
        </span>
      </Portal>
    );
  }
}

export default connect((state) => {
  const modelId = importModelSelector(state);
  return {
    uploadState: uploadStateSelector(state),
    message: uploadMessageSelector(state),
    error: uploadErrorSelector(state),
    model: modelsSchemaIdSelector('importcsv', modelId)(state),
    userId: loggedInUserId(state)
  };
}, { uploadPeople, fetchModels, modelsWorker })(PeopleImport);
