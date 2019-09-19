import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, List, fromJS } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { withProps, withState, compose } from 'recompose';
import { connect } from 'react-redux';
import { getDefaultProjectionFromType } from 'ui/redux/modules/exports';
import { withModel } from 'ui/utils/hocs';
import { downloadExport } from 'ui/redux/actions';
import ProjectionInput from './ProjectionInput';
import ExportOutputPreview from './ExportOutputPreview';
import styles from './styles.css';

const downloadRequestStates = {
  default: 0,
  waiting: 1,
  inqueue: 2
};

class ExportForm extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map).isRequired,
    id: PropTypes.string.isRequired,
    downloadRequestState: PropTypes.number.isRequired,
    setDownloadRequestStates: PropTypes.func.isRequired,
    pipelines: PropTypes.instanceOf(List).isRequired,
    downloadExport: PropTypes.func.isRequired,
  }

  state = {
    activeIndex: 0,
    projectionString: '',
    download: false
  }

  componentDidMount = () => {
    this.state.projectionString = this.getActiveProjection();
  }

  componentDidUpdate = () => {
    if (this.state.download === true) {
      this.postDownloadExport();
      this.state.download = false;
    }
  };

  onChangeProjection = (projection) => {
    this.props.updateModel({ path: ['projections'], value: fromJS([projection]) });
  }

  onUpdateProjection = (projection) => {
    this.state.projectionString = projection;
  }

  onDownloadExport = () => {
    if (this.props.model.get('rawMode')) {
      this.onChangeProjection(this.state.projectionString);
      this.state.download = true;
    } else {
      this.postDownloadExport();
    }
  }

  selectIndex = (index) => {
    this.setState({ activeIndex: index });
  };

  postDownloadExport = () => {
    this.props.setDownloadRequestStates(downloadRequestStates.waiting);
    this.props.downloadExport({ exportId: this.props.id, pipelines: [this.getCompletePipeline()] })
      .then(() => {
        this.props.setDownloadRequestStates(downloadRequestStates.inqueue);
        setTimeout(() => {
          this.props.setDownloadRequestStates(downloadRequestStates.default);
        }, 3000);
      });
  }

  getActiveProjection = () => {
    const { model } = this.props;
    const { activeIndex } = this.state;
    return model.getIn(
      ['projections', activeIndex],
      getDefaultProjectionFromType(model.get('type'))
    );
  }

  getCompletePipeline = () => {
    const { pipelines } = this.props;
    const { activeIndex } = this.state;
    const activeProjection = this.getActiveProjection();
    const activePipeline = pipelines.get(activeIndex, new List());
    return activePipeline
      .push(new Map({ $sort: { timestamp: -1, _id: 1 } }))
      .push(new Map({ $project: activeProjection }));
  }

  toggleRaw = () => {
    const { model, updateModel } = this.props;
    const rawMode = model.get('rawMode');
    const newRawMode = !rawMode;
    if (newRawMode === false) {
      this.onChangeProjection(this.state.projectionString);
    }

    updateModel({ path: ['rawMode'], value: newRawMode });
  }

  renderDownloadButton = () => {
    switch (this.props.downloadRequestState) {
      default:
      case downloadRequestStates.default:
        return <button className="btn btn-default pull-right" onClick={this.onDownloadExport}>Download</button>;
      case downloadRequestStates.waiting:
        return <button className="btn btn-default pull-right" disabled ><i className="ion ion-clock" /> Requesting download...</button>;
      case downloadRequestStates.inqueue:
        return <div className="alert alert-success pull-right">Your download will be available in the Downloads tab.</div>;
    }
  }

  render = () => {
    const { model, pipelines } = this.props;
    const rawMode = model.get('rawMode');
    const { activeIndex } = this.state;
    const activeProjection = this.getActiveProjection();

    return (
      <div>
        <div className={`${styles.exportForm} row rowadding`}>
          {rawMode ? (
            <div className="col-xs-12">
              <ProjectionInput
                projection={activeProjection}
                onChange={this.onUpdateProjection}
                rawMode />
            </div>
          ) : [
            <div className={`col-md-6 col-xs-12 ${styles.projectionInput}`} key="export-projection">
              <ProjectionInput
                projection={activeProjection}
                onChange={this.onChangeProjection} />
            </div>,
            <div className={`col-md-6 ${styles.exportOutputPreview}`} key="export-preview">
              <ExportOutputPreview
                filter={pipelines.getIn([activeIndex, 0, '$match'], new Map())}
                project={activeProjection}
                className={styles.rightPane} />
            </div>
          ]}
        </div>
        <button className="btn btn-default" onClick={this.toggleRaw}><i className="ion ion-code" /></button>
        {this.renderDownloadButton()}
      </div>
    );
  }
}

export default compose(
  withStyles(styles),
  withProps({ schema: 'export' }),
  withState('downloadRequestState', 'setDownloadRequestStates', downloadRequestStates.default),
  withModel,
  connect(() => ({}), { downloadExport })
)(ExportForm);
