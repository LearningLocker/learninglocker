import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import * as scopes from 'lib/constants/scopes';
import _ from 'lodash';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';

const schema = new mongoose.Schema(
  {
    organisation: {
      type: mongoose.Schema.ObjectId,
      ref: 'Organisation',
      index: true
    },
    owner: { type: mongoose.Schema.ObjectId, ref: 'User', index: true },
    name: { type: String },
    conditions: {
      type: String,
      // set doesn't work here due to a dot notation issue with express-restify-mongoose and mixed type values
      // the value must be cast as a string on the client side before it is sent
      get: (conditions) => {
        if (conditions) {
          return JSON.parse(conditions);
        }
        return {};
      },
      default: '{}'
    },
    isPublic: { type: Boolean, default: false }
  },
  {
    toObject: { getters: true },
    toJSON: { getters: true }
  }
);

schema.readScopes = _.keys(scopes.USER_SCOPES);
schema.writeScopes = schema.readScopes;

schema.plugin(scopeChecks);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);

const Query = getConnection().model('Query', schema, 'queries');
export default Query;
