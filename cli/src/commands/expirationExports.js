import Download from 'lib/models/download';
import SiteSettings from 'lib/models/siteSettings';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import { get } from 'lodash';
import moment from 'moment';
import Organisation from 'lib/models/organisation';

/**
 * Remove expired downloads
 *
 * @param {mongoose.Types.ObjectId[]} organisationIds
 * @return {Promise}
 */
const expireExports = async (organisationIds) => {
  const todayDate = moment();
  // const cutOffDate = todayDate.subtract(ttl, 'seconds');

  await Download.remove({
    organisation: { $in: organisationIds },
    upload: { $exists: true },
    expirationDate: { $lt: todayDate } // DEBUG ONLY, uncomment
  });
};

export default async function () {
  const siteSettings = await SiteSettings.findOne({
    _id: SITE_SETTINGS_ID
  });
  if (get(siteSettings, 'expireExports', false) === false) {
    return;
  }

  const organisations = await Organisation.find({
    'settings.EXPIRE_EXPORTS.expireExports': true,
  });
  const organisationIds = organisations.map(o => o._id);

  await expireExports(organisationIds);
}
