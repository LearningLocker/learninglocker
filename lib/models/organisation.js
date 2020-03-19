/* eslint-disable import/no-mutable-exports */
import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { getConnection } from 'lib/connections/mongoose';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import UploadSchema from 'lib/models/uploadSchema';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import keys from 'lodash/keys';
import union from 'lodash/union';
import map from 'lodash/map';
import isUndefined from 'lodash/isUndefined';
import {
  VIEW_PUBLIC_DASHBOARDS,
  VIEW_PUBLIC_VISUALISATIONS,
  VIEW_PUBLIC_JOURNEYS
} from 'lib/constants/orgScopes';
import { ALL, USER_SCOPES } from 'lib/constants/scopes';
import auditRemove from 'lib/models/plugins/auditRemove';
import { update$dteTimezoneInDB } from 'lib/helpers/update$dteTimezoneInDB';

let Organisation;

/**
 * @typedef {object} ExpirationNotifications
 *  @property {string} weekBeforeNotificationSent
 *  @property {string} expirationNotificationSent
 */

/**
 * @typedef {object} UsageStats
 *  @property {Date} RUN_DATETIME
 *  @property {Boolean} HAS_CHILDREN
 *  @property {Number} OWN_COUNT
 *  @property {Number} TOTAL_COUNT
 *  @property {Number} OWN_ESTIMATED_BYTES
 *  @property {Number} TOTAL_ESTIMATED_BYTES
 */

/**
 * @typedef {object} Settings
 *  @property {Boolean} LOCKOUT_ENABLED
 *  @property {Number} LOCKOUT_ATTEMPS
 *  @property {Number} LOCKOUT_SECONDS
 *  @property {Boolean} PASSWORD_HISTORY_CHECK
 *  @property {Number} PASSWORD_HISTORY_TOTAL
 *  @property {Number} PASSWORD_MIN_LENGTH
 *  @property {Boolean} PASSWORD_REQUIRE_ALPHA
 *  @property {Boolean} PASSWORD_REQUIRE_NUMBER
 *  @property {Boolean} PASSWORD_USE_CUSTOM_REGEX
 *  @property {String} PASSWORD_CUSTOM_REGEX
 *  @property {String} PASSWORD_CUSTOM_MESSAGE
 */

/**
 * Plain object structure without mongoose model methods
 *
 * @typedef {object} Organisation
 *  @property {string} name
 *  @property {string} logoPath
 *  @property {UploadSchema} logo TODO: define type
 *  @property {string} customColors
 *  @property {Organisation} parent
 *  @property {*} owner TODO: define type
 *  @property {Date} expiration
 *  @property {ExpirationNotifications} expirationNotifications
 *  @property {UsageStats} usageStats
 *  @property {Settings} settings
 *  @property {string} timezone
 */

/** @typedef {module:mongoose.Model<Organisation>} OrganisationModel */

export const EMAIL_NOOP = 'EMAIL_NOOP';
export const EMAIL_PROCESSING = 'EMAIL_PROCESSING';
export const EMAIL_SENT = 'EMAIL_SENT';
export const EMAIL_STATUS = [EMAIL_NOOP, EMAIL_PROCESSING, EMAIL_SENT];

async function validateLockoutAttempt(value) {
  if (this.settings && this.settings.LOCKOUT_ENABLED) {
    if (value < 1) {
      throw new Error('A user should be allowed at least one attempt');
    }
  }
  return true;
}

async function validateLockoutSeconds(value) {
  if (this.settings && this.settings.LOCKOUT_ENABLED) {
    if (value < 5) {
      throw new Error('Must be at least 5 seconds');
    }
  }
  return true;
}

async function validateHistoryTotal(value) {
  if (this.settings && this.settings.LOCKOUT_ENABLED) {
    if (value < 1) {
      throw new Error('At least one password must be stored and checked with this setting enabled');
    }
  }
  return true;
}

async function validateRegEx(value) {
  if (this.settings && this.settings.PASSWORD_USE_CUSTOM_REGEX) {
    try {
      // try and create a regex - a (caught) error will mean an invalid regex
      RegExp(value);
    } catch (e) {
      throw new Error('This RegEx is not valid');
    }
  }
  return true;
}

async function validateMinPasswordLength(value) {
  if (value < 4) {
    throw new Error('Passwords must be more than or equal to 4 characters');
  }
  return true;
}

const schema = new mongoose.Schema({
  name: { type: String },
  logoPath: { type: String },
  logo: { type: UploadSchema },
  customColors: { type: [String], default: [] },
  parent: { type: mongoose.Schema.ObjectId, ref: 'Organisation' },
  owner: { type: mongoose.Schema.ObjectId, ref: 'User' },
  expiration: {
    type: Date,
    set(newValue) {
      this._oldExpiration = this.expiration;
      return newValue;
    }
  }, // when the lisence expires.
  expirationNotifications: {
    weekBeforeNotificationSent: { type: String, enum: EMAIL_STATUS, default: EMAIL_NOOP },
    expirationNotificationSent: { type: String, enum: EMAIL_STATUS, default: EMAIL_NOOP }
  },
  usageStats: {
    RUN_DATETIME: { type: Date },
    HAS_CHILDREN: { type: Boolean },
    OWN_COUNT: { type: Number },
    TOTAL_COUNT: { type: Number },
    OWN_ESTIMATED_BYTES: { type: Number },
    TOTAL_ESTIMATED_BYTES: { type: Number }
  },
  settings: {
    LOCKOUT_ENABLED: { type: Boolean, default: true },
    LOCKOUT_ATTEMPS: {
      type: Number,
      default: 5,
      validate: {
        validator: validateLockoutAttempt,
      },
    },
    LOCKOUT_SECONDS: {
      type: Number,
      default: 1800,
      validate: {
        validator: validateLockoutSeconds,
      },
    },

    // are we checking new (hashed) password against the user's hashed password history
    PASSWORD_HISTORY_CHECK: { type: Boolean, default: true },
    // how many hashed passwords do we store
    PASSWORD_HISTORY_TOTAL: {
      type: Number,
      default: 3,
      validate: {
        validator: validateHistoryTotal,
      },
    },

    PASSWORD_MIN_LENGTH: {
      type: Number,
      default: 8,
      validate: {
        validator: validateMinPasswordLength,
      }
    },
    PASSWORD_REQUIRE_ALPHA: { type: Boolean, default: true },
    PASSWORD_REQUIRE_NUMBER: { type: Boolean, default: false },

    PASSWORD_USE_CUSTOM_REGEX: { type: Boolean, default: false },
    PASSWORD_CUSTOM_REGEX: {
      type: String,
      default: null,
      validate: {
        validator: validateRegEx,
      },
    },
    PASSWORD_CUSTOM_MESSAGE: { type: String, default: null }
  },
  timezone: {
    type: String,
    set(newValue) {
      this._oldTimezone = this.timezone;
      return newValue;
    }
  },
});

schema.plugin(timestamps);

schema.readScopes = keys(USER_SCOPES);
schema.writeScopes = [ALL];

schema.plugin(scopeChecks);
schema.plugin(addCRUDFunctions);
schema.plugin(filterByOrg);

schema.plugin(auditRemove, {
  parentName: 'Organisation',
  auditName: 'OrganisationAudit'
});

/**
 * @param req
 * @param res
 * @param next
 */
schema.statics.readScopeChecks = function runReadScopeChecks(req, res, next) {
  // we should always be allowed to read orgs
  return next();
};

/**
 * Returns an array of org ids that the given client can view limited to the level
 * @param  {Object}   stepIds ids to start with
 * @param  {Object}   cumulativeIds ids found so far
 * @param  {Number}   level  How many levels deep to look for children
 *                           - default 0 (you can see your orgs)
 * @param  {Function} cb     Callback to be called with the result
 */
schema.statics.limitIdsByOrg = function limitIdsByOrg(
  stepIds,
  cumulativeIds,
  level = 0,
  cb
) {
  if (level > 0) {
    Organisation.find({ parent: { $in: stepIds } }, (err, orgs) => {
      const childIds = map(orgs, '_id');
      Organisation.limitIdsByOrg(
        childIds,
        union(childIds, cumulativeIds),
        level - 1,
        cb
      );
    });
  } else {
    cb(cumulativeIds);
  }
};

const createRoles = async (orgModel) => {
  const Role = getConnection().model('Role');

  await Role.create({
    title: 'Observer',
    owner_id: orgModel.owner,
    organisation: orgModel._id,
    scopes: [
      VIEW_PUBLIC_DASHBOARDS,
      VIEW_PUBLIC_VISUALISATIONS,
      VIEW_PUBLIC_JOURNEYS
    ]
  });

  return await Role.create({
    title: 'Admin',
    owner_id: orgModel.owner,
    organisation: orgModel._id,
    scopes: [ALL]
  });
};

const updateOwner = async (orgModel, User, adminRole) => {
  const owner = await User.findById(orgModel.owner);

  if (!owner) {
    return;
  }

  owner.organisations = union(owner.organisations || [], [orgModel._id]);
  owner.organisationSettings = union(
    owner.organisationSettings || [],
    [{
      organisation: orgModel._id,
      roles: [adminRole._id],
    }]
  );

  await owner.save();
};

const createDependencies = async (orgModel, User) => {
  const adminRole = await createRoles(orgModel);
  await updateOwner(orgModel, User, adminRole);
};

const removeDependencies = async (orgModel) => {
  const Role = getConnection().model('Role');
  const User = getConnection().model('User');

  await Role.deleteMany({ organisation: [orgModel._id] });
  await User.updateMany(
    {},
    {
      $pull: {
        organisations: orgModel._id,
        organisationSettings: { organisation: orgModel._id },
      }
    }
  );
};


schema.post('init', function handleInit() {
  this._original = this.toObject();
});

schema.pre('save', async function preSave(next) {
  const User = getConnection().model('User');

  if (!isUndefined(this._oldExpiration) && this.expiration !== this._oldExpiration) {
    this.expirationNotifications.expirationNotificationSent = EMAIL_NOOP;
    this.expirationNotifications.weekBeforeNotificationSent = EMAIL_NOOP;
  }

  if (!isUndefined(this._oldTimezone) && this.timezone !== this._oldTimezone) {
    await update$dteTimezoneInDB(this._id, this.timezone);
  }

  await User.updateMany(
    { ownerOrganisation: this._id },
    { ownerOrganisationSettings: this.settings },
    { runValidators: false },
  );

  if (this.isNew) {
    await createDependencies(this, User);
  }

  next();
});

schema.post('remove', async (orgModel, next) => {
  await removeDependencies(orgModel);
  next();
});

Organisation = getConnection().model('Organisation', schema, 'organisations');
export default Organisation;
