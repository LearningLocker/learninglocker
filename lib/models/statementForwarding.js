import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import { fromJS } from 'immutable';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import timestamps from 'mongoose-timestamp';
import { getAuthHeaders } from 'lib/helpers/statementForwarding';
import { AUTH_TYPES, AUTH_TYPE_NO_AUTH } from 'lib/constants/statementForwarding';
import { toLower } from 'lodash';

const schema = new mongoose.Schema({
  description: { type: String },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation', index: true },
  lrs_id: { type: mongoose.Schema.ObjectId, ref: 'Lrs', index: true },
  active: { type: Boolean },
  configuration: {
    protocol: {
      enum: ['http', 'https'],
      type: String,
      default: 'http'
    },
    url: {
      validate: {
        validator: value =>
          !/^https?:\/\//.test(value),
        message: 'Don\'t include http://'
      },
      required: function urlRequired() {
        const immutableSchema = fromJS(this.toObject());
        return immutableSchema.get('active', false) &&
          true;
      },
      type: String
    },
    authType: {
      enum: AUTH_TYPES,
      type: String,
      default: AUTH_TYPE_NO_AUTH,
      validate: {
        validator: function headerValidator(value) {
          if (value === AUTH_TYPE_NO_AUTH) {
            return true;
          }

          const model = fromJS(this.toObject());
          const headers = fromJS(JSON.parse(model.getIn(['configuration', 'headers'], '{}')));

          const lowercaseKeys = headers.keySeq().map(item => toLower(item));

          if (lowercaseKeys.includes('authorization')) {
            return false;
          }
          return true;
        },
        message: 'Headers already contains an Authorisation header'
      }
    },
    secret: {
      type: String,
      required: function seceretRequired() {
        const immutableSchema = fromJS(this.toObject());
        return immutableSchema.get('active', false) &&
          (immutableSchema.getIn(['configuration', 'authType'], 'token') === 'token');
      }
    },
    basicUsername: {
      type: String,
      required: function basicUsernameRequired() {
        const immutableSchema = fromJS(this.toObject());
        return immutableSchema.get('active', false) &&
          (immutableSchema.getIn(['configuration', 'authType'], 'token') === 'basic auth');
      }
    },
    basicPassword: {
      type: String,
      required: function basicPasswordRequired() {
        const immutableSchema = fromJS(this.toObject());
        return immutableSchema.get('active', false) &&
          (immutableSchema.getIn(['configuration', 'authType'], 'token') === 'basic auth');
      }
    },
    maxRetries: {
      type: Number,
      min: 0,
      max: 1000,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      }
    },
    headers: {
      type: String, // Can't be object, because can't delete - https://github.com/florianholzapfel/express-restify-mongoose/issues/276.
      validate: [{
        validator: function validateAuthHeaders(value) {
          try {
            const model = fromJS(this.toObject());
            const headers = fromJS(JSON.parse(value));

            const lowercaseKeys = headers.keySeq().map(item => toLower(item));

            if (
              model.getIn(['configuration', 'authType'], AUTH_TYPE_NO_AUTH) !== AUTH_TYPE_NO_AUTH &&
              lowercaseKeys.includes('authorization')
            ) {
              return false;
            }
          } catch (err) {
            console.error(err);
          }

          return true;
        },
        message: 'Header can not contain Authorisation if Authorisation is set',
      }, {
        validator: function validateHeaders(value) {
          const headers = fromJS(JSON.parse(value));
          const lowercaseKeys = headers.keySeq().map(item => toLower(item));

          if (
            lowercaseKeys.includes('content-type') ||
            lowercaseKeys.includes('content-length')
          ) {
            return false;
          }
          return true;
        },
        message: 'Headers can not contain Content-Type or Content-Length'
      }]
    }
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  query: { type: String },
  isPublic: { type: Boolean, default: false }
});

schema.index({ organisation: 1, timestamp: -1, _id: 1 });

schema.plugin(scopeChecks);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);
schema.plugin(timestamps);

schema.methods.getAuthHeaders = function schemeGetAuthHeaders() {
  return getAuthHeaders(this);
};

schema.methods.getAuthHeaders = function getHeaders() {
  return fromJS(this.configuration.headers || {});
};

const StatementForwarding = getConnection().model(
  'StatementForwarding', schema, 'statementForwarding'
);

export default StatementForwarding;
