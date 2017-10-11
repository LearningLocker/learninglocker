import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import * as scopes from 'lib/constants/scopes';
import keys from 'lodash/keys';
import timestamps from 'mongoose-timestamp';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import User from 'lib/models/user';

const schema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  owner_id: { type: mongoose.Schema.ObjectId, ref: 'User' },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation', index: true },
  scopes: [{ type: String }]
});
schema.plugin(filterByOrg);
schema.plugin(timestamps);
schema.plugin(addCRUDFunctions);

schema.readScopes = keys(scopes.USER_SCOPES);
schema.writeScopes = [scopes.ALL];

schema.plugin(scopeChecks);

export const canDelete = async (role) => {
  const found = await Role.count({ // eslint-disable-line no-use-before-define
    _id: { $ne: role._id },
    organisation: role.organisation
  });

  if (found === 0) {
    return false;
  }
  return true;
};

export const hasUser = async (role) => {
  const found = await User.count({
    organisationSettings: {
      $elemMatch: {
        roles: {
          $elemMatch: {
            $eq: role._id
          }
        }
      }
    }
  });

  if (found > 0) {
    return true;
  }

  return false;
};

schema.pre('remove', async function handlePreRemove(next) {
  const role = this;

  if (!await canDelete(role)) { // This is the last role, so don't delete
    next(new Error('Can not delete last admin role'));
    return;
  }

  if (await hasUser(role)) { // A user is assigned to this role, don't delete
    next(new Error('Can not delete role which is assigned to a user'));
    return;
  }

  next();
});

const Role = getConnection().model('Role', schema, 'role');

export default Role;
