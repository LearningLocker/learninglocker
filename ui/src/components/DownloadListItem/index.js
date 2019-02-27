import React from 'react';
import { connect } from 'react-redux';
import { compose, withProps } from 'recompose';
import moment from 'moment-timezone';
import { withPolling } from 'ui/utils/hocs';
import OptionListItem from 'ui/components/OptionListItem';
import { activeOrganisationSettingsSelector } from 'ui/redux/modules/auth';

/**
 * @param {mongoose.Document} download
 * @return {string}
 */
const getDownloadDisplayName = (download) => {
  const expirationDate = download.get('expirationDate');
  if (!expirationDate) {
    return '';
  }

  const expirationMoment = moment(expirationDate);

  if (!expirationMoment) {
    return '';
  }

  const prefix = expirationMoment.isBefore(moment()) ? 'Expired' : 'Expires';
  return ` - (${prefix} ${expirationMoment.fromNow()} - ${expirationMoment.format('YYYY-MM-DD HH:mm:ss')})`;
};


const DownloadListItem = ({ download, deleteDownloadModel }) => {
  const expireExportsString = getDownloadDisplayName(download);
  const isOverADayOld = moment(download.get('time')).isBefore(moment().subtract(1, 'days'));

  if (download.get('isReady') || isOverADayOld) {
    return (
      <OptionListItem
        label={`${download.get('name')}${expireExportsString}`}
        href={download.get('url')}
        icon={(!download.get('isReady') ? (<i className="ion ion-clock" title="This download is pending or has failed" />) : undefined)}
        target="_blank"
        rel="noreferrer noopener"
        onDelete={() => deleteDownloadModel({ id: download.get('_id') })} />
    );
  }

  return (
    <OptionListItem
      icon={<i className="ion ion-clock" title="This download is pending or has failed" />}
      label={download.get('name')} />
  );
};

export default compose(
  withProps(({ download }) => ({
    doWhile: d => !d.get('isReady'),
    id: download.get('_id'),
    schema: 'download',
  })),
  withPolling,
  connect(state => ({
    settings: activeOrganisationSettingsSelector(state)
  }))
)(DownloadListItem);
