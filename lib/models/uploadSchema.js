import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';

/**
 * Plain object structure without mongoose model methods
 *
 * @typedef {object} UploadSchema
 *  @property {string} mime
 *  @property {string} key
 *  @property {string} repo
 */

/**
 * @type {module:mongoose.Schema<UploadSchema>}
 */
const schema = new mongoose.Schema({
  mime: { type: String },
  key: { type: String },
  repo: { type: String },
}, { _id: false });

schema.plugin(timestamps);

export default schema;
