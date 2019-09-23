import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { getConnection } from 'lib/connections/mongoose';
import logger from 'lib/logger';
import { isUndefined } from 'lodash';

export const REMOVED = 'REMOVED';

const auditSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.ObjectId },
  name: { type: String },
  model: { type: String },
  userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: false },
  clientId: { type: mongoose.Schema.ObjectId, ref: 'Client', required: false },
  auditType: { type: String, enum: [REMOVED], default: REMOVED },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' },
  metadata: { type: mongoose.Schema.Types.Mixed }
});

auditSchema.plugin(timestamps);
const Audit = getConnection().model('Audit', auditSchema);

export default function addDeleteAudit(schema, {
  parentName
}) {
  schema.statics.auditRemove = async (doc, user) => {
    let clientId;
    let userId;
    try {
      if (user.authInfo && user.authInfo.token.userId) {
        userId = user.authInfo.token.userId;
      } else {
        clientId = user._id;
      }
    } catch (err) {
      logger.error('no userId or clientId found', err);
      return;
    }

    const metadata = {};
    if (!isUndefined(doc.statementCount)) {
      metadata.statementCount = doc.statementCount;
    }
    if (!isUndefined(doc.organisations)) {
      metadata.email = doc.email;
      metadata.organisations = doc.organisations;
    }
    if (parentName === 'Client') {
      metadata.api = doc.api;
      if (!isUndefined(doc.lrs_id)) {
        metadata.lrs_id = doc.lrs_id;
      }
    }

    await new Audit({
      id: doc._id,
      model: parentName,
      userId,
      clientId,
      organisation: doc.organisation,
      name: doc.title || doc.name,
      metadata
    }).save();
  };
}
