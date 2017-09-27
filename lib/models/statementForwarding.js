import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import { fromJS } from 'immutable';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import timestamps from 'mongoose-timestamp';
import { STATAMENT_FORWARDING_MAX_RETRIES } from 'lib/constants/statementForwarding';

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
      enum: ['no auth', 'token', 'basic auth'],
      type: String,
      default: 'no auth'
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
      max: STATAMENT_FORWARDING_MAX_RETRIES,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      }
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

schema.methods.getAuthHeaders = function getAuthHeaders() {
  if (!this.configuration.authType || this.configuration.authType === 'token') {
    return fromJS({
      Authorization: `Bearer ${this.configuration.secret}`
    });
  } else if (this.configuration.authType === 'basic auth') {
    const basicAuth1 =
      `${this.configuration.basicUsername}:${this.configuration.basicPassword}`;
    const basicAuth2 = new Buffer(basicAuth1).toString('base64');

    return fromJS({
      Authorization: `Basic ${basicAuth2}`
    });
  }
  return fromJS({});
};

const StatementForwarding = getConnection().model(
  'StatementForwarding', schema, 'statementForwarding'
);

export default StatementForwarding;
