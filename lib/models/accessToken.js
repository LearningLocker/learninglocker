import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';

const schema = new mongoose.Schema({
  token: { type: String, index: true },
  expirationDate: { type: Date },
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  client: { type: mongoose.Schema.ObjectId, ref: 'Client' },
  scopes: { type: [String] }
}, { strict: false });

const AccessToken = getConnection().model('AccessToken', schema, 'accessToken');
export default AccessToken;
