import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import { withProps, compose } from 'recompose';
import Spinner from 'ui/components/Spinner';
import DownloadListItem from 'ui/components/DownloadListItem';
import { withSchema, withModel } from 'ui/utils/hocs';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import { connect } from 'react-redux';

class ExportDownloadManager extends Component {
  static propTypes = {
    isLoading: PropTypes.bool, // is loading Download
    models: PropTypes.instanceOf(Map), // Download models
    deleteModel: PropTypes.func, // delete Download
    organisation: PropTypes.instanceOf(Map), // Organisation model
  }

  static defaultProps = {}

  render = () => {
    const { models, isLoading, deleteModel, organisation } = this.props;
    if (isLoading) return (<Spinner />);
    return (
      <div>
        { models.map((model, id) =>
          (<DownloadListItem
            key={id}
            download={model}
            expirationExport={organisation.getIn(['settings', 'EXPIRE_EXPORTS'])}
            deleteDownloadModel={deleteModel} />)
          ).valueSeq() }
      </div>
    );
  }
}

export default compose(
  withProps({
    schema: 'organisation',
  }),
  connect(state => ({
    id: activeOrgIdSelector(state)
  })),
  withModel,
  withProps(({ model }) => ({
    organisation: model,
    sort: new Map({ time: -1, _id: 1 }),
  })),
  withSchema('download'),
)(ExportDownloadManager);
