import Download from 'lib/models/download';
import SiteSettings from 'lib/models/siteSettings';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import { get } from 'lodash';
import moment from 'moment';
import { map } from 'bluebird';
import Organisation from 'lib/models/organisation';
// import { deleteFromPath } from 'lib/services/files/storage/local';
import { factory } from 'lib/services/files/storage';


const expireExportsForOrgatinasion = async (organisation) => {
  console.log('003');
  const ttl = organisation.settings.EXPIRE_EXPORTS.ttl;

  const todayDate = moment();
  const cutOffDate = todayDate.subtract(ttl, 'seconds');

  // await Download.deleteMany({
  //   organisation: organisation._id,
  //   time: { $lt: cutOffDate }
  // }).exec();

  const exports = await Download.find({
    organisation: organisation._id,
    upload: { $exists: true }
    //   time: { $lt: cutOffDate } // DEBUG ONLY, uncomment
  });


  await map(exports, async (expor) => {
    const repo = factory(expor.upload.repo);
    try {
      await repo.deleteFromPath(expor.upload.key);
    } catch (err) {
      console.error('err', err);
    }

    await Download.findByIdAndRemove(expor._id);
  });

  console.log('003.1', exports);
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
