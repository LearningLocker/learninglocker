import SiteSettings from 'lib/models/siteSettings';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import mongoose from 'mongoose';

const objectId = mongoose.Types.ObjectId;

const up = async () => {
  await new SiteSettings({
    _id: objectId(SITE_SETTINGS_ID)
  }).save();
};

const down = async () => {
  const connection = getConnection();
  await connection.collection('siteSettings').drop();
};

export default { up, down };