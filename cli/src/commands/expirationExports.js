import Download from 'lib/models/download';
import SiteSettings from 'lib/models/siteSettings';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import { get } from 'lodash';
import moment from 'moment';
import { map } from 'bluebird';
import Organisation from 'lib/models/organisation';

const expireExportsForOrgatinasion = async (organisation) => {
  const ttl = organisation.settings.EXPIRE_EXPORTS.ttl;

  const todayDate = moment();
  const cutOffDate = todayDate.subtract(ttl, 'seconds');

  const exports = await Download.find({
    organisation: organisation._id,
    upload: { $exists: true },
    time: { $lt: cutOffDate } // DEBUG ONLY, uncomment
  });


  await map(exports, async (expor) => {
    try {
      await expor.remove();
    } catch (err) {
      console.error('err', err);
    }
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

  await map(organisations, expireExportsForOrgatinasion);

  if (!dontExit) {
    process.exit();
  }
}
