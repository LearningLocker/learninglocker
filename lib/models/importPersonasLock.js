import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';

const schema = new mongoose.Schema({
  ifis: [{
    type: mongoose.Schema.Types.Mixed,
    index: true,
    unique: true
  }],
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation', index: true }
});

export default getConnection().model('ImportPersonasLock', schema, 'importPersonasLock');
