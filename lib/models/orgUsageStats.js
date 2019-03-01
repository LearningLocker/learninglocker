/* eslint-disable import/no-mutable-exports */
import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';

const schema = new mongoose.Schema({
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' },
  children: [{ type: mongoose.Schema.ObjectId, ref: 'Organisation' }],
  name: { type: String },
  date: { type: Date },
  totalPercentage: { type: Number },

  // usage of a organisation
  ownCount: { type: Number },
  ownEstimatedBytes: { type: Number },

  // usage of a organisation and its children
  totalCount: { type: Number },
  totalEstimatedBytes: { type: Number },
});

const OrgUsageStats = getConnection().model('OrgUsageStats', schema, 'orgUsageStats');
export default OrgUsageStats;
