import mongoose from 'mongoose';
import SiteSettings from 'lib/models/siteSettings';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';

const objectId = mongoose.Types.ObjectId;

export default async function (expireExport) {
  await SiteSettings.update({
    _id: objectId(SITE_SETTINGS_ID),
  }, {
    expireExport: expireExport === 'true'
  }, {
    upsert: true
  }).exec();

  process.exit();
}
