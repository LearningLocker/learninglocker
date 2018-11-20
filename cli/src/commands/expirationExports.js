import Download from 'lib/models/download';
import SiteSettings from 'lib/models/siteSettings';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import { get } from 'lodash';
import moment from 'moment';
import { map } from 'bluebird';
import Organisation from 'lib/models/organisation';

const expireExportsForOrganisation = async (organisation) => {
  const todayDate = moment();
  // const cutOffDate = todayDate.subtract(ttl, 'seconds');

  await Download.remove({
    organisation: organisation._id,
    upload: { $exists: true },
    expireTTL: { $lt: todayDate } // DEBUG ONLY, uncomment
  });
};

export default async function ({
  dontExit = false
}) {
  const siteSettings = await SiteSettings.findOne({
    _id: SITE_SETTINGS_ID
  });
  if (get(siteSettings, 'expireExports', false) === false) {
    if (!dontExit) {
      process.exit();
    }
    return;
  }

  const organisations = await Organisation.find({
    'settings.EXPIRE_EXPORTS.expireExports': true,
  });

  await map(organisations, expireExportsForOrganisation);

  if (!dontExit) {
    process.exit();
  }
}
