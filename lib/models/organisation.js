/* eslint-disable import/no-mutable-exports */
import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import { minVal } from 'lib/utils/validators/common';
import UploadSchema from 'lib/models/uploadSchema';
import timestamps from 'mongoose-timestamp';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import keys from 'lodash/keys';
import union from 'lodash/union';
import map from 'lodash/map';
import find from 'lodash/find';
import {
  VIEW_PUBLIC_DASHBOARDS,
  VIEW_PUBLIC_VISUALISATIONS,
  VIEW_PUBLIC_JOURNEYS
} from 'lib/constants/orgScopes';
import { ALL, USER_SCOPES } from 'lib/constants/scopes';

let Organisation;

function validateLockoutAttempt(value, respond) {
  // only validate field if lockout is enabled
  if (this.settings && this.settings.LOCKOUT_ENABLED) {
    if (value < 1) {
      respond(false, 'A user should be allowed at least one attempt');
      return;
    }
  }

  respond(true);
}

function validateLockoutSeconds(value, respond) {
  // only validate field if lockout is enabled

  if (this.settings && this.settings.LOCKOUT_ENABLED) {
    if (value < 5) {
      respond(false, 'Must be at least 5 seconds');
      return;
    }
  }

  respond(true);
}

function validateHistoryTotal(value, respond) {
  // only validate field if lockout is enabled
  if (this.settings && this.settings.LOCKOUT_ENABLED) {
    if (value < 1) {
      respond(
        false,
        'At least one password must be stored and checked with this setting enabled'
      );
      return;
    }
  }

  respond(true);
}

function validateRegEx(value, respond) {
  if (this.settings && this.settings.PASSWORD_USE_CUSTOM_REGEX) {
    try {
      // try and create a regex - a (caught) error will mean an invalid regex
      RegExp(this.settings.PASSWORD_CUSTOM_REGEX);
    } catch (e) {
      return respond(false, 'This RegEx is not valid');
    }
  }

  return respond(true);
}

const schema = new mongoose.Schema({
  name: { type: String },
  logoPath: { type: String },
  logo: { type: UploadSchema },
  parent: { type: mongoose.Schema.ObjectId, ref: 'Organisation' },
  owner: { type: mongoose.Schema.ObjectId, ref: 'User' },
  settings: {
    LOCKOUT_ENABLED: { type: Boolean, default: true },
    // number of attempts before lock out
    LOCKOUT_ATTEMPS: {
      type: Number,
      default: 5,
      validate: validateLockoutAttempt
    },
    // 30 minute lock out peiod
    LOCKOUT_SECONDS: {
      type: Number,
      default: 1800,
      validate: validateLockoutSeconds
    },

    // are we checking new (hashed) password against the user's hashed password history
    PASSWORD_HISTORY_CHECK: { type: Boolean, default: true },
    // how many hashed passwords do we store
    PASSWORD_HISTORY_TOTAL: {
      type: Number,
      default: 3,
      validate: validateHistoryTotal
    },

    PASSWORD_MIN_LENGTH: {
      type: Number,
      default: 8,
      validate: minVal.bind(null, 4, 'Passwords must be more than 4 characters')
    },
    PASSWORD_REQUIRE_ALPHA: { type: Boolean, default: true },
    PASSWORD_REQUIRE_NUMBER: { type: Boolean, default: false },

    PASSWORD_USE_CUSTOM_REGEX: { type: Boolean, default: false },
    PASSWORD_CUSTOM_REGEX: {
      type: String,
      default: null,
      validate: validateRegEx
    },
    PASSWORD_CUSTOM_MESSAGE: { type: String, default: null }
  }
});

schema.plugin(timestamps);

schema.readScopes = keys(USER_SCOPES);
schema.writeScopes = [ALL];

schema.plugin(scopeChecks);
schema.plugin(addCRUDFunctions);
schema.plugin(filterByOrg);

schema.statics.readScopeChecks = function runReadScopeChecks(req, res, next) {
  // we should always be allowed to read orgs
  return next();
};

/**
 * Returns an array of org ids that the given client can view limited to the level
 * @param  {Object}   orgIds ids to start with
 * @param  {Object}   totalIds ids found so far
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

schema.post('init', function handleInit() {
  this._original = this.toObject();
});

schema.pre('save', async function preSave(next) {
  const User = getConnection().model('User');
  const Role = getConnection().model('Role');

  // https://github.com/Automattic/mongoose/issues/1474
  this.wasNew = this.isNew;

  const organisation = this;
  const objectId = mongoose.Types.ObjectId;

  // https://github.com/Automattic/mongoose/issues/1474
  if (organisation.wasNew) {
    const createAdminRole = await Role.create({
      title: 'Admin',
      owner_id: organisation.owner,
      organisation: organisation._id,
      scopes: [ALL]
    });

    const createObserverRole = await Role.create({
      title: 'Observer',
      owner_id: organisation.owner,
      organisation: organisation._id,
      scopes: [
        VIEW_PUBLIC_DASHBOARDS,
        VIEW_PUBLIC_VISUALISATIONS,
        VIEW_PUBLIC_JOURNEYS
      ]
    });

    const owner = await User.findById(objectId(organisation.owner));
    if (owner) {
      // add this org to the creator's allowed orgs
      const newRoles = [createAdminRole._id];

      const existingOrganisationSettings = owner.organisationSettings || [];
      let updatedSettings = existingOrganisationSettings;

      // check if the user has settings for this org
      const existingOS = find(existingOrganisationSettings, setting =>
         setting.organisation.toString() === organisation._id.toString()
      );

      if (existingOS) {
        const updatedOS = existingOS;
        // if the setting already exists, update it
        if (updatedOS.roles) {
          // union the roles if exist
          updatedOS.roles = union(updatedOS.roles, newRoles);
        } else {
          // set the new roles if no previous roles exist
          updatedOS.roles = newRoles;
        }

        // loop through to create the updated settings array
        updatedSettings = map(updatedSettings, (os) => {
          if (os.organisation.toString() === organisation._id.toString()) {
            // return the updated settings into the array
            return updatedOS;
          }
        });
      } else {
        // insert a new item
        updatedSettings.push({
          organisation: organisation._id,
          roles: newRoles
        });
      }

      // update the settings on the owner
      owner.organisations = union(owner.organisations, [organisation._id]);
      owner.organisationSettings = updatedSettings;

      await owner.save();
    }

    await Promise.all([createAdminRole, createObserverRole]);
  }

  next();
});

Organisation = getConnection().model('Organisation', schema, 'organisations');
export default Organisation;
