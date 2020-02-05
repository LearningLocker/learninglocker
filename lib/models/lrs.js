import mongoose from 'mongoose';
import assert from 'assert';
import _ from 'lodash';
import timestamps from 'mongoose-timestamp';
import { getConnection } from 'lib/connections/mongoose';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import * as scopes from 'lib/constants/scopes';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import auditRemove from 'lib/models/plugins/auditRemove';

const createDefaultClient = async function () {
  if (!this.title) {
    this.title = 'New xAPI store';
  }
  const ClientModel = getConnection().model('Client');
  const client = new ClientModel({
    organisation: this.organisation,
    lrs_id: this._id,
    scopes: [scopes.XAPI_ALL],
    title: `${this.title} client`
  });
  await client.save((err) => {
    assert.ifError(err);
  });
};

const schema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  owner_id: { type: mongoose.Schema.ObjectId, ref: 'User' },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation', index: true },
  statementCount: { type: Number, default: 0 }
});
schema.plugin(filterByOrg);
schema.plugin(timestamps);
schema.plugin(addCRUDFunctions);

schema.pre('save', async function preSave(next) {
  if (this.isNew) {
    await createDefaultClient.bind(this)();
  }
  next();
});

schema.readScopes = _.keys(scopes.USER_SCOPES);
schema.writeScopes = [scopes.ALL];

schema.plugin(scopeChecks);
schema.plugin(auditRemove, {
  parentName: 'LRS',
  auditName: 'LRSAudit'
});

schema.statics.updateStatementCount = async (lrs) => {
  const Statement = getConnection().model('Statement');

  Statement.countDocuments({ lrs_id: lrs._id }, (err, count) => {
    lrs.statementCount = count;
    lrs.save();
  });
};

schema.statics.decrementStatementCount = async (lrsId) => {
  getConnection()
    .model('Lrs')
    .update({ _id: lrsId }, { $inc: { statementCount: -1 } })
    .exec();
};

export default getConnection().model('Lrs', schema, 'lrs');
