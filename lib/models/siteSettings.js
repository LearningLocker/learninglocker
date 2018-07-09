import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';

const schema = new mongoose.Schema({
  dontShowRegistration: { type: Boolean, default: false },
  expireExports: { type: Boolean, default: false }
});
schema.plugin(timestamps);

export default getConnection().model('SiteSettings', schema, 'siteSettings');
