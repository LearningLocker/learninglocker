import logger from 'lib/logger';
import _ from 'lodash';
import User from 'lib/models/user';
import Organisation from 'lib/models/organisation';
import SiteSettings from 'lib/models/siteSettings';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import * as scopes from 'lib/constants/scopes';
import mongoose from 'mongoose';

const objectId = mongoose.Types.ObjectId;

async function findOrCreateUser(email, password) {
  logger.info(`Looking for ${email}`);

  const user = await User.findOne({ email });
  if (user) {
    logger.info('User already exists');
    return user;
  }

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
  if (organisation) {
    logger.info('Organisation already exists');
    return organisation;
  }

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

  logger.info('Adding user to organisation');
  try {
    await ensureSiteAdmin(user, password, forceUpdatePassword);
    await ensureUserHasOrg(user, organisation);
    await ensureOrgScopeOnUser(user, organisation);
  } catch (err) {
    logger.debug('Expected errors thrown here', err);
  }
};

const checkSiteSettings = async () => {
  try {
    await new SiteSettings({
      _id: objectId(SITE_SETTINGS_ID)
    }).save();
  } catch (err) {
    if (err.code === 11000) return;
    logger.error(err);
  }
};

export default async function (email, organisationName, password, options) {
  try {
    await checkSiteSettings();
    await createSiteAdmin(email, organisationName, password, options);
    logger.info('Done!');
    process.exit();
  } catch (error) {
    logger.error(error.message);
    process.exit();
  }
}
