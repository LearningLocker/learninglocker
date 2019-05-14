import SiteSettings from 'lib/models/siteSettings';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import { getConnection } from 'lib/connections/mongoose';
import logger from 'lib/logger';
import mongoose from 'mongoose';

const objectId = mongoose.Types.ObjectId;

const up = async () => {
  try {
    await new SiteSettings({
      _id: objectId(SITE_SETTINGS_ID)
    }).save();
  } catch (err) {
    if (err.code === 11000) return;
    logger.error(err);
  }
};

const down = async () => {
  const connection = getConnection();
  await connection.collection('siteSettings').drop();
};

export default { up, down };
