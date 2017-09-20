import logger from 'lib/logger';
import User from 'lib/models/user';
import * as scopes from 'lib/constants/scopes';
import _ from 'lodash';

let stream;

const updateUser = (user, next) => {
  console.log('\n');
  logger.info(`**************** ${user.email} *****************`);
  logger.info('Updating org settings');
  const existingOrgSettings = user.organisationSettings || [];
  const currentUserScopes = _.intersection(user.scopes, _.keys(scopes.USER_SCOPES)) || [];

  logger.info('Existing user scopes:', currentUserScopes);

  // loop through the users orgs
  const newOrgSettings = _.map(user.organisations, (orgId) => {
    // get any existing org settings (if present)
    const existingOS = _.find(existingOrgSettings, eos =>
       eos.organisation && eos.organisation.toString() === orgId.toString()
    );
    // set the existing org setting's scopes (if present)
    let existingOSScopes = [];
    if (existingOS && existingOS.scopes) {
      existingOSScopes = existingOS.scopes;
    }
    // unique merge of the current user scopes and any existing org setting scopes
    const newOSScopes = _.union(existingOSScopes, currentUserScopes);

    // return the new org settings merged with existing org settings
    return {
      organisation: orgId,
      scopes: newOSScopes
    };
  });

  // remove any user scopes from the (now) site scopes value
  const updatedSiteScopes = _.difference(user.scopes, _.keys(scopes.USER_SCOPES)) || [];
  user.scopes = updatedSiteScopes;

  // update the orgsettings with the user scopes
  _.map(newOrgSettings, (os) => {
    logger.info(`Update ${os.organisation.toString()} with scopes`, os.scopes);
  });
  user.organisationSettings = newOrgSettings;

  user.save((err) => {
    if (err) logger.error(err);
    else logger.info('User updated');
    logger.info('************************************************');
    console.log('\n');
    next();
  });
};

const onStreamData = (doc) => {
  stream.pause();
  updateUser(doc, () => {
    stream.resume();
  });
};

const onStreamErr = (err) => {
  logger.error(err);
  process.exit();
};

const onStreamClose = (done) => {
  if (done) {
    done();
  } else {
    process.exit();
  }
};

export default function (done = null) {
  logger.info('Updating user organisation settings...');

  stream = User.find({}).stream();
  stream.on('data', onStreamData)
    .on('error', onStreamErr)
    .on('close', onStreamClose.bind(null, done));
}
