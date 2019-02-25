
import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import _ from 'lodash';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import timestamps from 'mongoose-timestamp';
import * as scopes from 'lib/constants/scopes';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';

const matchedIndexesSchema = new mongoose.Schema({
  usernameIndex: { type: Number, default: -1 },
  emailIndex: { type: Number, default: -1 },
  firstnameIndex: { type: Number, default: -1 },
  lastnameIndex: { type: Number, default: -1 },
  openIdIndex: { type: Number, default: -1 },
  nameIndex: { type: Number, default: -1 },
  homePageIndex: { type: Number, default: -1 }
});

const customIndexSchema = new mongoose.Schema({
  fieldName: { type: String },
  index: { type: Number, default: -1 }
});

const schema = new mongoose.Schema({
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation', index: true },
  matchedIndexes: { type: matchedIndexesSchema },
  customIndexes: { type: [customIndexSchema] },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  uploadStatus: {
    inProgress: { type: Boolean, default: false },
    totalCount: { type: Number, default: 0, min: 0 },
    remainingCount: { type: Number, default: 0, min: 0 }
  }
});

schema.readScopes = _.keys(scopes.USER_SCOPES);
schema.writeScopes = [scopes.ALL];
schema.plugin(timestamps);

schema.plugin(scopeChecks);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);

const ImportCsv = getConnection().model('ImportCsv', schema, 'importcsv');
export default ImportCsv;
