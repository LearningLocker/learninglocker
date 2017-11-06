import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { getConnection } from 'lib/connections/mongoose';

const schema = new mongoose.Schema({
  key: String,
  upFn: String
});

schema.plugin(timestamps);

const Migration = getConnection().model('Migration', schema, 'migrations');

export default Migration;
