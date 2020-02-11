import bcrypt from 'bcrypt';
import _ from 'lodash';
import moment from 'moment';
import mongoose from 'mongoose';
import findOrCreate from 'mongoose-findorcreate';
import timestamps from 'mongoose-timestamp';
import { getConnection } from 'lib/connections/mongoose';
import * as scopes from 'lib/constants/scopes';
import { sendNewUser } from 'lib/helpers/email';
import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import auditRemove from 'lib/models/plugins/auditRemove';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import { runScopeChecks } from 'lib/models/plugins/scopeChecks';
import Organisation from 'lib/models/organisation';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import getUserIdFromAuthInfo from 'lib/services/auth/authInfoSelectors/getUserIdFromAuthInfo';
import { validatePasswordUtil } from 'lib/utils/validators/User';

/**
 * @typedef {object} PasswordHistoryItem
 *  @property {string} hash
 *  @property {Date} date
 */

/**
 * @typedef {object} ResetTokensItem
 *  @property {string} token
 *  @property {Date} expires
 */

/**
 * @typedef {object} UserSettings
 *  @property {boolean} CONFIRM_BEFORE_DELETE
 */

/**
 * @typedef {object} OrganisationSettings
 * organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation', index: true, required: true },
 *  @property {string[]} scopes
 *  @property {object[]} roles - TODO: define type
 *  @property {string} filter
 *  @property {string} oldFilter
 *  @property {string} timezone
 */

/**
 * @typedef {object} OwnerOrganisationSettings
 *  @property {boolean} LOCKOUT_ENABLED
 *  @property {number} LOCKOUT_ATTEMPS
 *  @property {number} LOCKOUT_SECONDS
 *  @property {boolean} PASSWORD_HISTORY_CHECK
 *  @property {number} PASSWORD_HISTORY_TOTAL
 *  @property {number} PASSWORD_MIN_LENGTH
 *  @property {boolean} PASSWORD_REQUIRE_ALPHA
 *  @property {boolean} PASSWORD_REQUIRE_NUMBER
 *  @property {boolean} PASSWORD_USE_CUSTOM_REGEX
 *  @property {string} PASSWORD_CUSTOM_REGEX
 *  @property {string} PASSWORD_CUSTOM_MESSAGE
 */

/**
 * Plain object structure without mongoose model methods
 * @typedef {object} User
 *  @property {string} name
 *  @property {string} email
 *  @property {object[]} organisations - TODO: define type
 *  @property {OrganisationSettings[]} organisationSettings
 *  @property {string} imageUrl
 *  @property {string} googleId
 *  @property {string} password
 *  @property {object} ownerOrganisation - TODO: define type
 *  @property {OwnerOrganisationSettings} ownerOrganisationSettings
 *  @property {UserSettings} settings
 *  @property {string[]} scopes
 *  @property {boolean} verified
 *  @property {ResetTokensItem[]} resetTokens
 *  @property {PasswordHistoryItem[]} passwordHistory
 *  @property {Date} authLastAttempt
 *  @property {number} authFailedAttempts
 *  @property {Date} authLockoutExpiry
 *  @property {boolean} hasBeenMigrated
 */

/** @typedef {module:mongoose.Model<User>} UserModel */

/**
 * @param {string} value
 * @returns {true} if validation is success
 * @throws {Error} if validation is failure
 */
async function validatePassword(value) {
  // don't validate the password if not modified (it will be the hash!!)
  if (!this.isModified('password')) {
    return true;
  }

  if (value.length < 1) {
    return true;
  }

  const result = validatePasswordUtil(value, this.ownerOrganisationSettings);

  const shouldTestHistoryCheck =
    this.ownerOrganisationSettings.PASSWORD_HISTORY_CHECK &&
    this.ownerOrganisationSettings.PASSWORD_HISTORY_TOTAL > 0;

  if (shouldTestHistoryCheck) {
    // password matching recent N passwords is not allowed.
    // N is this.ownerOrganisationSettings.PASSWORD_HISTORY_TOTAL.
    const sortedHistory = _.sortBy(this.passwordHistory, 'date')
      .slice(-1 * this.ownerOrganisationSettings.PASSWORD_HISTORY_TOTAL);

    for (let i = 0; i < sortedHistory.length; i += 1) {
      const matched = await bcrypt.compare(value, sortedHistory[i].hash);
      if (matched) {
        const messages = [
          ...result.messages,
          `This is one of your last ${this.ownerOrganisationSettings.PASSWORD_HISTORY_TOTAL} passwords - please use a different password.`,
        ];
        throw new Error(messages.join(', '));
      }
    }
  }

  if (result.success) {
    return true;
  }
  throw new Error(result.messages.join(', '));
}

// TODO: Remove `organisationSettings.oldFilter` and `hasBeenMigrated` after we confirm success of $in migration
/** @class UserSchema */
const schema = new mongoose.Schema({
  name: { type: String },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    index: { unique: true },
    validate: {
      validator: async function emailValidator(value) {
        const found =
          await User.countDocuments({ email: value, _id: { $ne: this._id } }); // eslint-disable-line no-use-before-define
        if (found) {
          throw new Error('Email already exists');
        }
        return true;
      }
    }
  },
  organisations: [{ type: mongoose.Schema.ObjectId, ref: 'Organisation', index: true }],
  organisationSettings: [{
    organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation', index: true, required: true },
    scopes: [{ type: String }],
    roles: [{ type: mongoose.Schema.ObjectId, ref: 'Role' }],
    filter: { type: String, default: '{}' },
    oldFilter: { type: String, default: undefined },
    timezone: { type: String },
  }],
  imageUrl: { type: String },
  googleId: { type: String },

  password: {
    type: String,
    validate: {
      validator: validatePassword
    }
  },

  // because we can edit a user from many different organisations,
  // we store the user's OWNER organisation's id
  ownerOrganisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation', index: true },

  // this can then be used to fetch that organisations settings,
  // which are also stored on the user to prevent multiple lookups to the organisation
  // these fields should be updated across all appropriately
  // "owned" users when the organisation's settings are updated
  ownerOrganisationSettings: {
    LOCKOUT_ENABLED: { type: Boolean, default: true },
    // TODO: fix typo 🤨
    LOCKOUT_ATTEMPS: { type: Number, default: 5 }, // number of attempts before lock out
    LOCKOUT_SECONDS: { type: Number, default: 1800 }, // 30 minute lock out period

    // are we checking new (hashed) password against the user's hashed password history
    PASSWORD_HISTORY_CHECK: { type: Boolean, default: true },
    // how many hashed passwords do we store
    PASSWORD_HISTORY_TOTAL: { type: Number, default: 3 },

    PASSWORD_MIN_LENGTH: { type: Number, default: 8 },
    PASSWORD_REQUIRE_ALPHA: { type: Boolean, default: true },
    PASSWORD_REQUIRE_NUMBER: { type: Boolean, default: true },
    PASSWORD_USE_CUSTOM_REGEX: { type: Boolean, default: false },
    PASSWORD_CUSTOM_REGEX: { type: String, default: null },
    PASSWORD_CUSTOM_MESSAGE: { type: String, default: null }
  },

  // user specific settings (not inherited from the org)
  settings: {
    CONFIRM_BEFORE_DELETE: { type: Boolean, default: true }
  },
  scopes: [{ type: String }],
  verified: { type: Boolean, default: false },
  resetTokens: [{
    token: { type: String },
    expires: { type: Date }
  }],

  // store the users hashed password history
  passwordHistory: {
    type: [{
      hash: { type: String },
      date: { type: Date }
    }],
    default: []
  },

  // auth specific values
  authLastAttempt: { type: Date, default: null },
  authFailedAttempts: { type: Number, default: 0 },
  authLockoutExpiry: { type: Date, default: null },

  hasBeenMigrated: { type: Boolean, default: false }
});

schema.readScopes = _.keys(scopes.USER_SCOPES);
schema.writeScopes = [scopes.ALL];

schema.plugin(findOrCreate);
schema.plugin(timestamps);
schema.plugin(addCRUDFunctions);
schema.plugin(filterByOrg);
schema.plugin(auditRemove, {
  parentName: 'User',
  auditName: 'UserAudit'
});

schema.methods.createResetToken = function createResetToken(next, expires = 24) {
  bcrypt.hash(this.email, 8, (err, token) => {
    if (err) return next(err);

    let expiresDate = null;
    // if an expiry is passed or set, then create a date the token will expire
    if (expires && expires > 0) {
      expiresDate = moment().add({ hours: expires }).toDate();
    }

    // return the token and expiry as an object to the callback
    // this if the format that resetTokens are stored in the user document
    return next({ token, expires: expiresDate });
  });
};

// CUSTOM PLUGIN IMPLEMENTATION

const removeFields = (fields, body) => {
  if (_.isArray(body)) {
    return _.map(body, model => _.omit(model, fields));
  }
  return _.omit(body, fields);
};

schema.statics.readScopeChecks = function runReadScopeChecks(req, res, next) {
  // we should always be allowed to read users
  return next();
};

schema.statics.writeScopeChecks = function runWriteScopeChecks(req, res, next) {
  const model = this;
  const authInfo = getAuthFromRequest(req);
  if (
    req.params.id && req.params.id.toString()
    && req.params.id.toString() === getUserIdFromAuthInfo(authInfo).toString()) {
    // allow the user to write to themselves, but prevent them from overwriting their scopes
    req.body = removeFields(['scopes'], req.body);
    return next();
  }

  return runScopeChecks(model, 'writeScopes', req, res, next);
};

schema.statics.getOrgFilterFromAuth = async function getOrgFilterFromAuth(authInfo, baseQuery = {}) {
  const orgId = getOrgFromAuthInfo(authInfo);
  if (orgId) {
    return {
      $and: [{
        organisations: { $in: [orgId] },
      }, baseQuery]
    };
  }
  return {
    $and: [{
      _id: getUserIdFromAuthInfo(authInfo),
    }, baseQuery]
  };
};

/**
 * Check the user to see if they already exist in the db
 * If they do then we will simply append the organisations on the existing user
 * to the one we are attempting to create/update
 * Otherwise, we should set the ownerOrganisation
 * @param  {Object}   user The user we are attempting to create
 * @param  {Function} next
 */
const checkNewUser = (user, next) => {
  if (user.isNew) {
    // check if email is taken
    const User = getConnection().model('User');
    User.findOne({ email: user.email }, (err, existingUser) => {
      if (existingUser) {
        // Create a unique merge of organisations from the existing user and the passed payload
        existingUser.organisations = _.unionBy(
          user.organisations,
          existingUser.organisations,
          _.toString
        );

        const existingSettings = existingUser.organisationSettings || [];
        // map across all the organisations on this user
        const newSettings = _.map(existingUser.organisations, (org) => {
          const orgId = org.toString();
          // if a setting exists for this organisation, return it
          const exists = _.find(existingSettings, setting =>
            setting.organisation.toString() === orgId
          );
          if (exists) {
            return exists;
          }

          // otherwise return a blank default
          return {
            organisation: orgId,
            scopes: []
          };
        });
        existingUser.organisationSettings = newSettings;
        next(existingUser);
      } else {
        user.ownerOrganisation = user.organisations[0];

        // send an email to new users
        user.createResetToken((token) => {
          // this method is used as part of the pre save hook, so no need to save the user at this time
          user.resetTokens.push(token);
          // send email to the new user
          sendNewUser(user, token);

          next(user);
        });
      }
    });
  } else {
    next(user);
  }
};

/**
 * Run checks over the incoming password
 * @param  {Object}   user
 * @param  {Function} next
 */
const preSavePasswordCheck = (user, next) => {
  // having a google id or password set means that the user is verified
  if (!user.verified && (user.password || user.googleId)) {
    user.verified = true;
  }

  let preventPasswordHash = false;
  if (_.get(user, 'password', '').length === 0) {
    preventPasswordHash = true;
    const originalPassword = _.get(user._original, 'password', '');
    user.password = originalPassword;
  }

  // if the user has a new or changed password, hash it before saving
  if (!preventPasswordHash && user.isModified('password')) {
    bcrypt.hash(user.password, 8, (err, hash) => {
      if (err) return next(err);
      // override the cleartext password with the hashed one
      user.password = hash;

      // clear down any lockouts
      user.authFailedAttempts = 0;
      user.authLockoutExpiry = null;

      // pull the password history out of the user
      const filteredHistory = _.filter(user.passwordHistory, (pwH) => {
        const pwObj = pwH.toObject();
        return _.has(pwObj, 'hash') && _.has(pwObj, 'date');
      });

      filteredHistory.push({
        date: new Date(),
        hash
      });

      // if the length is greater than the allowed total on the owner org settings, trim it down
      if (filteredHistory.length > user.ownerOrganisationSettings.PASSWORD_HISTORY_TOTAL) {
        const sortedHistory = _.sortBy(filteredHistory, 'date');
        user.passwordHistory = _.slice(sortedHistory, filteredHistory.length - user.ownerOrganisationSettings.PASSWORD_HISTORY_TOTAL);
      } else {
        user.passwordHistory = filteredHistory;
      }
      next();
    });
  } else {
    next();
  }
};

schema.post('init', function handleInit() {
  this._original = this.toObject();
});

schema.pre('save', async function preSave(next) {
  if (this.isNew) {
    const organisation = await Organisation.findOne({ _id: this.ownerOrganisation });
    if (!organisation) {
      next();
      return;
    }
    const { settings } = organisation;
    this.ownerOrganisationSettings = settings;
    next();
  } else {
    next();
  }
});

schema.pre('validate', function handlePreSave(next) {
  const user = this;
  checkNewUser(user, (checkedUser) => {
    _.merge(user, checkedUser);

    // Ensure no duplicate organisations are present
    user.organisations = _.uniqBy(user.organisations, _.toString);

    // Ensure that an owner organisation is set
    // This should have been handled by checkNewUser, but this will pick up any strays
    if (!user.ownerOrganisation) {
      user.ownerOrganisation = user.organisations[0];
    }

    // If the user has no organisation settings, grab the owner org and attach its settings
    if (user.isNew) {
      Organisation.findOne({ _id: user.ownerOrganisation }, (err, org) => {
        if (err) {
          throw err;
        }

        // Set the settings into the user, the schema should trim any that are not allowed
        if (org) {
          user.ownerOrganisationSettings = org.settings;
        }

        // Carry on with password checks
        next();
      });
    }

    // Proceed with password checks
    next();
  });
});

schema.pre('save', function handlePostSave(next) {
  const user = this;
  preSavePasswordCheck(user, next);
});

const User = getConnection().model('User', schema, 'users');

export default User;
