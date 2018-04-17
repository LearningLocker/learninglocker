import { getConnection } from 'lib/connections/mongoose';
import { EMAIL_NOOP } from 'lib/models/organisation';

const up = async () => {
  const connection = getConnection();

  await connection.collection('organisations').update({
    expirationNotifications: { $exists: false }
  }, {
    $set: {
      expirationNotifications: {
        expirationNotificationSent: EMAIL_NOOP,
        weekBeforeNotificationSent: EMAIL_NOOP
      }
    }
  }, {
    upsert: false,
    multi: true
  });
};

const down = async () => {
  const connection = getConnection();

  await connection.collection('organisation').update({}, {
    $unset: {
      expirationNotifications: ''
    }
  }, {
    upsert: false,
    multi: true
  });
};

export default { up, down };
