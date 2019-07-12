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

schema.pre('save', function preSave(next) {
  // make a default client
  if (this.isNew) {
    if (!this.title) {
      this.title = 'New xAPI store';
    }
    const Client = getConnection().model('Client');
    const client = new Client({
      organisation: this.organisation,
      lrs_id: this._id,
      scopes: [scopes.XAPI_ALL],
      title: `${this.title} client`
    });
    client.save((err) => {
      assert.ifError(err);
    });
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

export default getConnection().model('Lrs', schema, 'lrs');
