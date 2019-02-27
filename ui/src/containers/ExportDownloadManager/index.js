import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import { withProps, compose } from 'recompose';
import Spinner from 'ui/components/Spinner';
import DownloadListItem from 'ui/components/DownloadListItem';
import { withSchema } from 'ui/utils/hocs';

class ExportDownloadManager extends Component {
  static propTypes = {
    isLoading: PropTypes.bool, // is loading Download
    models: PropTypes.instanceOf(Map), // Download models
    deleteModel: PropTypes.func, // delete Download
  }

  static defaultProps = {}

  render = () => {
    const { models, isLoading, deleteModel } = this.props;
    if (isLoading) return (<Spinner />);
    return (
      <div>
        { models.map((model, id) =>
          (<DownloadListItem
            key={id}
            download={model}
            deleteDownloadModel={deleteModel} />)
          ).valueSeq() }
      </div>
    );
  }
}

export default compose(
  withProps({
    sort: new Map({ time: -1, _id: 1 }),
  }),
  withSchema('download'),
)(ExportDownloadManager);
