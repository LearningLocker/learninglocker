import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import { keys } from 'lodash';
import * as scopes from 'lib/constants/scopes';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';

import {
  STAGE_UPLOAD,
  STAGE_CONFIGURE_FIELDS
} from 'lib/constants/personasImport';


const schema = new mongoose.Schema({
  title: { type: String },
  owner: { type: mongoose.Schema.ObjectId, ref: 'User', index: true },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation', index: true },
  isPublic: { type: Boolean, default: false },
  csvHandle: { type: String },
  stage: {
    type: String,
    enum: [STAGE_UPLOAD, STAGE_CONFIGURE_FIELDS],
    default: STAGE_UPLOAD
  },
  csvHeaders: [{
    type: String
  }],
  structure: [
    {
      columnName: { type: String },
      columnType: {
        type: String,
        enum: COLUMN_TYPES
      },
      relatedColumn: { // related column name
        type: String
      },
      primary: {
        type: Number
      }
    }
  ]
});

schema.readScopes = keys(scopes.USER_SCOPES);
schema.writeScopes = schema.readScopes;

schema.plugin(timestamps);
schema.plugin(scopeChecks);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);

schema.index({ organisation: 1, updatedAt: -1, _id: 1 });

export default getConnection().model('PersonasImport', schema, 'personasImports');
