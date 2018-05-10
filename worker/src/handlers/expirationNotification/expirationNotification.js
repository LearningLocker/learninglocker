import { map } from 'bluebird';
import logger from 'lib/logger';
import Users from 'lib/models/user';
import Organisation, { EMAIL_SENT } from 'lib/models/organisation';
import {
  WEEK_BEFORE_NOTIFICATION,
  EXPIRATION_NOTIFICATION
} from 'lib/constants/expirationNotifications';
import {
  sendOrganisationAboutToExpire,
  sendOrganisationExpired
} from 'lib/helpers/email';

export default async ({ organisationId, emailType }, jobDone) => {
  // get all users in an org
  const users = await Users.find({
    organisations: {
      $in: [organisationId]
    }
  }).exec();

  const organisation = await Organisation.findById(organisationId);

  try {
    await map(users, async (user) => {
      // send the email
      if (emailType === WEEK_BEFORE_NOTIFICATION) {
        await sendOrganisationAboutToExpire(user, organisation);
      } else if (emailType === EXPIRATION_NOTIFICATION) {
        await sendOrganisationExpired(user, organisation);
      }
    });
  } catch (err) {
    logger.error(err);
  }

  if (emailType === WEEK_BEFORE_NOTIFICATION) {
    organisation.expirationNotifications.weekBeforeNotificationSent = EMAIL_SENT;
  } else if (emailType === EXPIRATION_NOTIFICATION) {
    organisation.expirationNotifications.expirationNotificationSent = EMAIL_SENT;
  }
  await organisation.save();

  jobDone();
};
