import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';

const schema = new mongoose.Schema({
  dontShowRegistration: { type: Boolean, default: false },
  batchDeleteWindowStartTime: { type: Date },
  batchDeleteWindowDuration: { type: Number, default: 1000 * 60 * 60 } // How long the window is open for in ms
});
schema.plugin(timestamps);

export default getConnection().model('SiteSettings', schema, 'siteSettings');
