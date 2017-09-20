import React from 'react';
import { withPolling } from 'ui/utils/hocs';
import { compose, withProps } from 'recompose';
import OptionListItem from 'ui/components/OptionListItem';

const DownloadListItem = ({ model, deleteModel }) => {
  if (model.get('isReady')) {
    return (
      <OptionListItem
        label={model.get('name')}
        href={model.get('url')}
        target="_blank"
        rel="noreferrer noopener"
        onDelete={() => deleteModel({ id: model.get('_id') })} />
    );
  }

  return (
    <OptionListItem
      icon={<i className="ion ion-clock" title="This download is pending or has failed" />}
      label={model.get('name')} />
  );
};

export default compose(
  withProps(({ model }) => ({
    doWhile: download => !download.get('isReady'),
    id: model.get('_id'),
    schema: 'download'
  })),
  withPolling
)(DownloadListItem);
