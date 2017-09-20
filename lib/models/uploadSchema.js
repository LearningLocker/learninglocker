import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';

const schema = new mongoose.Schema({
  mime: { type: String },
  key: { type: String },
  repo: { type: String },
}, { _id: false });

schema.plugin(timestamps);

export default schema;
