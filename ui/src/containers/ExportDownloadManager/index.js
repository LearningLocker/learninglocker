import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import { withProps, compose } from 'recompose';
import Spinner from 'ui/components/Spinner';
import DownloadListItem from 'ui/components/DownloadListItem';
import { withSchema } from 'ui/utils/hocs';

class ExportDownloadManager extends Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    models: PropTypes.instanceOf(Map),
    deleteModel: PropTypes.func,
  }

  static defaultProps = {}

  render = () => {
    const { models, isLoading } = this.props;
    if (isLoading) return (<Spinner />);

    return (
      <div>
        { models.map((model, id) =>
          <DownloadListItem key={id} model={model} deleteModel={this.props.deleteModel} />
        ).valueSeq() }
      </div>
    );
  }
}

export default compose(
  withProps({ sort: new Map({ time: -1, _id: 1 }) }),
  withSchema('download')
)(ExportDownloadManager);
