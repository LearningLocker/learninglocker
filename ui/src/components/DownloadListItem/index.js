import React from 'react';
import { withPolling } from 'ui/utils/hocs';
import { compose, withProps } from 'recompose';
import OptionListItem from 'ui/components/OptionListItem';
import moment from 'moment';

const DownloadListItem = ({ model, deleteModel }) => {
  if (model.get('isReady') || moment(model.get('time')).isBefore(moment().subtract(1, 'days'))) {
    return (
      <OptionListItem
        icon={(!model.get('isReady') ? (<i className="ion ion-clock" title="This download is pending or has failed" />) : undefined)}
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
