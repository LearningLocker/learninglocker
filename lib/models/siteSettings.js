import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';

const schema = new mongoose.Schema({
  dontShowRegistration: { type: Boolean, default: false },
  batchDeleteWindowUTCHour: { type: Number, default: null }, // UTC hour that the window should start at
  batchDeleteWindowUTCMinutes: { type: Number, default: null }, // UTC minute that the window should start at
  batchDeleteWindowDurationSeconds: { type: Number, default: 60 * 60 } // How long the window is open for in secs
});
schema.plugin(timestamps);

export default getConnection().model('SiteSettings', schema, 'siteSettings');
