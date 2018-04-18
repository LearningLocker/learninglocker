import Organisation, { EMAIL_NOOP, EMAIL_PROCESSING } from 'lib/models/organisation';
import moment from 'moment';
import { map } from 'bluebird';
import { publish as publishToQueue } from 'lib/services/queue';
import {
  EXPIRATION_NOTIFICATION,
  WEEK_BEFORE_NOTIFICATION,
  EMAIL_EXPIRATION_NOTIFICATION_QUEUE
} from 'lib/constants/expirationNotifications';

export default async function ({
  weekBefore, // for testing, iso string
  publish = publishToQueue, // for testing
  dontExit = false
}) {
  let weekBeforeMoment;
  if (weekBefore) {
    weekBeforeMoment = moment(weekBefore);
  } else {
    weekBeforeMoment = moment().add(1, 'week');
  }

  const todayMoment = moment();

  const weekBeforeDate = weekBeforeMoment.toDate();
  const todayDate = todayMoment.toDate();

  const toSendEmail = await Organisation.find({
    $or: [
      {
        'expirationNotifications.weekBeforeNotificationSent': EMAIL_NOOP,
        expiration: {
          $lt: weekBeforeDate
        }
      },
      {
        'expirationNotifications.expirationNotificationSent': EMAIL_NOOP,
        expiration: {
          $lt: todayDate
        }
      }
    ]
  }).exec();

  await map(toSendEmail, async (organisation) => {
    if (
      weekBeforeMoment.isAfter(moment(organisation.expiration)) &&
      todayMoment.isAfter(moment(organisation.expiration))
    ) {
      if (organisation.expirationNotifications.expirationNotificationSent === EMAIL_NOOP) {
        // send expiration email
        await publish({
          queueName: EMAIL_EXPIRATION_NOTIFICATION_QUEUE,
          payload: {
            organisationId: organisation._id.toString(),
            emailType: EXPIRATION_NOTIFICATION
          }
        });

        organisation.expirationNotifications.expirationNotificationSent = EMAIL_PROCESSING;
        await organisation.save();
      }
    } else if (weekBeforeMoment.isAfter(moment(organisation.expiration))) {
      if (organisation.expirationNotifications.weekBeforeNotificationSent === EMAIL_NOOP) {
        // send week before email
        await publish({
          queueName: EMAIL_EXPIRATION_NOTIFICATION_QUEUE,
          payload: {
            organisationId: organisation._id.toString(),
            emailType: WEEK_BEFORE_NOTIFICATION
          }
        });

        organisation.expirationNotifications.weekBeforeNotificationSent = EMAIL_PROCESSING;
        await organisation.save();
      }
    }
  });
  if (!dontExit) {
    process.exit();
  }
}
