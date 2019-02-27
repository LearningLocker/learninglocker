import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';

const schema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.ObjectId, ref: 'Client' },
  accessToken: { type: String },
  createdAt: { type: Date },
  expireAt: { type: Date }
});

const OAuthToken = getConnection().model('OAuthToken', schema, 'oAuthTokens');
export default OAuthToken;
