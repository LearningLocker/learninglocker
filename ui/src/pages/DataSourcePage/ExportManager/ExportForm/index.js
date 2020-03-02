import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, List, fromJS } from 'immutable';
import { withProps, withState, compose } from 'recompose';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { getDefaultProjectionFromType } from 'ui/redux/modules/exports';
import { withModel } from 'ui/utils/hocs';
import { downloadExport } from 'ui/redux/actions';
import ProjectionInput from './ProjectionInput';
import ExportOutputPreview from './ExportOutputPreview';

const downloadRequestStates = {
  default: 0,
  waiting: 1,
  inqueue: 2
};

const ExportOutputPreviewSection = styled.div`
  margin-top: 11px;

  @media (max-width: 991px) {
    display: none;
  }
`;

const ProjectionInputSection = styled.div`
  @media (max-width: 991px) {
    margin-right: 0px;
  }
`;

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
    this.setState((state, props) => ({ projectionString: this.getActiveProjection(state, props) }));
  }

  componentDidUpdate = () => {
    if (this.state.download === true) {
      this.postDownloadExport();
      this.setState({ download: false });
    }
  };

  onChangeProjection = (projection) => {
    this.props.updateModel({ path: ['projections'], value: fromJS([projection]) });
  }

  onUpdateProjection = (projection) => {
    this.setState({ projectionString: projection });
  }

  onDownloadExport = () => {
    if (this.props.model.get('rawMode')) {
      this.onChangeProjection(this.state.projectionString);
      this.setState({ download: true });
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

  getActiveProjection = (state, props) => props.model.getIn(
      ['projections', state.activeIndex],
      getDefaultProjectionFromType(props.model.get('type'))
    )

  getCompletePipeline = () => {
    const { pipelines } = this.props;
    const { activeIndex } = this.state;
    const activeProjection = this.getActiveProjection(this.state, this.props);
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
    const activeProjection = this.getActiveProjection(this.state, this.props);

    return (
      <div>
        <div
          className="row rowadding"
          style={{ margin: '10px 0', display: 'flex' }}>
          {rawMode ? (
            <div className="col-xs-12">
              <ProjectionInput
                projection={activeProjection}
                onChange={this.onUpdateProjection}
                rawMode />
            </div>
          ) : [
            <ProjectionInputSection className="col-md-6 col-xs-12" key="export-projection">
              <ProjectionInput
                projection={activeProjection}
                onChange={this.onChangeProjection} />
            </ProjectionInputSection>,
            <ExportOutputPreviewSection className="col-md-6" key="export-preview">
              <ExportOutputPreview
                style={{
                  flexGrow: 1,
                  marginLeft: 20,
                  paddingLeft: 20,
                  marginTop: 10,
                  borderLeft: '1px solid #eee',
                }}
                filter={pipelines.getIn([activeIndex, 0, '$match'], new Map())}
                project={activeProjection} />
            </ExportOutputPreviewSection>
          ]}
        </div>
        <button className="btn btn-default" onClick={this.toggleRaw}><i className="ion ion-code" /></button>
        {this.renderDownloadButton()}
      </div>
    );
  }
}

export default compose(
  withProps({ schema: 'export' }),
  withState('downloadRequestState', 'setDownloadRequestStates', downloadRequestStates.default),
  withModel,
  connect(() => ({}), { downloadExport })
)(ExportForm);
