import Download from 'lib/models/download';
import SiteSettings from 'lib/models/siteSettings';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import { get } from 'lodash';
import moment from 'moment';
import { map } from 'bluebird';
import { publish as publishToQueue } from 'lib/services/queue';
import Organisation from 'lib/models/organisation';


const expireExportsForOrgatinasion = async (organisation) => {
  console.log('003');
  const ttl = organisation.settings.EXPIRE_EXPORTS.ttl;

  const todayDate = moment();
  const cutOffDate = todayDate.subtract(ttl, 'seconds');

  await Download.deleteMany({
    // organisation: organisation._id,
    time: { $lt: cutOffDate }
  }).exec();
  console.log('003.1');
};

export default async function ({
  dontExit = false
}) {

  const siteSettings = await SiteSettings.find({
    _id: SITE_SETTINGS_ID
  });
  if(get(siteSettings, 'expireExports', false) === false) {
    if (!dontExit) {
      process.exit();
    }
    return;
  }

  const organisations = await Organisation.find({
    'settings.EXPIRE_EXPORTS.expireExports': true,
  });

  await map(organisations, expireExportsForOrgatinasion);

  console.log('002', organisations);

//   const toDeleteExport = await Download.find({
//     time: { $gt: cutOffDate }
//   });



//   await map(toDeleteExport, async (organisation) => {
//     if (
//       todayDate.isAfter(moment(organisation.settings.EXPIRE_EXPORTS.ttl))
//     ) {
//       await Export.delete();
//     }
//   });
  if (!dontExit) {
    process.exit();
  }
}
