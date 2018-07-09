import React from 'react';
import { withPolling } from 'ui/utils/hocs';
import { compose, withProps } from 'recompose';
import OptionListItem from 'ui/components/OptionListItem';
import { activeOrganisationSettingsSelector } from 'ui/redux/modules/auth';
import { connect } from 'react-redux';
import moment from 'moment';
import createdAt from 'ui/containers/Owner/CreatedAt';

const DownloadListItem = (props) => {
  const { download, deleteDownloadModel, exporationExport } = props;

  const expireExports = moment(download.get('time')).add(exporationExport.get('ttl'), 'seconds');
  const formattedExpireExports = createdAt(expireExports, 'Expires');

  if (download.get('isReady')) {
    return (
      <OptionListItem
        label={`${download.get('name')} - (${formattedExpireExports})`}
        href={download.get('url')}
        target="_blank"
        rel="noreferrer noopener"
        onDelete={() => deleteDownloadModel({ id: download.get('_id') })} 
        />
    );
  }

  return (
    <OptionListItem
      icon={<i className="ion ion-clock" title="This download is pending or has failed" />}
      label={download.get('name')} />
  );
};

export default compose(
  withProps(({ model, deleteModel }) => ({
    doWhile: download => !download.get('isReady'),
    id: model.get('_id'),
    schema: 'download',
    deleteDownloadModel: deleteModel
  })),
  withPolling,
  withProps(({ model }) => ({
    download: model,
  })),
  connect(state => ({
    settings: activeOrganisationSettingsSelector(state)
  }))
)(DownloadListItem);
