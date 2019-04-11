import mongoose from 'mongoose';
import moment from 'moment';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import { XAPI_STATEMENTS_DELETE } from 'lib/constants/scopes';
import filterByOrg from 'lib/models/plugins/filterByOrg';

export const asTime = (dateTime) => {
  const format = 'HH:mm:ss';
  return moment(moment(dateTime).format(format), format);
};

const schema = new mongoose.Schema({
  client: { type: mongoose.Schema.ObjectId, ref: 'Client', index: true },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation', index: true },
  pageSize: { // No of documents to delete at a time.
    type: Number,
    default: 1000
  },
  total: {
    type: Number
  },
  deleteCount: {
    type: Number
  },
  // Before scope filter.
  filter: { type: String },
  processing: { type: Boolean, default: false },
  done: { type: Boolean, default: false },
});

schema.readScopes = [XAPI_STATEMENTS_DELETE];
schema.writeScopes = schema.readScopes;

schema.plugin(timestamps);
schema.plugin(scopeChecks);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);

const BatchDelete = getConnection().model('BatchDelete', schema, 'batchDelete');
export default BatchDelete;
