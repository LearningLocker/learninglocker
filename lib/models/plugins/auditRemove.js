import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { getConnection } from 'lib/connections/mongoose';


export const REMOVED = 'REMOVED';


export default function addDeleteAudit( schema, {
  parentName,
  auditName
}) {

  const auditSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.ObjectId, ref: parentName},
    userId: {type: mongoose.Schema.ObjectId, ref: 'User'},
    auditType: { type: String, enum: [REMOVED], default: REMOVED}
  });

  auditSchema.plugin(timestamps);
  const Audit = getConnection().model(auditName, auditSchema);


  schema.statics.auditRemove = async (doc, user) => {
    await new Audit({
      id: doc._id,
      userId: user._id
    }).save();
  }
}