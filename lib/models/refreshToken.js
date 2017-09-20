import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';

const schema = new mongoose.Schema({
  refreshToken: { type: String },
  expirationDate: { type: Date },
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  client: { type: mongoose.Schema.ObjectId, ref: 'Client' },
});

const RefreshToken = getConnection().model('RefreshToken', schema, 'refreshToken');
export default RefreshToken;
