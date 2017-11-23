import includes from 'lodash/includes';
import merge from 'lodash/merge';
import Organisation from 'lib/models/organisation';
import Role from 'lib/models/role';
import User from 'lib/models/user';
import {
  VIEW_PUBLIC_DASHBOARDS,
  VIEW_PUBLIC_VISUALISATIONS,
} from 'lib/constants/orgScopes';
import { ALL, OBSERVER } from 'lib/constants/scopes';

export default async () => {
  const organisations = await Organisation.find({}).exec();
  const rolesPromises = organisations.map(async (org) => {
    const organisation = org._id;
    const admin = await Role.create({
      title: 'Admin',
      owner_id: org.owner,
      organisation,
      scopes: [ALL],
    });
    const observer = await Role.create({
      title: 'Observer',
      owner_id: org.owner,
      organisation,
      scopes: [
        VIEW_PUBLIC_DASHBOARDS,
        VIEW_PUBLIC_VISUALISATIONS,
      ],
    });
    return {
      [organisation.toString()]: {
        adminId: admin._id,
        observerId: observer._id,
      }
    };
  });

  const rolesResults = await Promise.all(rolesPromises);

  const orgRolesMap = merge({}, ...rolesResults);

  console.log(`Creates admin and observer roles for ${organisations.length} orgs`);

  const users = await User.find({}).exec();
  await Promise.all(users.map(async (user) => {
    try {
      const organisationSettings = user.organisationSettings.map((organisationSetting) => {
        const orgId = organisationSetting.organisation.toString();
        const isAdmin = includes(organisationSetting.scopes, ALL);
        const isObserver = includes(organisationSetting.scopes, OBSERVER);
        const orgRoles = orgRolesMap[orgId];
        const roles = [
          ...(orgRoles && isAdmin ? [orgRoles.adminId] : []),
          ...(orgRoles && isObserver ? [orgRoles.observerId] : []),
        ];
        return {
          ...organisationSetting.toObject(),
          roles,
        };
      });
      user.organisationSettings = organisationSettings;
      await user.save();
    } catch (err) {
      console.log('error', user._id);
      console.error(err);
    }
  }));
  console.log(`Updates ${users.length} users`);
  process.exit();
};
