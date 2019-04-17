import { getConnection } from 'lib/connections/mongoose';
import { EMAIL_NOOP } from 'lib/models/organisation';

const up = async () => {
  const connection = getConnection();

  await connection.collection('organisations').updateMany({
    expirationNotifications: { $exists: false }
  }, {
    $set: {
      expirationNotifications: {
        expirationNotificationSent: EMAIL_NOOP,
        weekBeforeNotificationSent: EMAIL_NOOP
      }
    }
  }, {
    upsert: false
  });
};

const down = async () => {
  const connection = getConnection();

  await connection.collection('organisation').updateMany({}, {
    $unset: {
      expirationNotifications: ''
    }
  }, {
    upsert: false
  });
};

export default { up, down };
