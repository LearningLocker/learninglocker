import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import assert from 'assert';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import * as scopes from 'lib/constants/scopes';
import _ from 'lodash';
import timestamps from 'mongoose-timestamp';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';

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

schema.statics.updateStatementCount = (lrs, cb) => {
  const Statement = getConnection().model('Statement');

  Statement.count({ lrs_id: lrs._id }, (err, count) => {
    lrs.statementCount = count;
    lrs.save((err, res) => {
      cb(err, res);
    });
  });
};

export default getConnection().model('Lrs', schema, 'lrs');
