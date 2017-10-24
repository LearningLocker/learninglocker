import logger from 'lib/logger';
import _ from 'lodash';
import User from 'lib/models/user';
import Organisation from 'lib/models/organisation';
import * as scopes from 'lib/constants/scopes';

async function findOrCreateUser(email, password) {
  logger.info(`Looking for ${email}`);

  const user = await User.findOne({ email });
  if (user) return user;

  logger.info('User not found, creating...');
  if (!password) {
    throw new Error('Password is required on new users');
  }

  return await new User({
    email,
    scopes: [scopes.SITE_ADMIN],
    password,
    verified: true
  }).save();
}

async function findOrCreateOrganisation(user, organisationName) {
  const organisation = await Organisation.findOne({ name: organisationName });
  if (organisation) return organisation;

  logger.info('Organisation not found, creating...');
  return new Organisation({
    name: organisationName,
    owner: user._id
  }).save();
}

async function ensureSiteAdmin(user, password, forceUpdatePassword) {
  if (forceUpdatePassword) user.password = password;
  if (!_.includes(user.scopes, scopes.SITE_ADMIN)) {
    user.scopes.push(scopes.SITE_ADMIN);
    return await user.save();
  }
  return user;
}

async function ensureUserHasOrg(user, organisation) {
  const foundOrg = _.find(user.organisations, org => org.toString() === organisation.name);
  if (foundOrg) return;
  user.organisations.push(organisation._id);
  await user.save();
  return;
}

const addScopeToOrgSettings = (scope, orgSettings) => {
  if (!orgSettings.scopes) {
    orgSettings.scopes = [];
  }
  if (!_.includes(orgSettings.scopes, scope)) {
    orgSettings.scopes.push(scope);
  }
  return orgSettings;
};

async function ensureOrgScopeOnUser(user, org) {
  const existingSettings = user.organisationSettings;
  const hasExistingSetting = _.find(existingSettings, orgSettings =>
     orgSettings.organisation && orgSettings.organisation.toString() === org._id.toString()
  );

  let updatedSettings;
  if (hasExistingSetting) {
    updatedSettings = _.map(existingSettings, addScopeToOrgSettings.bind(null, scopes.ALL));
  } else {
    updatedSettings = existingSettings;
    updatedSettings.push({
      organisation: org._id,
      scopes: [scopes.ALL]
    });
  }
  user.organisationSettings = updatedSettings;
  return await user.save();
}

export const createSiteAdmin = async (email, organisationName, password, options) => {
  const forceUpdatePassword = options.forceUpdatePassword || false;

  if (!(email && organisationName)) {
    throw new Error('Username, password and organisationName required.');
  }

  const user = await findOrCreateUser(email, password);
  const organisation = await findOrCreateOrganisation(user, organisationName);

  await ensureSiteAdmin(user, password, forceUpdatePassword);
  await ensureUserHasOrg(user, organisation);
  await ensureOrgScopeOnUser(user, organisation);
};

export default async function (email, organisationName, password, options) {
  try {
    await createSiteAdmin(email, organisationName, password, options);

    process.exit();
  } catch (error) {
    logger.error(error.message);
    logger.error(error);
    process.exit();
  }
}
